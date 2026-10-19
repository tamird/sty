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
    pub analysis: AnalysisOptions,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct AnalysisOptions {
    pub strict_generic_narrowing: Option<bool>,
}

#[derive(Clone, Debug)]
pub(super) struct ConfigOverride {
    rules: BTreeMap<String, String>,
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
            analysis,
        } = table.try_into()?;
        anyhow::ensure!(
            !rules.is_empty() || analysis.strict_generic_narrowing.is_some(),
            "configuration override must contain at least one rules or analysis setting"
        );
        starpls_ide::DiagnosticRules::from_settings(&rules)?;
        Ok(Self { rules, analysis })
    }
}

impl ConfigOverride {
    pub(super) fn apply(&self, config: &mut ProjectConfig) {
        let Self {
            rules,
            analysis: AnalysisOptions {
                strict_generic_narrowing,
            },
        } = self;
        config.rules.extend(rules.clone());
        if let Some(value) = strict_generic_narrowing {
            config.analysis.strict_generic_narrowing = Some(*value);
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
