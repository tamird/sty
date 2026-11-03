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
    pub stub_packages: Option<Vec<super::stub_package::StubPackage>>,
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
    #[serde(skip)]
    directory: PathBuf,
    include: Vec<String>,
    rules: BTreeMap<String, String>,
}

impl FileOverride {
    pub(super) fn by_file(
        overrides: &[Self],
        mut external_source: impl FnMut(&str) -> anyhow::Result<PathBuf>,
    ) -> anyhow::Result<starpls_ide::FileRuleOverrides> {
        let mut layers = starpls_ide::FileRuleOverrides::default();
        for Self {
            include,
            rules,
            directory,
        } in overrides
        {
            anyhow::ensure!(
                !include.is_empty(),
                "overrides.include requires at least one file"
            );
            anyhow::ensure!(
                !rules.is_empty(),
                "overrides.rules requires at least one rule"
            );
            let mut paths = Vec::new();
            for name in include {
                let metacharacters = name.contains(['*', '?', '[', ']']);
                let path = if name.starts_with('@') {
                    anyhow::ensure!(
                        !metacharacters
                            && !name.contains(['\\', '\0'])
                            && !name.starts_with("@@")
                            && !name.starts_with("@//"),
                        "expected an apparent Bazel repository and a literal file in {name:?}"
                    );
                    starpls_ide::RulePath::Exact(external_source(name)?)
                } else {
                    let path = Path::new(name);
                    anyhow::ensure!(
                        !name.contains([':', '\\', '\0'])
                            && !name.ends_with('/')
                            && path.file_name().is_some()
                            && path.components().all(|part| matches!(
                                part,
                                std::path::Component::Normal(_) | std::path::Component::CurDir
                            )),
                        "overrides.include expects a workspace-relative path, got {name:?}"
                    );
                    if metacharacters {
                        let normalized = name
                            .split('/')
                            .filter(|part| !part.is_empty() && *part != ".")
                            .collect::<Vec<_>>()
                            .join("/");
                        starpls_ide::RulePath::pattern(directory, &normalized).with_context(
                            || format!("invalid overrides.include pattern {name:?}"),
                        )?
                    } else {
                        starpls_ide::RulePath::Exact(starpls_common::absolute_path(
                            &directory.join(path),
                        )?)
                    }
                };
                paths.push(path);
            }
            layers.push(paths, rules)?;
        }
        Ok(layers)
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
        self.analysis.apply_to(config);
    }
}

impl AnalysisOptions {
    fn apply_to(&self, config: &mut Self) {
        let Self {
            strict_generic_narrowing,
            widen_singleton_collection_elements,
            require_valid_suppressions,
            static_json_decode,
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

/// Per-workspace inputs plus policy from the enclosing checkout.
#[derive(Default)]
pub(super) struct WorkspaceConfig {
    pub rules: Vec<BTreeMap<String, String>>,
    pub overrides: Vec<FileOverride>,
    pub analysis: AnalysisOptions,
    pub bazel: BazelOptions,
    pub type_interfaces: BTreeMap<PathBuf, PathBuf>,
    pub stub_packages: Vec<super::stub_package::StubPackage>,
    pub stub_config: PathBuf,
}

impl WorkspaceConfig {
    pub(super) fn load(loader: &DefaultFileLoader, workspace: &Path) -> anyhow::Result<Self> {
        // A submodule and a linked worktree each have their own .git file.
        // Outside a checkout, only the Bazel workspace owns configuration.
        let root = workspace
            .ancestors()
            .find(|dir| dir.join(".git").exists())
            .unwrap_or(workspace);
        let directories: Vec<_> = workspace
            .ancestors()
            .take_while(|dir| dir.starts_with(root))
            .collect();
        let mut result = Self::default();
        for directory in directories.into_iter().rev() {
            let path = directory.join("sty.toml");
            // read_manifest also watches missing files for creation in the editor.
            let contents = match loader.read_manifest(&path) {
                Ok(contents) => contents,
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => continue,
                Err(error) => {
                    return Err(error).with_context(|| format!("cannot read {}", path.display()))
                }
            };
            let context = || format!("invalid configuration {}", path.display());
            let ProjectConfig {
                rules,
                mut overrides,
                analysis,
                bazel,
                type_interfaces,
                stub_packages,
            } = toml::from_str(&contents).with_context(context)?;
            starpls_ide::DiagnosticRules::from_settings(&rules).with_context(context)?;
            result.rules.push(rules);
            analysis.apply_to(&mut result.analysis);
            for override_ in &mut overrides {
                override_.directory = directory.to_path_buf();
            }
            result.overrides.extend(overrides);
            let local = directory == workspace;
            if let Some(mut packages) = stub_packages {
                // Local manifests and // labels describe the declaring workspace.
                // Apparent external names resolve through each workspace's MODULE.
                if !local {
                    packages.retain(super::stub_package::StubPackage::is_external);
                }
                result.stub_config = path;
                result.stub_packages = packages;
            }
            if local {
                result.bazel = bazel;
                result.type_interfaces = type_interfaces;
            }
        }
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::FileOverride;

    #[test]
    fn nested_workspaces_share_policy_within_the_checkout() {
        use std::fs;
        use std::sync::Arc;

        use crate::document::source_tests::TestBazelClient;
        use crate::document::DefaultFileLoader;

        let outside = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("nested-config");
        let repo = outside.join("checkout");
        let workspace = repo.join("plugins/gazelle");
        fs::create_dir_all(&workspace).unwrap();
        fs::write(repo.join(".git"), "gitdir: ../linked-worktree").unwrap();
        fs::write(outside.join("sty.toml"), "invalid!").unwrap();
        fs::write(
            repo.join("sty.toml"),
            r#"
            [rules]
            strict = "error"
            [analysis]
            require-valid-suppressions = true
            static-json-decode = true
            [bazel]
            builtins = "root-only.bzli"
            [type-interfaces]
            "defs.bzl" = "defs.bzli"
            [[overrides]]
            include = ["plugins/gazelle/defs.bzl"]
            [overrides.rules]
            non-static-type = "warn"
            [[stub-packages]]
            manifest = "@common//:stubs.toml"
            [[stub-packages]]
            manifest = "//local:stubs.toml"
        "#,
        )
        .unwrap();
        let (sender, _) = crossbeam_channel::unbounded();
        let loader = DefaultFileLoader::new(
            Arc::new(TestBazelClient::default()),
            workspace.clone(),
            None,
            None,
            sender,
            false,
        );
        let load = || super::WorkspaceConfig::load(&loader, &workspace).unwrap();
        let config = load();
        assert_eq!(config.rules[0]["strict"], "error");
        assert_eq!(config.stub_packages.len(), 1);
        assert_eq!(config.stub_config, repo.join("sty.toml"));
        assert!(config.type_interfaces.is_empty());
        assert!(config.bazel.builtins.is_none());
        assert_eq!(config.overrides[0].directory, repo);
        assert!(loader
            .configuration_inputs()
            .contains_key(&workspace.join("sty.toml")));
        fs::write(
            workspace.join("sty.toml"),
            r#"
            stub-packages = []
            [rules]
            non-static-type = "warn"
            [analysis]
            static-json-decode = false
        "#,
        )
        .unwrap();
        let config = load();
        assert_eq!(config.rules.len(), 2);
        assert_eq!(config.rules[1]["non-static-type"], "warn");
        assert_eq!(config.analysis.require_valid_suppressions, Some(true));
        assert_eq!(config.analysis.static_json_decode, Some(false));
        assert!(config.stub_packages.is_empty());
        fs::create_dir(workspace.join(".git")).unwrap();
        let isolated = load();
        assert_eq!(isolated.rules.len(), 1);
        assert_eq!(isolated.analysis.require_valid_suppressions, None);
    }

    #[test]
    fn file_rule_overrides_reject_malformed_or_escaping_paths() {
        for name in [
            "../package/BUILD",
            "/BUILD",
            "[broken.bzl",
            "foo/",
            "@rules//:*.bzl",
            "@@rules+//:defs.bzl",
            "@//:defs.bzl",
        ] {
            let setting = FileOverride {
                directory: "/repo".into(),
                include: vec![name.to_owned()],
                rules: [("strict".to_owned(), "warn".to_owned())].into(),
            };
            let error = FileOverride::by_file(&[setting], |_| unreachable!()).unwrap_err();
            assert!(error.to_string().contains(name));
        }
    }
}
