use anyhow::anyhow;
use log::debug;
use log::info;
use starpls_bazel::client::BazelClient;
use starpls_bazel::client::BazelInfo;
use starpls_bazel::env::BazelVersion;

use crate::server::load_bazel_build_language;

/// Contains information about the current Bazel configuration as fetched from
/// various `bazel info` commands.
#[derive(Default)]
pub(crate) struct BazelContext {
    pub(crate) info: BazelInfo,
    pub(crate) rules: starpls_bazel::build::BuildLanguage,
    pub(crate) bzlmod_enabled: bool,
    pub(crate) main_repo_mapping: starpls_bazel::client::RepoMapping,
}

impl BazelContext {
    pub(crate) fn new(client: &dyn BazelClient) -> anyhow::Result<BazelContext> {
        let info = client
            .info()
            .map_err(|err| anyhow!("failed to run `bazel info`: {}", err))?;

        info!("workspace root: {:?}", info.workspace);
        info!("workspace name: {:?}", info.workspace_name);
        info!("starlark-semantics: {:?}", info.starlark_semantics);

        // Check if bzlmod is enabled for the current workspace.
        let bzlmod_enabled = {
            // bzlmod is enabled by default for Bazel versions 7 and later.
            let bzlmod_enabled_by_default = info.release.starts_with("development")
                || BazelVersion::parse_release(&info.release)
                    .is_some_and(|version| version.at_least(7, 0));

            if bzlmod_enabled_by_default {
                info!("Bazel 7 or later detected");
            }

            // starlark-semantics reports nondefault values, which override the
            // default inferred from the release.
            if info.starlark_semantics.contains("enable_bzlmod=true") {
                info!("found enable_bzlmod=true in starlark semantics");
                true
            } else if info.starlark_semantics.contains("enable_bzlmod=false") {
                info!("found enable_bzlmod=false in starlark semantics");
                false
            } else {
                bzlmod_enabled_by_default
            }
        };

        info!("bzlmod_enabled = {}", bzlmod_enabled);

        // If bzlmod is enabled, we also need to check if the `bazel mod dump_repo_mapping` command is supported.
        let main_repo_mapping = if bzlmod_enabled {
            debug!("fetching the main repository mapping");
            client
                .dump_repo_mapping("")
                .map_err(|err| anyhow!("failed to run `bazel mod dump_repo_mapping`: {}", err))?
        } else {
            Default::default()
        };

        debug!("fetching builtin rules via `bazel info build-language`");
        let rules = load_bazel_build_language(client)
            .map_err(|err| anyhow!("failed to run `bazel info build-language`: {}", err))?;

        Ok(BazelContext {
            info,
            rules,
            bzlmod_enabled,
            main_repo_mapping,
        })
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use starpls_bazel::client::RepoMapping;

    use super::BazelContext;
    use crate::document::source_tests::TestBazelClient;

    #[test]
    fn bzlmod_configuration_controls_repository_mapping() {
        for (release, starlark_semantics, enabled) in [
            ("release 6.4.0", "", false),
            ("release 6.4.0", "enable_bzlmod=true", true),
            ("release 7.0.0", "", true),
            ("release 7.0.0", "enable_bzlmod=false", false),
            ("release 8.0.0", "", true),
            ("release 9.0.0", "", true),
            ("release 9.4.0-dzbarsky3", "", true),
            ("release 10.0.0rc1", "", true),
            ("release 11.0.0", "", true),
            ("development version", "", true),
            ("development version", "enable_bzlmod=false", false),
            ("unknown", "", false),
            ("unknown", "enable_bzlmod=true", true),
        ] {
            let mapping: RepoMapping = Arc::new([("rules".to_owned(), "rules+".to_owned())].into());
            let client = TestBazelClient {
                release: release.to_owned(),
                starlark_semantics: format!("StarlarkSemantics{{{starlark_semantics}}}"),
                repository_mappings: [(String::new(), mapping.clone())].into(),
                ..Default::default()
            };
            let context = BazelContext::new(&client).unwrap();
            let case = format!("{release}, {starlark_semantics}");
            assert_eq!(context.bzlmod_enabled, enabled, "{case}");
            if enabled {
                assert_eq!(context.main_repo_mapping, mapping, "{case}");
                assert_eq!(
                    *client.mapping_requests.lock().unwrap(),
                    [vec![String::new()]],
                    "{case}"
                );
            } else {
                assert!(context.main_repo_mapping.is_empty(), "{case}");
                assert!(client.mapping_requests.lock().unwrap().is_empty(), "{case}");
            }
        }
    }
}
