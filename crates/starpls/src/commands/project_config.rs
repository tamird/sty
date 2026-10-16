use std::collections::BTreeMap;
use std::path::Path;
use std::path::PathBuf;

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

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct AnalysisOptions {
    #[serde(default)]
    pub strict_generic_narrowing: bool,
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
