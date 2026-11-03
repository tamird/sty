use std::collections::BTreeMap;
use std::path::Path;
use std::path::PathBuf;
use std::str::FromStr;

use anyhow::Context;
use serde::Deserialize;

use crate::document::DefaultFileLoader;

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct ProjectConfig {
    #[serde(default)]
    pub stub_packages: Vec<super::stub_package::StubPackage>,
    #[serde(default)]
    pub type_interfaces: BTreeMap<PathBuf, PathBuf>,
    #[serde(default)]
    pub rules: BTreeMap<String, String>,
    #[serde(default)]
    pub overrides: Vec<FileOverride>,
    #[serde(default)]
    pub analysis: AnalysisOptions,
    #[serde(default)]
    pub bazel: BazelOptions,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct FileOverride {
    include: Vec<String>,
    rules: BTreeMap<String, String>,
}

impl FileOverride {
    /// Group layers by exact source path so checking a file needs only a lookup.
    pub(super) fn by_file<'a>(
        overrides: &'a [Self],
        workspace: &Path,
        mut external_source: impl FnMut(&str) -> anyhow::Result<PathBuf>,
    ) -> anyhow::Result<BTreeMap<PathBuf, Vec<&'a BTreeMap<String, String>>>> {
        let mut by_file = BTreeMap::<_, Vec<_>>::new();
        for Self { include, rules } in overrides {
            anyhow::ensure!(
                !include.is_empty(),
                "overrides.include requires at least one file"
            );
            anyhow::ensure!(
                !rules.is_empty(),
                "overrides.rules requires at least one rule"
            );
            for name in include {
                anyhow::ensure!(
                    !name.contains(['*', '?', '[', ']', '\\', '\0']),
                    "overrides.include expects a literal file, got {name:?}"
                );
                let path = if name.starts_with('@') {
                    anyhow::ensure!(
                        !name.starts_with("@@") && !name.starts_with("@//"),
                        "expected an apparent Bazel repository in {name:?}"
                    );
                    external_source(name)?
                } else {
                    let path = Path::new(name);
                    anyhow::ensure!(
                        !name.contains(':')
                            && !name.ends_with('/')
                            && path.file_name().is_some()
                            && path.components().all(|part| matches!(
                                part,
                                std::path::Component::Normal(_) | std::path::Component::CurDir
                            )),
                        "overrides.include expects an exact workspace-relative file, got {name:?}"
                    );
                    starpls_common::absolute_path(&workspace.join(path))?
                };
                by_file.entry(path).or_default().push(rules);
            }
        }
        Ok(by_file)
    }
}

#[derive(Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct BazelOptions {
    pub builtins: Option<PathBuf>,
}

#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct AnalysisOptions {
    pub strict_generic_narrowing: Option<bool>,
    pub widen_singleton_collection_elements: Option<bool>,
    pub require_valid_suppressions: Option<bool>,
    pub static_json_decode: Option<bool>,
}

#[derive(Clone, Debug)]
pub(super) struct ConfigOverride {
    pub(super) rules: BTreeMap<String, String>,
    analysis: AnalysisOptions,
}

impl FromStr for ConfigOverride {
    type Err = anyhow::Error;

    fn from_str(value: &str) -> anyhow::Result<Self> {
        let table: toml::Table = toml::from_str(value)?;
        for section in table.keys() {
            anyhow::ensure!(
                matches!(section.as_str(), "rules" | "analysis"),
                "configuration overrides support rules and analysis, not {section:?}"
            );
        }
        let ProjectConfig {
            stub_packages: _,
            type_interfaces: _,
            rules,
            overrides: _,
            analysis,
            bazel: _,
        } = table.try_into()?;
        anyhow::ensure!(
            !rules.is_empty() || analysis != AnalysisOptions::default(),
            "configuration override must contain at least one rules or analysis setting"
        );
        starpls_ide::DiagnosticRules::from_settings(&rules)?;
        Ok(Self { rules, analysis })
    }
}

impl ConfigOverride {
    pub(super) fn apply_analysis(&self, config: &mut AnalysisOptions) {
        let Self {
            rules: _,
            analysis:
                AnalysisOptions {
                    strict_generic_narrowing,
                    widen_singleton_collection_elements,
                    require_valid_suppressions,
                    static_json_decode,
                },
        } = self;
        if let Some(value) = strict_generic_narrowing {
            config.strict_generic_narrowing = Some(*value);
        }
        if let Some(value) = widen_singleton_collection_elements {
            config.widen_singleton_collection_elements = Some(*value);
        }
        if let Some(value) = require_valid_suppressions {
            config.require_valid_suppressions = Some(*value);
        }
        if let Some(value) = static_json_decode {
            config.static_json_decode = Some(*value);
        }
    }
}

impl ProjectConfig {
    pub(super) fn load(loader: &DefaultFileLoader, workspace: &Path) -> anyhow::Result<Self> {
        let path = workspace.join("sty.toml");
        loader.watch_manifest(&path);
        let contents = match loader.read_manifest(&path) {
            Ok(contents) => contents,
            Err(error) => {
                if error.kind() == std::io::ErrorKind::NotFound {
                    return Ok(Self::default());
                }
                return Err(error).with_context(|| format!("cannot read {}", path.display()));
            }
        };
        toml::from_str(&contents)
            .with_context(|| format!("invalid configuration {}", path.display()))
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::FileOverride;

    #[test]
    fn file_rule_overrides_reject_nonliteral_or_escaping_paths() {
        for name in [
            "../package/BUILD",
            "/BUILD",
            "*.bzl",
            "foo/",
            "@rules//:*.bzl",
            "@@rules+//:defs.bzl",
            "@//:defs.bzl",
        ] {
            let setting = FileOverride {
                include: vec![name.to_owned()],
                rules: [("strict".to_owned(), "warn".to_owned())].into(),
            };
            let error = FileOverride::by_file(&[setting], Path::new("/repo"), |_| unreachable!())
                .unwrap_err();
            assert!(error.to_string().contains(name));
        }
    }
}
