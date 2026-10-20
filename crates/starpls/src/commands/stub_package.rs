use std::collections::BTreeMap;
use std::path::Path;
use std::path::PathBuf;

use anyhow::bail;
use anyhow::Context;
use serde::Deserialize;
use starpls_bazel::Label;

use crate::document::DefaultFileLoader;
use crate::document::Repository;
use crate::document::RepositoryFetchResult;

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
pub(super) struct StubPackage {
    manifest: String,
    #[serde(default)]
    allow_unversioned: bool,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields, rename_all = "kebab-case")]
struct Manifest {
    format_version: u32,
    source: Option<Source>,
    files: BTreeMap<PathBuf, PathBuf>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Source {
    repository: String,
    module: String,
    versions: Vec<String>,
}

struct Package {
    selection: StubPackage,
    path: PathBuf,
    repository: Repository,
}

impl Package {
    fn context(&self, config: &Path) -> String {
        format!(
            "stub package {:?} in {}",
            self.selection.manifest,
            config.display()
        )
    }
}

#[derive(Debug)]
pub(super) struct Registration {
    pub(super) source: PathBuf,
    pub(super) interface: PathBuf,
    pub(super) origin: String,
}

pub(super) fn load(
    loader: &DefaultFileLoader,
    workspace: &Path,
    stub_packages: Vec<StubPackage>,
) -> anyhow::Result<Vec<Registration>> {
    let path = workspace.join("sty.toml");
    let mut packages = stub_packages
        .into_iter()
        .map(|selection| {
            let (path, repository) = manifest_location(loader, workspace, &selection.manifest)
                .with_context(|| {
                    format!(
                        "stub package {:?} in {}",
                        selection.manifest,
                        path.display()
                    )
                })?;
            Ok(Package {
                selection,
                path,
                repository,
            })
        })
        .collect::<anyhow::Result<Vec<_>>>()?;
    fetch_repositories(
        loader,
        &path,
        packages
            .iter()
            .map(|package| (package, &package.repository)),
    )?;
    let manifests = packages
        .iter_mut()
        .map(|package| read_manifest(loader, package).with_context(|| package.context(&path)))
        .collect::<anyhow::Result<Vec<_>>>()?;
    let mappings = packages
        .iter()
        .zip(&manifests)
        .filter(|(_, manifest)| {
            manifest
                .source
                .as_ref()
                .is_some_and(|source| !source.repository.starts_with("@@"))
        })
        .map(|(package, _)| package.repository.name.clone())
        .collect::<Vec<_>>();
    loader.prepare_repository_mappings(&mappings);
    let sources = packages
        .iter()
        .zip(&manifests)
        .map(|(package, manifest)| {
            manifest
                .source
                .as_ref()
                .map(|source| source_repository(loader, package, source))
                .transpose()
                .with_context(|| package.context(&path))
        })
        .collect::<anyhow::Result<Vec<_>>>()?;
    fetch_repositories(
        loader,
        &path,
        packages
            .iter()
            .zip(&sources)
            .filter_map(|(package, source)| source.as_ref().map(|source| (package, source))),
    )?;
    let mut files = Vec::new();
    for ((package, manifest), source) in packages.iter().zip(manifests).zip(sources) {
        let source = source.as_ref().unwrap_or(&package.repository);
        let registrations = register_files(loader, package, manifest.files, source)
            .with_context(|| package.context(&path))?;
        files.extend(registrations);
    }
    Ok(files)
}

fn fetch_repositories<'a>(
    loader: &DefaultFileLoader,
    config: &Path,
    repositories: impl Iterator<Item = (&'a Package, &'a Repository)>,
) -> anyhow::Result<()> {
    let mut packages = indexmap::IndexMap::new();
    for (package, repository) in repositories {
        if !repository.name.is_empty() {
            packages.entry(repository.name.clone()).or_insert(package);
        }
    }
    let names = packages.keys().cloned().collect::<Vec<_>>();
    for RepositoryFetchResult { name, result } in loader.fetch_repositories(&names, |_| {}) {
        result
            .map_err(anyhow::Error::msg)
            .with_context(|| packages[&name].context(config))?;
    }
    Ok(())
}

fn manifest_location(
    loader: &DefaultFileLoader,
    workspace: &Path,
    manifest: &str,
) -> anyhow::Result<(PathBuf, Repository)> {
    let main = loader.main_repository();
    let (path, repository) =
        if manifest.starts_with('@') || manifest.starts_with("//") || manifest.starts_with(':') {
            let label = Label::parse(manifest)
                .map_err(|error| error.err)
                .context("invalid manifest label")?;
            let repository = loader.resolve_repository(&label, &main)?;
            let path = repository.root.join(label.package()).join(label.target());
            (path, repository)
        } else {
            if Path::new(manifest).is_absolute() {
                bail!("manifest path must be relative to sty.toml");
            }
            (workspace.join(manifest), main)
        };
    Ok((path, repository))
}

fn read_manifest(loader: &DefaultFileLoader, package: &mut Package) -> anyhow::Result<Manifest> {
    let Package {
        selection,
        path,
        repository,
    } = package;
    loader.watch_manifest(path);
    *path = contained_file(path, &repository.root)?;
    loader.watch_manifest(path);
    let contents = loader
        .read_manifest(path)
        .with_context(|| format!("cannot read manifest {}", path.display()))?;
    let manifest: Manifest = toml::from_str(&contents)
        .with_context(|| format!("invalid manifest {}", path.display()))?;
    if manifest.format_version != 1 {
        bail!(
            "unsupported stub manifest format-version {}; expected 1",
            manifest.format_version
        );
    }
    let Some(Source {
        repository: source_repository,
        module,
        versions,
    }) = &manifest.source
    else {
        if selection.allow_unversioned {
            bail!("allow-unversioned requires an explicit source repository");
        }
        return Ok(manifest);
    };
    if module.is_empty() || versions.is_empty() || versions.iter().any(String::is_empty) {
        bail!("source.module and source.versions must contain nonempty names and versions");
    }
    if !source_repository.starts_with('@') || source_repository.contains(['/', ':']) {
        bail!("source.repository must name a Bazel repository, such as @rules_foo");
    }
    Ok(manifest)
}

fn source_repository(
    loader: &DefaultFileLoader,
    package: &Package,
    source: &Source,
) -> anyhow::Result<Repository> {
    let Source {
        repository: source_repository,
        module,
        versions,
    } = source;
    let source_label = format!("{source_repository}//:__stub_source__");
    let source_label = Label::parse(&source_label)
        .map_err(|error| error.err)
        .context("invalid source.repository")?;
    let source_repository = loader.resolve_repository(&source_label, &package.repository)?;
    let selected = loader.selected_module(&source_repository)?;
    if let Some(selected) = &selected {
        if selected.name != *module {
            bail!(
                "repository @@{} selects module {:?}, but the stub package requires {:?}",
                source_repository.name,
                selected.name,
                module
            );
        }
    }
    match selected.and_then(|module| module.version) {
        Some(version) => {
            if !versions.contains(&version) {
                bail!(
                    "module {module} selected version {version}, but the stub package accepts {}",
                    versions.join(", ")
                );
            }
        }
        None => {
            // Co-located source and stubs belong to the same selected artifact,
            // including Git overrides for which Bazel omits the module version.
            if source_repository != package.repository && !package.selection.allow_unversioned {
                bail!("repository @@{} has no selected module version; set allow-unversioned = true for this stub package to accept it", source_repository.name);
            }
        }
    }
    Ok(source_repository)
}

fn register_files(
    loader: &DefaultFileLoader,
    package: &Package,
    files: BTreeMap<PathBuf, PathBuf>,
    source_repository: &Repository,
) -> anyhow::Result<Vec<Registration>> {
    let Package {
        selection: _,
        path,
        repository,
    } = package;
    let directory = path.parent().context("manifest has no parent directory")?;
    let mut registrations = Vec::with_capacity(files.len());
    for (source, interface) in files {
        if source.is_absolute() || interface.is_absolute() {
            bail!("stub file mappings must use relative paths");
        }
        let origin = format!("{} [{:?}]", path.display(), source);
        let source = contained_file(
            &source_repository.root.join(source),
            &source_repository.root,
        )?;
        let interface = contained_file(&directory.join(interface), &repository.root)?;
        let source = loader.register_path(&source, source_repository)?;
        let interface = loader.register_path(&interface, repository)?;
        registrations.push(Registration {
            source,
            interface,
            origin,
        });
    }
    Ok(registrations)
}

fn contained_file(path: &Path, root: &Path) -> anyhow::Result<PathBuf> {
    let path = starpls_common::absolute_path(path)?;
    let root = starpls_common::absolute_path(root)?;
    if !path.starts_with(&root) {
        bail!(
            "{} is outside repository {}",
            path.display(),
            root.display()
        );
    }
    let metadata = path
        .metadata()
        .with_context(|| format!("cannot resolve {}", path.display()))?;
    if !metadata.is_file() {
        bail!("{} must be a file", path.display());
    }
    Ok(path)
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use starpls_bazel::client::SelectedModule;

    use crate::document::source_tests::TestBazelClient;
    use crate::document::DefaultFileLoader;

    #[test]
    fn unversioned_stubs_require_the_same_repository() {
        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("stub-package-version-identity");
        for (source, version, module, allow_unversioned, expected_error) in [
            ("rules+", None, "rules", false, None),
            (
                "other+",
                None,
                "rules",
                false,
                Some("has no selected module version"),
            ),
            ("other+", None, "rules", true, None),
            (
                "rules+",
                Some("2"),
                "rules",
                false,
                Some("selected version 2"),
            ),
            ("rules+", None, "other", false, Some("requires \"rules\"")),
        ] {
            let external = root.join("external");
            let mut client = TestBazelClient::default();
            client.repository_mappings.insert(
                "rules+".into(),
                Arc::new([("renamed".into(), source.into())].into()),
            );
            client.selected_modules.insert(
                source.into(),
                SelectedModule {
                    name: module.into(),
                    version: version.map(str::to_owned),
                },
            );
            let (sender, _) = crossbeam_channel::unbounded();
            let loader = DefaultFileLoader::new(
                Arc::new(client),
                root.clone(),
                None,
                external,
                sender,
                true,
            );
            let package = super::Package {
                selection: super::StubPackage {
                    manifest: "@@rules+//:stubs.toml".into(),
                    allow_unversioned,
                },
                path: root.join("external/rules+/stubs.toml"),
                repository: loader.canonical_repository("rules+".into()).unwrap(),
            };
            let source = super::Source {
                repository: "@renamed".into(),
                module: "rules".into(),
                versions: vec!["1".into()],
            };
            let result = super::source_repository(&loader, &package, &source);
            match expected_error {
                Some(expected) => {
                    let error = result.unwrap_err().to_string();
                    assert!(error.contains(expected), "{error}");
                }
                None => assert!(result.is_ok(), "{result:?}"),
            }
        }
    }

    #[test]
    fn packages_batch_fetches_and_resolve_each_manifest_namespace() {
        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("stub-package-batches");
        for (bzlmod, canonical) in [(true, false), (true, true), (false, false)] {
            let workspace = root.join(format!("{bzlmod}-{canonical}"));
            let external = workspace.join("external");
            let mut client = TestBazelClient::default();
            let mut config = String::new();
            for name in ["one", "two"] {
                let stubs = format!("stubs_{name}");
                let source = format!("rules_{name}");
                let directory = external.join(&stubs);
                std::fs::create_dir_all(&directory).unwrap();
                std::fs::write(directory.join("defs.bzli"), "def value() -> int: ...\n").unwrap();
                config += &format!(
                    "[[stub-packages]]\nmanifest = '@@{stubs}//:stubs.toml'\nallow-unversioned = true\n"
                );
                let source_name = if canonical {
                    format!("@@{source}")
                } else if bzlmod {
                    "@dep".into()
                } else {
                    format!("@{source}")
                };
                let manifest = format!(
                    "format-version = 1\n[source]\nrepository = '{source_name}'\nmodule = '{name}'\nversions = ['1']\n[files]\n'defs.bzl' = 'defs.bzli'\n"
                );
                client
                    .fetch_files
                    .get_mut()
                    .unwrap()
                    .insert(stubs.clone(), (directory.join("stubs.toml"), manifest));
                client.fetch_files.get_mut().unwrap().insert(
                    source.clone(),
                    (
                        external.join(&source).join("defs.bzl"),
                        "def value(): return 1\n".into(),
                    ),
                );
                client
                    .repository_mappings
                    .insert(stubs, Arc::new([("dep".into(), source.clone())].into()));
                client.selected_modules.insert(
                    source,
                    SelectedModule {
                        name: name.into(),
                        version: Some("1".into()),
                    },
                );
            }
            std::fs::write(workspace.join("sty.toml"), config).unwrap();
            let client = Arc::new(client);
            let (sender, _) = crossbeam_channel::unbounded();
            let loader = DefaultFileLoader::new(
                client.clone(),
                workspace.clone(),
                None,
                external.clone(),
                sender,
                bzlmod,
            );
            let config =
                crate::commands::project_config::ProjectConfig::load(&loader, &workspace).unwrap();
            let registrations = super::load(&loader, &workspace, config.stub_packages).unwrap();
            assert_eq!(
                registrations
                    .iter()
                    .map(|registration| &registration.source)
                    .collect::<Vec<_>>(),
                [
                    &external.join("rules_one/defs.bzl"),
                    &external.join("rules_two/defs.bzl")
                ]
            );
            assert_eq!(
                registrations
                    .iter()
                    .map(|registration| &registration.interface)
                    .collect::<Vec<_>>(),
                [
                    &external.join("stubs_one/defs.bzli"),
                    &external.join("stubs_two/defs.bzli")
                ]
            );
            let expected_fetches = if bzlmod {
                vec![
                    vec!["stubs_one", "stubs_two"],
                    vec!["rules_one", "rules_two"],
                ]
            } else {
                vec![
                    vec!["stubs_one"],
                    vec!["stubs_two"],
                    vec!["rules_one"],
                    vec!["rules_two"],
                ]
            };
            assert_eq!(*client.fetch_batches.lock().unwrap(), expected_fetches);
            let expected_mappings = if bzlmod && !canonical {
                vec![vec!["stubs_one", "stubs_two"]]
            } else {
                vec![]
            };
            assert_eq!(*client.mapping_requests.lock().unwrap(), expected_mappings);
            let watched = loader.configuration_paths();
            for name in ["stubs_one", "stubs_two", "rules_one", "rules_two"] {
                let expected = external.join(name).join("MODULE.bazel");
                assert!(
                    watched.contains(&expected),
                    "missing {expected:?} in {watched:?}"
                );
            }
            for name in ["stubs_one", "stubs_two"] {
                let expected = external.join(name).join("stubs.toml");
                assert!(
                    watched.contains(&expected),
                    "missing {expected:?} in {watched:?}"
                );
            }

            // Existing files still require a fresh fetch; failed batches retain the package origin.
            client.fetch_batches.lock().unwrap().clear();
            client
                .fetch_failures
                .lock()
                .unwrap()
                .insert("rules_two".into(), "source fetch failed".into());
            let config =
                crate::commands::project_config::ProjectConfig::load(&loader, &workspace).unwrap();
            let error = super::load(&loader, &workspace, config.stub_packages).unwrap_err();
            let message = format!("{error:#}");
            assert!(message.contains("@@stubs_two//:stubs.toml"), "{message}");
            assert!(message.contains("source fetch failed"), "{message}");
            let mut failed_fetches = expected_fetches;
            if bzlmod {
                failed_fetches.extend([vec!["rules_one"], vec!["rules_two"]]);
            }
            assert_eq!(*client.fetch_batches.lock().unwrap(), failed_fetches);
            assert_eq!(*client.mapping_requests.lock().unwrap(), expected_mappings);
        }
        std::fs::remove_dir_all(root).unwrap();
    }
}
