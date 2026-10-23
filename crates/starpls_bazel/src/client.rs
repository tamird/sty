use std::collections::hash_map::Entry;
use std::collections::BTreeSet;
use std::collections::HashMap;
use std::ffi::OsString;
use std::io::BufRead;
use std::io::Read;
use std::io::Write;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::process::Stdio;
use std::str;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::Weak;

use anyhow::anyhow;
use anyhow::bail;
use anyhow::Context;
use serde::Deserialize;
use serde_json::Deserializer;

const DEFAULT_WORKSPACE_NAMES: &[&str] = &["__main__", "_main"];
// Amortize the extra Bazel command over a substantial reduction in legacy mapping output.
const MIN_REPOSITORIES_FOR_PROVENANCE: usize = 64;
const MAX_REPOSITORIES_PER_MAPPING_QUERY: usize = 1024;

fn repository_argument_bytes(repo: &str) -> usize {
    "--repo=@@".len() + repo.len() + 1
}

/// Number of repositories to fetch together, allowing one oversized name to fail individually.
pub fn repository_fetch_batch_len(repos: &[String]) -> usize {
    // Bazel expands rc options into its server request. Keep room under the
    // 4 MiB request limit for rc provenance, option expansion, and the environment.
    let mut bytes = 0;
    repos
        .iter()
        .take_while(|repo| {
            bytes += repository_argument_bytes(repo);
            bytes <= 256 * 1024
        })
        .count()
        .max(usize::from(!repos.is_empty()))
}

pub type RepoMapping = Arc<HashMap<String, String>>;

#[derive(Clone, Copy, Default, PartialEq, Eq)]
enum MappingFormat {
    #[default]
    Compact,
    Json,
}

#[derive(Default)]
struct MappingState {
    values: HashMap<Box<[u8]>, Weak<HashMap<String, String>>>,
    format: MappingFormat,
    // Extension prefix -> Bazel provenance. A missing witness records a failed attempt.
    extension_repositories: Option<HashMap<String, Option<RepositoryWitness>>>,
}

struct MappingOutput {
    mappings: Vec<RepoMapping>,
    empty_stdout: bool,
}

struct MappingQuery<'a> {
    repositories: Vec<&'a str>,
    projection: Vec<usize>,
    witnesses: HashMap<usize, RepositoryWitness>,
}

#[derive(Clone)]
struct RepositoryWitness {
    original: String,
    canonical: String,
}

impl<'a> MappingQuery<'a> {
    // Bazel constructs every generated repository's mapping from one
    // ModuleExtensionRepoMappingEntriesValue. Identify an extension only from
    // repository provenance already returned by Bazel, then verify the current
    // mapping resolves the original names back to the requested repositories.
    // Canonical repository names are Bazel implementation details; callers
    // must first establish that this Bazel release uses the audited layout.
    fn new(
        repositories: &[&'a str],
        extensions: &HashMap<String, Option<RepositoryWitness>>,
    ) -> Self {
        let mut query = Self {
            repositories: Vec::with_capacity(repositories.len()),
            projection: Vec::with_capacity(repositories.len()),
            witnesses: HashMap::new(),
        };
        let mut representative = HashMap::<&str, usize>::new();
        for &repository in repositories {
            let extension = repository.rsplit_once('+').and_then(|(prefix, _)| {
                extensions
                    .get(prefix)
                    .and_then(Option::as_ref)
                    .map(|witness| (prefix, witness))
            });
            if let Some((prefix, witness)) = extension {
                if let Some(&index) = representative.get(prefix) {
                    query.projection.push(index);
                    query
                        .witnesses
                        .entry(index)
                        .or_insert_with(|| witness.clone());
                    continue;
                }
                representative.insert(prefix, query.repositories.len());
            }
            let index = query.repositories.len();
            query.repositories.push(repository);
            query.projection.push(index);
        }
        query
    }

    fn expand(&self, requested: &[&str], mappings: &[RepoMapping]) -> Vec<Option<RepoMapping>> {
        let mut confirmed = vec![false; mappings.len()];
        for (&index, witness) in &self.witnesses {
            let mapping = &mappings[index];
            let representative = self.repositories[index];
            let (_, name) = representative
                .rsplit_once('+')
                .expect("extension repository has a prefix");
            confirmed[index] = mapping.get(&witness.original) == Some(&witness.canonical)
                && mapping.get(name).map(String::as_str) == Some(representative);
        }
        requested
            .iter()
            .zip(&self.projection)
            .map(|(&repository, &index)| {
                let mapping = &mappings[index];
                (repository == self.repositories[index]
                    || (confirmed[index]
                        && repository.rsplit_once('+').is_some_and(|(_, name)| {
                            mapping.get(name).map(String::as_str) == Some(repository)
                        })))
                .then(|| Arc::clone(mapping))
            })
            .collect()
    }
}

impl MappingState {
    fn provenance_candidate<'a>(&mut self, repositories: &[&'a str]) -> Option<&'a str> {
        let extensions = self.extension_repositories.as_mut()?;
        let mut counts = HashMap::new();
        let mut largest = MIN_REPOSITORIES_FOR_PROVENANCE - 1;
        let mut candidate = None;
        for &repository in repositories {
            let Some((prefix, _)) = repository.rsplit_once('+') else {
                continue;
            };
            if !prefix.contains('+') || extensions.contains_key(prefix) {
                continue;
            }
            let count = counts.entry(prefix).or_insert(0);
            *count += 1;
            if *count > largest {
                largest = *count;
                candidate = Some((prefix, repository));
            }
        }
        let (prefix, repository) = candidate?;
        extensions.insert(prefix.to_owned(), None);
        Some(repository)
    }

    fn record_extension_repository(&mut self, canonical: &str, original: String) {
        let Some(extensions) = &mut self.extension_repositories else {
            return;
        };
        let Some((prefix, suffix)) = canonical.rsplit_once('+') else {
            return;
        };
        if prefix.contains('+') && suffix == original {
            extensions.insert(
                prefix.to_owned(),
                Some(RepositoryWitness {
                    original,
                    canonical: canonical.to_owned(),
                }),
            );
        }
    }

    fn intern(&mut self, json: &[u8]) -> anyhow::Result<RepoMapping> {
        if let Some(mapping) = self.values.get(json).and_then(Weak::upgrade) {
            return Ok(mapping);
        }
        let mapping = Arc::new(serde_json::from_slice(json)?);
        self.values.insert(json.into(), Arc::downgrade(&mapping));
        Ok(mapping)
    }
}

#[derive(Default)]
pub struct BazelInfo {
    pub output_base: PathBuf,
    pub release: String,
    pub starlark_semantics: String,
    pub workspace: PathBuf,
    pub workspace_name: Option<String>,
}

/// The module selected by Bazel, with a version for registry releases.
#[derive(Debug, PartialEq, Eq)]
pub struct SelectedModule {
    pub name: String,
    pub version: Option<String>,
}

pub struct SelectedModuleRequest<'a> {
    pub canonical_repository: &'a str,
    pub module_name: &'a str,
}

/// Repository identities for one configuration load.
#[derive(Default)]
pub struct SelectedModules {
    values: HashMap<String, Option<SelectedModule>>,
    pending_extensions: Vec<String>,
}

impl SelectedModules {
    pub fn resolve<'a>(
        &'a mut self,
        client: &dyn BazelClient,
        canonical_repository: &str,
    ) -> anyhow::Result<Option<&'a SelectedModule>> {
        if self
            .pending_extensions
            .binary_search_by(|repository| repository.as_str().cmp(canonical_repository))
            .is_ok()
        {
            // Defer the second metadata query until validation reaches an unresolved
            // source, preserving earlier errors and their source-root watch scope.
            let pending = std::mem::take(&mut self.pending_extensions);
            for repository in client.prefetch_extension_repositories(&pending) {
                self.values.entry(repository).or_insert(None);
            }
        }
        let selected = match self.values.entry(canonical_repository.to_owned()) {
            Entry::Occupied(entry) => entry.into_mut(),
            Entry::Vacant(entry) => entry.insert(client.selected_module(canonical_repository)?),
        };
        Ok(selected.as_ref())
    }
}

pub trait BazelClient: Send + Sync + 'static {
    fn build_language(&self) -> anyhow::Result<Vec<u8>>;
    fn info(&self) -> anyhow::Result<BazelInfo>;
    fn null_query_external_repo_targets(&self, repo: &str) -> anyhow::Result<()>;
    fn query_all_workspace_targets(&self) -> anyhow::Result<Vec<String>>;
    fn fetch_repos(&self, repos: &[&str]) -> anyhow::Result<()>;
    fn fetch_repo(&self, repo: &str) -> anyhow::Result<()> {
        self.fetch_repos(&[repo])
    }
    /// Returns mappings in the same order as the canonical repository names.
    fn dump_repo_mappings(&self, repos: &[&str]) -> anyhow::Result<Vec<RepoMapping>>;
    fn dump_repo_mapping(&self, repo: &str) -> anyhow::Result<RepoMapping> {
        let mut mappings = self.dump_repo_mappings(&[repo])?;
        if mappings.len() != 1 {
            bail!(
                "expected one repository mapping, received {}",
                mappings.len()
            );
        }
        Ok(mappings.pop().expect("validated mapping count"))
    }
    /// Returns None when no module name is available (an extension or unnamed root).
    fn selected_module(&self, canonical_repo: &str) -> anyhow::Result<Option<SelectedModule>>;
    /// Prefetch repository identities without changing ordered source validation.
    fn prefetch_selected_modules(
        &self,
        _requests: &[SelectedModuleRequest<'_>],
    ) -> SelectedModules {
        SelectedModules::default()
    }
    /// Identify extension-generated repositories among sorted, unique canonical names.
    /// Missing entries retain the ordinary `selected_module` lookup.
    fn prefetch_extension_repositories(&self, _repositories: &[String]) -> Vec<String> {
        Vec::new()
    }
}

pub struct BazelCLI {
    executable: PathBuf,
    working_directory: Option<PathBuf>,
    mappings: Mutex<MappingState>,
    repository_metadata: AtomicBool,
}

impl BazelCLI {
    pub fn new(executable: impl AsRef<Path>) -> Self {
        Self {
            executable: executable.as_ref().to_path_buf(),
            ..Default::default()
        }
    }

    pub fn with_working_directory(mut self, directory: PathBuf) -> anyhow::Result<Self> {
        if self.executable.is_relative() && self.executable.components().count() > 1 {
            self.executable = std::env::current_dir()?.join(&self.executable);
        }
        self.working_directory = Some(directory);
        Ok(self)
    }

    /// Return the canonical labels of Starlark files loaded by these targets' packages.
    pub fn query_load_context(&self, targets: &[String]) -> anyhow::Result<Vec<String>> {
        anyhow::ensure!(!targets.is_empty(), "load context requires a Bazel target");
        let targets = targets
            .iter()
            .map(|target| quote_query_target(target))
            .collect::<anyhow::Result<Vec<_>>>()?
            .join(" ");
        let expression = format!("loadfiles(set({targets}))");
        let output = self.run_command([
            "query",
            "--consistent_labels",
            "--output=label",
            &expression,
        ])?;
        Ok(str::from_utf8(&output)?
            .lines()
            .map(str::to_owned)
            .collect())
    }

    fn run_command<I, S>(&self, args: I) -> anyhow::Result<Vec<u8>>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<std::ffi::OsStr>,
    {
        let mut command = Command::new(&self.executable);
        command.args(args);
        if let Some(directory) = &self.working_directory {
            command.current_dir(directory);
        }
        let started = std::time::Instant::now();
        let output = command.output();
        let subcommand = command
            .get_args()
            .filter_map(|argument| argument.to_str())
            .find(|argument| matches!(*argument, "info" | "mod" | "query" | "fetch"));
        log::debug!(
            target: "sty::timing",
            "Bazel {:?}: {:?}; arguments={}; status={:?}",
            subcommand,
            started.elapsed(),
            command.get_args().len(),
            output.as_ref().map(|output| output.status),
        );
        let output = output?;
        if !output.status.success() {
            bail!(
                "failed to run Bazel command with exit status {}, stderr={:?}",
                output.status,
                str::from_utf8(&output.stderr)?,
            );
        }
        Ok(output.stdout)
    }

    fn query_extension_repository(&self, canonical_repo: &str) -> anyhow::Result<Option<String>> {
        let output = self.run_command([
            "mod",
            "show_repo",
            &format!("@@{canonical_repo}"),
            "--output=streamed_jsonproto",
        ])?;
        extension_repository_original_name(&output, canonical_repo)
    }

    fn query_mappings_with_reuse(
        &self,
        repos: &[&str],
        state: &mut MappingState,
    ) -> anyhow::Result<Vec<RepoMapping>> {
        if state.format != MappingFormat::Json {
            return self.query_repo_mappings(repos, state);
        }
        if let Some(repository) = state.provenance_candidate(repos) {
            if let Ok(Some(original)) = self.query_extension_repository(repository) {
                state.record_extension_repository(repository, original);
            }
        }
        if let Some(extensions) = state
            .extension_repositories
            .as_ref()
            .filter(|extensions| !extensions.is_empty())
        {
            let query = MappingQuery::new(repos, extensions);
            if query.repositories.len() < repos.len() {
                if let Ok(mappings) = self.query_repo_mappings(&query.repositories, state) {
                    let mut expanded = query.expand(repos, &mappings);
                    let unresolved: Vec<_> = repos
                        .iter()
                        .zip(&expanded)
                        .filter_map(|(&repo, mapping)| mapping.is_none().then_some(repo))
                        .collect();
                    if !unresolved.is_empty() {
                        if let Ok(repaired) = self.query_repo_mappings(&unresolved, state) {
                            for (slot, mapping) in expanded
                                .iter_mut()
                                .filter(|slot| slot.is_none())
                                .zip(repaired)
                            {
                                *slot = Some(mapping);
                            }
                        }
                    }
                    if let Some(mappings) = expanded.into_iter().collect() {
                        return Ok(mappings);
                    }
                }
            }
        }
        self.query_repo_mappings(repos, state)
    }

    fn query_repo_mappings(
        &self,
        repos: &[&str],
        state: &mut MappingState,
    ) -> anyhow::Result<Vec<RepoMapping>> {
        let mut mappings = Vec::with_capacity(repos.len());
        // Bound native requests after provenance grouping: splitting logical
        // repositories first would query the same extension once per batch.
        let mut batch_len = repos.len().min(MAX_REPOSITORIES_PER_MAPPING_QUERY);
        while mappings.len() < repos.len() {
            let batch = &repos[mappings.len()..(mappings.len() + batch_len).min(repos.len())];
            let mut command = Command::new(&self.executable);
            command.args(["mod", "--enable_bzlmod", "dump_repo_mapping"]);
            if state.format == MappingFormat::Compact {
                command.arg("--output=compact_json");
            }
            command.args(batch);
            if let Some(directory) = &self.working_directory {
                command.current_dir(directory);
            }
            let started = std::time::Instant::now();
            let mut child = match command
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
            {
                Ok(child) => child,
                Err(error) => {
                    log::debug!(
                        target: "sty::timing",
                        "Bazel mapping query spawn failed: {:?}; repositories={}; error={error}",
                        started.elapsed(),
                        batch.len(),
                    );
                    if error.kind() == std::io::ErrorKind::ArgumentListTooLong && batch.len() > 1 {
                        batch_len = batch.len() / 2;
                        continue;
                    }
                    return Err(error.into());
                }
            };
            let stdout = child.stdout.take().expect("stdout was piped");
            let mut stderr = child.stderr.take().expect("stderr was piped");
            let response = std::thread::scope(|scope| -> anyhow::Result<_> {
                let errors = scope.spawn(move || {
                    let mut bytes = Vec::new();
                    stderr.read_to_end(&mut bytes).map(|_| bytes)
                });
                let result =
                    parse_repo_mappings(std::io::BufReader::new(stdout), batch.len(), state);
                if result.is_err() {
                    // A malformed stream can leave the child blocked on stdout.
                    let _ = child.kill();
                }
                let status = child.wait()?;
                let errors = errors.join().expect("stderr reader panicked")?;
                Ok((result, status, errors))
            });
            log::debug!(
                target: "sty::timing",
                "Bazel mapping query (including stream decoding): {:?}; repositories={}; compact={}; status={:?}",
                started.elapsed(),
                batch.len(),
                state.format == MappingFormat::Compact,
                response.as_ref().map(|(_, status, _)| status),
            );
            let (result, status, errors) = response?;
            let MappingOutput {
                mappings: batch_mappings,
                empty_stdout,
            } = result.with_context(|| {
                format!(
                    "Bazel repository mapping query ({status}): {}",
                    String::from_utf8_lossy(&errors)
                )
            })?;
            if state.format == MappingFormat::Compact
                && empty_stdout
                && status.code() == Some(2)
                && unsupported_compact_mapping_format(&errors)
            {
                state.format = MappingFormat::Json;
                mappings.extend(self.query_mappings_with_reuse(&repos[mappings.len()..], state)?);
                return Ok(mappings);
            }
            if !status.success() {
                bail!(
                    "failed to query repository mappings with {status}: {}",
                    String::from_utf8_lossy(&errors)
                );
            }
            if batch_mappings.len() != batch.len() {
                bail!(
                    "expected {} repository mappings, received {}",
                    batch.len(),
                    batch_mappings.len()
                );
            }
            mappings.extend(batch_mappings);
        }
        Ok(mappings)
    }
}

fn quote_query_target(target: &str) -> anyhow::Result<String> {
    let label = crate::Label::parse(target)
        .map_err(|error| anyhow!("invalid Bazel load-context target {target:?}: {error}"))?;
    anyhow::ensure!(
        label.has_leading_slashes()
            && label.package().split('/').next_back() != Some("...")
            && !(target.contains(':') && matches!(label.target(), "all" | "all-targets" | "*")),
        "Bazel load context requires an explicit target label, got {target:?}"
    );
    // Bazel query's quoted words do not support escape sequences. Use the
    // other delimiter when a label contains one kind of quote.
    let quote = if !target.contains('\'') {
        '\''
    } else if !target.contains('"') {
        '"'
    } else {
        bail!("Bazel load-context target contains both query quote delimiters: {target:?}")
    };
    Ok(format!("{quote}{target}{quote}"))
}

impl BazelClient for BazelCLI {
    fn build_language(&self) -> anyhow::Result<Vec<u8>> {
        self.run_command(["info", "build-language"])
    }

    fn info(&self) -> anyhow::Result<BazelInfo> {
        let output = self.run_command([
            "info",
            "execution_root",
            "output_base",
            "release",
            "starlark-semantics",
            "workspace",
        ])?;

        let output = str::from_utf8(&output)?;
        let mut output_base = None;
        let mut release = None;
        let mut starlark_semantics = None;
        let mut workspace = None;
        let mut workspace_name = None;
        for line in output.lines() {
            let (key, value) = match line.split_once(": ") {
                Some(pair) => pair,
                None => continue,
            };
            match key {
                "execution_root" => {
                    // Taken from https://github.com/cameron-martin/bazel-lsp/blob/92644f21aca7cfbba332c67ac1aa9cf43765e021/src/workspace.rs#L24.
                    workspace_name = PathBuf::from(value).file_name().and_then(|file_name| {
                        match file_name.to_string_lossy().to_string() {
                            name if DEFAULT_WORKSPACE_NAMES.contains(&name.as_str()) => None,
                            name => Some(name),
                        }
                    });
                }
                "output_base" => output_base = Some(value),
                "release" => release = Some(value),
                "starlark-semantics" => starlark_semantics = Some(value),
                "workspace" => workspace = Some(value),
                _ => {}
            }
        }

        let info = BazelInfo {
            output_base: output_base
                .ok_or_else(|| anyhow!("failed to determine output_base from `bazel info`"))?
                .into(),
            release: release
                .ok_or_else(|| anyhow!("failed to determine release from `bazel info`"))?
                .into(),
            starlark_semantics: starlark_semantics
                .ok_or_else(|| anyhow!("failed to determine starlark-semantics from `bazel info`"))?
                .into(),
            workspace: workspace
                .ok_or_else(|| anyhow!("failed to determine workspace from `bazel info`"))?
                .into(),
            workspace_name,
        };
        self.mappings
            .lock()
            .expect("mapping state was poisoned")
            .extension_repositories =
            supports_extension_mapping_reuse(&info.release).then(HashMap::new);
        self.repository_metadata.store(
            supports_repository_metadata(&info.release),
            Ordering::Relaxed,
        );
        Ok(info)
    }

    fn null_query_external_repo_targets(&self, repo: &str) -> anyhow::Result<()> {
        self.run_command(["query", "--keep_going", &format!("@@{}//...", repo)])?;
        Ok(())
    }

    fn query_all_workspace_targets(&self) -> anyhow::Result<Vec<String>> {
        let output = self.run_command(["query", "kind('.* rule', ...)"])?;
        let targets = str::from_utf8(&output)?
            .lines()
            .map(|line| line.to_string())
            .collect();
        Ok(targets)
    }

    fn fetch_repos(&self, repos: &[&str]) -> anyhow::Result<()> {
        if repos.is_empty() {
            bail!("repository fetch requires at least one repository");
        }
        for repo in repos {
            if repo.contains(['\0', '\r', '\n']) {
                bail!("repository name contains a NUL or newline: {repo:?}");
            }
        }
        if repos
            .iter()
            .map(|repo| repository_argument_bytes(repo))
            .sum::<usize>()
            <= 16 * 1024
        {
            let args = std::iter::once("fetch".to_owned())
                .chain(repos.iter().map(|repo| format!("--repo=@@{repo}")));
            self.run_command(args)?;
        } else {
            let mut rc = tempfile::Builder::new()
                .prefix("starpls-fetch-")
                .tempfile()?;
            let config = rc
                .path()
                .file_name()
                .and_then(|name| name.to_str())
                .expect("temporary file has an ASCII name")
                .to_owned();
            let contents: String = repos
                .iter()
                .map(|repo| {
                    let quoted = repo.replace('\\', "\\\\").replace('"', "\\\"");
                    format!("fetch:{config} \"--repo=@@{quoted}\"\n")
                })
                .collect();
            rc.write_all(contents.as_bytes())?;
            let mut rc_arg = OsString::from("--bazelrc=");
            rc_arg.push(rc.path());
            // A unique config makes an ignored rc an error, rather than a fetch
            // with no repository selection. Normal Bazel rc files still apply.
            self.run_command([rc_arg, "fetch".into(), format!("--config={config}").into()])?;
        }
        Ok(())
    }

    fn dump_repo_mappings(&self, repos: &[&str]) -> anyhow::Result<Vec<RepoMapping>> {
        if repos.is_empty() {
            bail!("repository mapping query requires at least one repository");
        }
        // Serialize mapping readers before they can contend for Bazel's server
        // lock with an unread stdout pipe and this interner lock held elsewhere.
        let mut state = self.mappings.lock().expect("mapping state was poisoned");
        self.query_mappings_with_reuse(repos, &mut state)
    }

    fn selected_module(&self, canonical_repo: &str) -> anyhow::Result<Option<SelectedModule>> {
        let graph = self.run_command([
            "mod",
            "graph",
            &format!("--from=@@{canonical_repo}"),
            "--depth=1",
            "--output=json",
        ]);
        let graph_error = match graph {
            Ok(output) => return selected_module_from_graph(&output, canonical_repo),
            Err(error) => error,
        };
        if !canonical_repo.is_empty() {
            // Extension repositories have no module graph node. Bazel 9's
            // repository metadata can establish their extension provenance.
            let original = self
                .query_extension_repository(canonical_repo)
                .with_context(|| {
                    format!(
                "cannot identify @@{canonical_repo}; module graph query failed: {graph_error:#}"
            )
                })?;
            if let Some(original) = original {
                self.mappings
                    .lock()
                    .expect("mapping state was poisoned")
                    .record_extension_repository(canonical_repo, original);
                return Ok(None);
            }
        }
        Err(graph_error).with_context(|| format!("cannot identify module for @@{canonical_repo}"))
    }

    fn prefetch_selected_modules(&self, requests: &[SelectedModuleRequest<'_>]) -> SelectedModules {
        if !self.repository_metadata.load(Ordering::Relaxed) {
            return SelectedModules::default();
        }
        let requested: HashMap<_, _> = requests
            .iter()
            .filter(|request| {
                !request.canonical_repository.is_empty() && is_module_argument(request.module_name)
            })
            .map(|request| (request.canonical_repository, request.module_name))
            .collect();
        if requested.len() < 2 {
            return SelectedModules::default();
        }
        // Module arguments make Bazel emit the selected module key together with
        // its canonical repository name. A graph batch does not retain this pair.
        let modules: BTreeSet<_> = requested.values().copied().collect();
        let arguments = ["mod", "show_repo", "--output=streamed_jsonproto"]
            .into_iter()
            .chain(modules);
        let Ok(output) = self.run_command(arguments) else {
            return SelectedModules::default();
        };
        let Ok(modules) = selected_modules_from_metadata(&output, &requested) else {
            return SelectedModules::default();
        };
        let mut pending_extensions: Vec<_> = requested
            .keys()
            .filter(|repository| !modules.contains_key(**repository))
            .map(|repository| (*repository).to_owned())
            .collect();
        if pending_extensions.len() < 2 {
            pending_extensions.clear();
        } else {
            pending_extensions.sort_unstable();
        }
        SelectedModules {
            values: modules
                .into_iter()
                .map(|(repository, module)| (repository, Some(module)))
                .collect(),
            pending_extensions,
        }
    }

    fn prefetch_extension_repositories(&self, repositories: &[String]) -> Vec<String> {
        if repositories.len() < 2 || !self.repository_metadata.load(Ordering::Relaxed) {
            return Vec::new();
        }
        let mut confirmed = Vec::new();
        let mut remaining = repositories;
        while !remaining.is_empty() {
            // The fetch argument bound is conservative for the shorter @@name arguments.
            let (batch, rest) = remaining.split_at(repository_fetch_batch_len(remaining));
            let arguments = ["mod", "show_repo", "--output=streamed_jsonproto"]
                .into_iter()
                .map(str::to_owned)
                .chain(batch.iter().map(|repository| format!("@@{repository}")));
            let Ok(output) = self.run_command(arguments) else {
                break;
            };
            let Ok(original_names) = repository_original_names(&output, batch) else {
                break;
            };
            let mut mappings = self.mappings.lock().expect("mapping state was poisoned");
            for (canonical, original) in original_names {
                if let Some(original) = original {
                    mappings.record_extension_repository(&canonical, original);
                    confirmed.push(canonical);
                }
            }
            remaining = rest;
        }
        confirmed
    }
}

fn parse_repo_mappings(
    mut output: impl BufRead,
    expected: usize,
    interner: &mut MappingState,
) -> anyhow::Result<MappingOutput> {
    interner
        .values
        .retain(|_, mapping| mapping.strong_count() > 0);
    let mut mappings = Vec::with_capacity(expected);
    let mut line = Vec::new();
    let mut empty_stdout = true;
    loop {
        line.clear();
        if output.read_until(b'\n', &mut line)? == 0 {
            break;
        }
        empty_stdout = false;
        let json = line.trim_ascii();
        if json.is_empty() {
            continue;
        }
        if mappings.len() == expected {
            bail!("unexpected extra repository mapping");
        }
        let mapping = if json.starts_with(b"{") || interner.format == MappingFormat::Json {
            interner.intern(json)?
        } else {
            let index = serde_json::from_slice::<usize>(json)?;
            let referenced = mappings.get(index).with_context(|| {
                format!("repository mapping reference {index} does not identify an earlier record")
            })?;
            Arc::clone(referenced)
        };
        mappings.push(mapping);
    }
    Ok(MappingOutput {
        mappings,
        empty_stdout,
    })
}

fn unsupported_compact_mapping_format(stderr: &[u8]) -> bool {
    let Ok(stderr) = str::from_utf8(stderr) else {
        return false;
    };
    stderr.lines().any(|line| {
        line.starts_with("ERROR: While parsing option --output=compact_json: Not a valid output format: 'compact_json' (should be ")
            && line.ends_with(')')
    })
}

fn supports_extension_mapping_reuse(release: &str) -> bool {
    // Bazel's canonical repository name format is explicitly not an API. These
    // releases were checked for the prefix-free extension naming convention
    // and shared ModuleExtensionRepoMappingEntriesValue in
    // https://github.com/bazelbuild/bazel/tree/9.3.0/src/main/java/com/google/devtools/build/lib/bazel/bzlmod
    // and https://github.com/dzbarsky/bazel/tree/c9e799a41461893607df3b93d95c77d00c597032/src/main/java/com/google/devtools/build/lib/bazel/bzlmod.
    // The fork kept that code unchanged through 9.4.0-dzbarsky3:
    // https://github.com/dzbarsky/bazel/compare/c9e799a41461893607df3b93d95c77d00c597032...936b87fb56f12c7be262c4a5bbe853f4fc9bbd45
    // The audited 10.0.0-pre.20261021.1 release preserves those invariants:
    // https://github.com/dzbarsky/bazel/tree/e5cf43633e1c8131a2864bf17a7fc5c507b17be3/src/main/java/com/google/devtools/build/lib/bazel/bzlmod
    matches!(
        release,
        "release 9.0.0"
            | "release 9.0.1"
            | "release 9.0.2"
            | "release 9.1.0"
            | "release 9.1.1"
            | "release 9.2.0"
            | "release 9.3.0"
            | "release 9.4.0-dzbarsky1"
            | "release 9.4.0-dzbarsky3"
            | "release 10.0.0-pre.20261021.1"
    )
}

fn supports_repository_metadata(release: &str) -> bool {
    // Machine-readable `mod show_repo` output was introduced in Bazel 9.
    release
        .strip_prefix("release ")
        .and_then(|release| release.split_once('.'))
        .and_then(|(major, _)| major.parse::<u64>().ok())
        .is_some_and(|major| major >= 9)
}

fn is_module_argument(name: &str) -> bool {
    let mut bytes = name.bytes();
    bytes.next().is_some_and(|byte| byte.is_ascii_lowercase())
        && bytes.all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || b"._-".contains(&byte)
        })
}

fn selected_modules_from_metadata(
    output: &[u8],
    requested: &HashMap<&str, &str>,
) -> anyhow::Result<HashMap<String, SelectedModule>> {
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct Repository {
        canonical_name: String,
        module_key: String,
    }

    let mut modules = HashMap::new();
    for repository in Deserializer::from_slice(output).into_iter::<Repository>() {
        let Repository {
            canonical_name,
            module_key,
        } = repository?;
        let Some(expected) = requested.get(canonical_name.as_str()) else {
            continue;
        };
        let module = selected_module_from_key(&module_key)?;
        match modules.entry(canonical_name) {
            Entry::Vacant(entry) if module.name == *expected => {
                entry.insert(module);
            }
            _ => bail!("ambiguous selected module metadata"),
        }
    }
    Ok(modules)
}

fn selected_module_from_graph(
    output: &[u8],
    canonical_repo: &str,
) -> anyhow::Result<Option<SelectedModule>> {
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct Graph {
        key: String,
        name: Option<String>,
        dependencies: Vec<Module>,
        indirect_dependencies: Vec<Module>,
    }
    #[derive(Deserialize)]
    struct Module {
        key: String,
    }
    let Graph {
        key,
        name,
        mut dependencies,
        indirect_dependencies,
    } = serde_json::from_slice(output).context("invalid Bazel module graph JSON")?;
    if key != "<root>" {
        bail!("expected Bazel module graph root, got {key:?}");
    }
    if canonical_repo.is_empty() {
        return Ok(name
            .filter(|name| !name.is_empty())
            .map(|name| SelectedModule {
                name,
                version: None,
            }));
    }
    dependencies.extend(indirect_dependencies);
    let [Module { key }] = dependencies.as_slice() else {
        bail!("expected one selected module for @@{canonical_repo}");
    };
    selected_module_from_key(key).map(Some)
}

fn selected_module_from_key(key: &str) -> anyhow::Result<SelectedModule> {
    let Some((name, version)) = key.split_once('@') else {
        bail!("invalid Bazel module key {key:?}");
    };
    if name.is_empty() || version.is_empty() || version.contains('@') {
        bail!("invalid Bazel module key {key:?}");
    }
    // Module keys mark non-registry overrides with `_`. The separate JSON
    // version field may still contain the override's declared MODULE version.
    Ok(SelectedModule {
        name: name.to_owned(),
        version: (version != "_").then(|| version.to_owned()),
    })
}

fn extension_repository_original_name(
    output: &[u8],
    canonical_repo: &str,
) -> anyhow::Result<Option<String>> {
    Ok(repository_original_names(output, &[canonical_repo])?
        .remove(canonical_repo)
        .flatten())
}

/// Read sorted, unique canonical-name requests, requiring positive extension
/// provenance for each confirmed repository. Bazel only sets `originalName` on
/// extension-generated repository definitions; an omitted record or field
/// establishes no identity.
fn repository_original_names(
    output: &[u8],
    requested: &[impl AsRef<str>],
) -> anyhow::Result<HashMap<String, Option<String>>> {
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct Repository {
        canonical_name: String,
        original_name: Option<String>,
    }
    let repositories = Deserializer::from_slice(output)
        .into_iter::<Repository>()
        .collect::<Result<Vec<_>, _>>()
        .context("invalid Bazel repository metadata JSON")?;
    if let [expected] = requested {
        if repositories.len() > 1 {
            bail!(
                "expected one repository description for @@{}",
                expected.as_ref()
            );
        }
    }
    let mut originals = HashMap::new();
    for repository in repositories {
        let Repository {
            canonical_name,
            original_name,
        } = repository;
        if requested
            .binary_search_by(|repository| repository.as_ref().cmp(&canonical_name))
            .is_err()
        {
            if let [expected] = requested {
                bail!(
                    "expected repository @@{}, got @@{canonical_name}",
                    expected.as_ref()
                );
            }
            bail!("unexpected repository @@{canonical_name}");
        }
        match originals.entry(canonical_name) {
            Entry::Vacant(entry) => {
                entry.insert(original_name.filter(|name| !name.is_empty()));
            }
            Entry::Occupied(entry) => {
                bail!("expected one repository description for @@{}", entry.key());
            }
        }
    }
    Ok(originals)
}

impl Default for BazelCLI {
    fn default() -> Self {
        Self {
            executable: "bazel".into(),
            working_directory: None,
            mappings: Default::default(),
            repository_metadata: AtomicBool::new(false),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::extension_repository_original_name;
    use super::selected_module_from_graph;
    use super::SelectedModule;

    #[test]
    fn load_context_targets_cannot_expand_the_query() {
        for (target, quoted) in [
            ("//pkg:target", "'//pkg:target'"),
            ("@@repo+//pkg:foo+bar", "'@@repo+//pkg:foo+bar'"),
            ("//pkg:foo'bar", "\"//pkg:foo'bar\""),
        ] {
            assert_eq!(super::quote_query_target(target).unwrap(), quoted);
        }
        for target in [
            ":target",
            "//pkg/...",
            "//pkg:all",
            "//pkg:all-targets",
            "//pkg:*",
            "//pkg:foo'\"bar",
            "//pkg:target) + //...",
        ] {
            assert!(super::quote_query_target(target).is_err(), "{target}");
        }
    }

    #[cfg(unix)]
    #[test]
    fn selected_modules_prefetch_by_canonical_identity() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelCLI;
        use super::BazelClient;
        use super::SelectedModuleRequest;

        let root = tempfile::tempdir().unwrap();
        let executable = root.path().join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
printf '%s\n' "$*" >> "${0%/*}/calls"
if test "$1" = info; then
  printf 'execution_root: /tmp/workspace\noutput_base: /tmp\nrelease: release 9.0.0\nstarlark-semantics: default\nworkspace: /tmp\n'
else
  cat "${0%/*}/response"
  read status < "${0%/*}/status"
  exit "$status"
fi
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let requests = [
            ("rules_v1", "rules"),
            ("rules_v2", "rules"),
            ("other", "other"),
            ("rules++ext+one", "rules"),
            ("rules++ext+two", "rules"),
            ("rules++ext+unknown", "rules"),
            ("", "root"),
            ("unsafe", "--config=invalid"),
        ]
        .map(
            |(canonical_repository, module_name)| SelectedModuleRequest {
                canonical_repository,
                module_name,
            },
        );
        let client = BazelCLI::new(&executable);
        assert!(client
            .prefetch_selected_modules(&requests)
            .values
            .is_empty());
        assert!(!root.path().join("calls").exists());
        client.info().unwrap();
        std::fs::write(root.path().join("calls"), "").unwrap();
        std::fs::write(root.path().join("status"), "0\n").unwrap();
        std::fs::write(
            root.path().join("response"),
            r#"{"canonicalName":"rules_v2","moduleKey":"rules@2"}
{"canonicalName":"other","moduleKey":"other@_"}
{"canonicalName":"rules_v1","moduleKey":"rules@1"}
{"canonicalName":"rules_v3","moduleKey":"rules@3"}
"#,
        )
        .unwrap();
        let mut selected = client.prefetch_selected_modules(&requests);
        assert_eq!(selected.values.len(), 3);
        assert_eq!(
            selected
                .resolve(&client, "rules_v1")
                .unwrap()
                .unwrap()
                .version
                .as_deref(),
            Some("1")
        );
        assert_eq!(
            selected
                .resolve(&client, "rules_v2")
                .unwrap()
                .unwrap()
                .version
                .as_deref(),
            Some("2")
        );
        assert_eq!(
            selected.resolve(&client, "other").unwrap().unwrap().version,
            None
        );
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod show_repo --output=streamed_jsonproto other rules\n"
        );

        std::fs::write(
            root.path().join("response"),
            "{\"canonicalName\":\"rules++ext+two\",\"originalName\":\"two\"}\n{\"canonicalName\":\"rules++ext+one\",\"originalName\":\"one\"}\n",
        )
        .unwrap();
        assert_eq!(selected.resolve(&client, "rules++ext+one").unwrap(), None);
        assert_eq!(selected.resolve(&client, "rules++ext+two").unwrap(), None);
        std::fs::write(
            root.path().join("response"),
            r#"{"key":"<root>","dependencies":[{"key":"rules@7"}],"indirectDependencies":[]}"#,
        )
        .unwrap();
        assert_eq!(
            selected
                .resolve(&client, "rules++ext+unknown")
                .unwrap()
                .unwrap()
                .version
                .as_deref(),
            Some("7")
        );
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod show_repo --output=streamed_jsonproto other rules\nmod show_repo --output=streamed_jsonproto @@rules++ext+one @@rules++ext+two @@rules++ext+unknown\nmod graph --from=@@rules++ext+unknown --depth=1 --output=json\n"
        );

        std::fs::write(root.path().join("calls"), "").unwrap();
        std::fs::write(
            root.path().join("response"),
            "{\"canonicalName\":\"rules_v1\",\"moduleKey\":\"rules@1\"}\n{\"canonicalName\":\"rules_v1\",\"moduleKey\":\"rules@2\"}\n",
        )
        .unwrap();
        let failed = client.prefetch_selected_modules(&requests);
        assert!(failed.values.is_empty());
        assert!(failed.pending_extensions.is_empty());
        std::fs::write(root.path().join("status"), "1\n").unwrap();
        let failed = client.prefetch_selected_modules(&requests);
        assert!(failed.values.is_empty());
        assert!(failed.pending_extensions.is_empty());
        assert!(client
            .prefetch_selected_modules(&requests[..1])
            .values
            .is_empty());
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls"))
                .unwrap()
                .lines()
                .count(),
            2
        );

        std::fs::write(root.path().join("calls"), "").unwrap();
        std::fs::write(root.path().join("status"), "0\n").unwrap();
        std::fs::write(root.path().join("response"), "").unwrap();
        let mut selected = client.prefetch_selected_modules(&requests);
        std::fs::write(root.path().join("status"), "1\n").unwrap();
        assert!(selected.resolve(&client, "rules++ext+one").is_err());
        assert!(selected.resolve(&client, "rules++ext+two").is_err());
        let calls = std::fs::read_to_string(root.path().join("calls")).unwrap();
        assert_eq!(calls.lines().count(), 6, "{calls}");
        assert_eq!(
            calls
                .lines()
                .filter(|line| line.contains("@@rules++ext+one @@rules++ext+two"))
                .count(),
            1,
            "{calls}"
        );
    }

    #[cfg(unix)]
    #[test]
    fn repository_fetches_select_exact_repositories_and_clean_up() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelClient;
        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("fetch-arguments");
        std::fs::create_dir_all(&root).unwrap();
        let executable = root.join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
set -eu
printf '%s\n' "$@" > "${0%/*}/arguments"
pwd > "${0%/*}/cwd"
case "$1" in
  --bazelrc=*) cat "${1#--bazelrc=}" > "${0%/*}/rc" ;;
esac
read status < "${0%/*}/status"
echo 'native fetch failure' >&2
exit "$status"
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let client = super::BazelCLI::new(executable)
            .with_working_directory(root.clone())
            .unwrap();
        assert!(client.fetch_repos(&[]).is_err());
        for invalid in ["bad\0name", "bad\rname", "bad\nname"] {
            assert!(client.fetch_repos(&["first+", invalid]).is_err());
        }
        assert!(!root.join("arguments").exists());
        std::fs::write(root.join("status"), "0\n").unwrap();
        client
            .fetch_repos(&["first+", "rules++ext+second"])
            .unwrap();
        assert_eq!(
            std::fs::read_to_string(root.join("arguments")).unwrap(),
            "fetch\n--repo=@@first+\n--repo=@@rules++ext+second\n"
        );
        assert_eq!(
            std::fs::read_to_string(root.join("cwd")).unwrap().trim(),
            root.canonicalize().unwrap().to_str().unwrap()
        );
        std::fs::write(root.join("status"), "1\n").unwrap();
        let error = client.fetch_repo("broken+").unwrap_err().to_string();
        assert!(error.contains("native fetch failure"), "{error}");
        assert_eq!(
            std::fs::read_to_string(root.join("arguments")).unwrap(),
            "fetch\n--repo=@@broken+\n"
        );

        std::fs::write(root.join("status"), "0\n").unwrap();
        let direct = "a".repeat(16 * 1024 - "--repo=@@".len() - 1);
        client.fetch_repo(&direct).unwrap();
        assert_eq!(
            std::fs::read_to_string(root.join("arguments")).unwrap(),
            format!("fetch\n--repo=@@{direct}\n")
        );
        let large = format!("{direct}a");
        for status in [0, 1] {
            std::fs::write(root.join("status"), format!("{status}\n")).unwrap();
            let result = client.fetch_repos(&[&large, "a\"b\\c #d'", "first+"]);
            if status == 0 {
                result.unwrap();
            } else {
                let error = result.unwrap_err().to_string();
                assert!(error.contains("native fetch failure"), "{error}");
            }
            let arguments = std::fs::read_to_string(root.join("arguments")).unwrap();
            let arguments: Vec<_> = arguments.lines().collect();
            let [rc_arg, command, config_arg] = arguments.as_slice() else {
                panic!("unexpected fetch arguments: {arguments:?}");
            };
            assert_eq!(*command, "fetch");
            let path = std::path::Path::new(rc_arg.strip_prefix("--bazelrc=").unwrap());
            assert!(!path.exists(), "temporary rc survived fetch");
            let config = config_arg.strip_prefix("--config=").unwrap();
            assert_eq!(path.file_name().unwrap(), config);
            assert_eq!(std::fs::read_to_string(root.join("rc")).unwrap(),
                format!("fetch:{config} \"--repo=@@{large}\"\nfetch:{config} \"--repo=@@a\\\"b\\\\c #d'\"\nfetch:{config} \"--repo=@@first+\"\n"));
        }
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn equal_mapping_outputs_share_storage_across_batches() {
        let mut interner = super::MappingState::default();
        let output = b"{\"dep\":\"same+\"}\n{\"dep\":\"same+\"}\n";
        let first = super::parse_repo_mappings(output.as_slice(), 2, &mut interner)
            .unwrap()
            .mappings;
        let [one, two] = first.as_slice() else {
            panic!("expected two mappings");
        };
        assert!(std::sync::Arc::ptr_eq(one, two));
        let second = super::parse_repo_mappings(output.as_slice(), 2, &mut interner)
            .unwrap()
            .mappings;
        assert!(std::sync::Arc::ptr_eq(one, second.first().unwrap()));
        assert_eq!(interner.values.len(), 1);
        drop(first);
        drop(second);
        let third = super::parse_repo_mappings(b"{}\n".as_slice(), 1, &mut interner)
            .unwrap()
            .mappings;
        assert!(third.first().unwrap().is_empty());
        assert_eq!(
            interner.values.len(),
            1,
            "obsolete JSON keys must be released"
        );
    }

    #[cfg(unix)]
    #[test]
    fn streamed_mapping_queries_drain_stderr_and_check_exit_status() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelClient;
        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("streamed-mappings");
        std::fs::create_dir_all(&root).unwrap();
        let executable = root.join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
test "$#" = 6 && test "$4" = '--output=compact_json' && test "$5" = '' && test "$6" = 'repo+' || exit 99
i=0
while test "$i" -lt 2000; do
  printf 'Bazel progress message while stdout is consumed\n' >&2
  i=$((i+1))
done
printf '{"dep":"main+"}\n{"dep":"repo+"}\n'
read status < "${0%/*}/status"
exit "$status"
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let client = super::BazelCLI::new(executable);
        std::fs::write(root.join("status"), "0\n").unwrap();
        let mappings = client.dump_repo_mappings(&["", "repo+"]).unwrap();
        let [main, repository] = mappings.as_slice() else {
            panic!("expected mappings");
        };
        assert_eq!(main["dep"], "main+");
        assert_eq!(repository["dep"], "repo+");
        std::fs::write(root.join("status"), "1\n").unwrap();
        assert!(client.dump_repo_mappings(&["", "repo+"]).is_err());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[cfg(any(target_os = "linux", target_os = "macos"))]
    #[test]
    fn mapping_query_batches_preserve_order_and_propagate_failures() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelClient;

        let root = tempfile::tempdir_in(std::env::var_os("TEST_TMPDIR").unwrap()).unwrap();
        let executable = root.path().join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
set -eu
shift 4
printf '%s\n' "$#" >> "${0%/*}/calls"
read failure < "${0%/*}/failure"
for repo do
  ordinal="${repo##*x}"
  if test "$ordinal" = "$failure"; then
    printf 'fixture mapping failure\n' >&2
    exit 3
  fi
  printf '{"ordinal":"%s"}\n' "$ordinal"
done
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let client = super::BazelCLI::new(executable);
        assert!(client.dump_repo_mappings(&[]).is_err());
        assert!(!root.path().join("calls").exists());
        let limit = super::MAX_REPOSITORIES_PER_MAPPING_QUERY;
        // Keep an individual argument small enough to spawn, but force the
        // operating system to split even a capped request.
        let long = "x".repeat(8192);
        for (prefix, count, failure) in [
            ("", 2 * limit + 1, None),
            ("", 2 * limit + 1, Some(limit)),
            ("", 2 * limit + 1, None),
            (long.as_str(), limit, None),
        ] {
            std::fs::write(root.path().join("calls"), "").unwrap();
            std::fs::write(
                root.path().join("failure"),
                format!(
                    "{}\n",
                    failure.map(|index| index.to_string()).unwrap_or_default()
                ),
            )
            .unwrap();
            let names: Vec<_> = (0..count).map(|index| format!("{prefix}{index}")).collect();
            let repositories: Vec<_> = names.iter().map(String::as_str).collect();
            let result = client.dump_repo_mappings(&repositories);
            if failure.is_some() {
                let error = result.unwrap_err();
                assert!(
                    error.to_string().contains("fixture mapping failure"),
                    "{error:#}"
                );
            } else {
                let mappings = result.unwrap();
                assert_eq!(mappings.len(), repositories.len());
                for (index, mapping) in mappings.iter().enumerate() {
                    assert_eq!(mapping["ordinal"], index.to_string());
                }
            }
            let calls: Vec<usize> = std::fs::read_to_string(root.path().join("calls"))
                .unwrap()
                .lines()
                .map(|count| count.parse().unwrap())
                .collect();
            if prefix.is_empty() {
                assert_eq!(
                    calls,
                    if failure.is_some() {
                        vec![limit, limit]
                    } else {
                        vec![limit, limit, 1]
                    }
                );
            } else {
                assert!(calls.len() > 1);
                assert_eq!(calls.iter().sum::<usize>(), count);
                assert!(calls.iter().all(|count| *count <= limit));
            }
        }
    }

    #[test]
    fn repository_mapping_batches_preserve_order_and_reject_invalid_records() {
        let output = b"{\"dep\":\"first+\"}\n{\"dep\":\"second+\"}\n";
        let mappings = super::parse_repo_mappings(output.as_slice(), 2, &mut Default::default())
            .unwrap()
            .mappings;
        let [first, second] = mappings.as_slice() else {
            panic!("expected two mappings: {mappings:?}");
        };
        assert_eq!(first.get("dep").unwrap(), "first+");
        assert_eq!(second.get("dep").unwrap(), "second+");
        for (output, count) in [
            (output.as_slice(), 1),
            (b"{}\nmalformed".as_slice(), 2),
            (b"{}\n{\"dep\":42}".as_slice(), 2),
        ] {
            assert!(super::parse_repo_mappings(output, count, &mut Default::default()).is_err());
        }
    }

    #[test]
    fn compact_mappings_reference_only_earlier_records() {
        let output = b"{\"dep\":\"first+\"}\n0\n{\"dep\":\"second+\"}\n1\n2\n";
        let parsed =
            super::parse_repo_mappings(output.as_slice(), 5, &mut Default::default()).unwrap();
        let [first, second, third, fourth, fifth] = parsed.mappings.as_slice() else {
            panic!("expected five records");
        };
        assert!(std::sync::Arc::ptr_eq(first, second));
        assert!(std::sync::Arc::ptr_eq(second, fourth));
        assert!(std::sync::Arc::ptr_eq(third, fifth));
        assert_eq!(first["dep"], "first+");
        assert_eq!(third["dep"], "second+");
        for invalid in [
            "0\n",
            "{}\n1\n",
            "{}\n-1\n",
            "{}\n0.0\n",
            "{}\ntrue\n",
            "{}\n[]\n",
            "{}\n18446744073709551616\n",
        ] {
            assert!(
                super::parse_repo_mappings(invalid.as_bytes(), 2, &mut Default::default()).is_err(),
                "{invalid}"
            );
        }
        let mut legacy = super::MappingState {
            format: super::MappingFormat::Json,
            ..Default::default()
        };
        assert!(super::parse_repo_mappings(b"{}\n0\n".as_slice(), 2, &mut legacy).is_err());
    }

    #[cfg(unix)]
    #[test]
    fn compact_mapping_negotiation_requires_the_exact_option_failure() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelClient;

        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("mapping-format");
        std::fs::create_dir_all(&root).unwrap();
        let executable = root.join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
mode=json
if test "$4" = '--output=compact_json'; then mode=compact; fi
printf '%s\n' "$mode" >> "${0%/*}/calls"
cat "${0%/*}/$mode.stdout"
cat "${0%/*}/$mode.stderr" >&2
read status < "${0%/*}/$mode.status"
exit "$status"
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let unsupported = "ERROR: While parsing option --output=compact_json: Not a valid output format: 'compact_json' (should be text, json, graph, streamed_proto or streamed_jsonproto)\n";
        let compact = "{\"dep\":\"repo+\"}\n0\n";
        std::fs::write(
            root.join("json.stdout"),
            "{\"dep\":\"repo+\"}\n{\"dep\":\"repo+\"}\n",
        )
        .unwrap();
        std::fs::write(root.join("json.stderr"), "").unwrap();
        std::fs::write(root.join("json.status"), "0\n").unwrap();
        for (output, errors, status, succeeds, calls) in [
            (compact, "", "0\n", true, "compact\ncompact\n"),
            ("", unsupported, "2\n", true, "compact\njson\njson\n"),
            ("", unsupported, "1\n", false, "compact\n"),
            ("\n", unsupported, "2\n", false, "compact\n"),
            ("{}\n", unsupported, "2\n", false, "compact\n"),
            (
                "",
                "ERROR: repository evaluation failed\n",
                "2\n",
                false,
                "compact\n",
            ),
            ("", "", "0\n", false, "compact\n"),
            ("{}\n", "", "0\n", false, "compact\n"),
            ("{}\n0\n0\n", "", "0\n", false, "compact\n"),
            ("{}\ninvalid\n", unsupported, "2\n", false, "compact\n"),
            (compact, "evaluation failed\n", "2\n", false, "compact\n"),
        ] {
            std::fs::write(root.join("calls"), "").unwrap();
            std::fs::write(root.join("compact.stdout"), output).unwrap();
            std::fs::write(root.join("compact.stderr"), errors).unwrap();
            std::fs::write(root.join("compact.status"), status).unwrap();
            let client = super::BazelCLI::new(&executable);
            let result = client.dump_repo_mappings(&["", "repo+"]);
            assert_eq!(
                result.is_ok(),
                succeeds,
                "stdout={output:?}, stderr={errors:?}, status={status:?}: {result:?}"
            );
            if succeeds {
                let maps = result.unwrap();
                let [first, second] = maps.as_slice() else {
                    panic!("expected two mappings");
                };
                assert!(std::sync::Arc::ptr_eq(first, second));
                client.dump_repo_mappings(&["", "repo+"]).unwrap();
            }
            assert_eq!(std::fs::read_to_string(root.join("calls")).unwrap(), calls);
            if !succeeds {
                std::fs::write(root.join("compact.stdout"), compact).unwrap();
                std::fs::write(root.join("compact.stderr"), "").unwrap();
                std::fs::write(root.join("compact.status"), "0\n").unwrap();
                client.dump_repo_mappings(&["", "repo+"]).unwrap();
                assert_eq!(
                    std::fs::read_to_string(root.join("calls")).unwrap(),
                    "compact\ncompact\n"
                );
            }
        }
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn module_keys_identify_selected_releases_and_overrides() {
        for (edge, key, expected) in [
            ("dependencies", "rules_foo@1.4.1", Some("1.4.1")),
            ("indirectDependencies", "rules_foo@1.4.1", Some("1.4.1")),
            ("dependencies", "rules_foo@_", None),
        ] {
            let mut graph = serde_json::json!({
                "key": "<root>", "dependencies": [], "indirectDependencies": []
            });
            // Older Bazel versions omit name/version when they agree with key;
            // overrides can report a declared version different from the key.
            graph[edge] = serde_json::json!([{"key": key, "version": "1.4.0"}]);
            let output = serde_json::to_vec(&graph).unwrap();
            assert_eq!(
                selected_module_from_graph(&output, "canonical-name").unwrap(),
                Some(SelectedModule {
                    name: "rules_foo".to_owned(),
                    version: expected.map(str::to_owned),
                }),
            );
        }
        let root = br#"{"key":"<root>","name":"main","version":"1.0.0","dependencies":[],"indirectDependencies":[]}"#;
        assert_eq!(
            selected_module_from_graph(root, "").unwrap(),
            Some(SelectedModule {
                name: "main".to_owned(),
                version: None
            }),
        );
        assert!(selected_module_from_graph(root, "missing").is_err());
        assert!(selected_module_from_graph(b"{}", "missing").is_err());
        let ambiguous = br#"{"key":"<root>","dependencies":[{"key":"one@1"},{"key":"two@2"}],"indirectDependencies":[]}"#;
        assert!(selected_module_from_graph(ambiguous, "repo").is_err());
    }

    #[test]
    fn nonmodules_require_positive_repository_provenance() {
        assert_eq!(
            extension_repository_original_name(
                br#"{"canonicalName":"repo","originalName":"generated"}"#,
                "repo"
            )
            .unwrap()
            .as_deref(),
            Some("generated"),
        );
        for output in [
            b"".as_slice(),
            br#"{"canonicalName":"repo"}"#,
            br#"{"canonicalName":"repo","originalName":""}"#,
        ] {
            assert!(extension_repository_original_name(output, "repo")
                .unwrap()
                .is_none());
        }
        for output in [
            b"{}".as_slice(),
            br#"{"canonicalName":"other","originalName":"generated"}"#,
            b"{\"canonicalName\":\"repo\"}\n{\"canonicalName\":\"repo\"}",
        ] {
            assert!(extension_repository_original_name(output, "repo").is_err());
        }
        for output in [
            b"{\"canonicalName\":\"first\",\"originalName\":\"generated\"}\n{}".as_slice(),
            b"{\"canonicalName\":\"first\"}\n{\"canonicalName\":\"first\",\"originalName\":\"generated\"}",
            b"{\"canonicalName\":\"first\",\"originalName\":\"generated\"}\n{\"canonicalName\":\"unrequested\",\"originalName\":\"other\"}",
        ] {
            assert!(super::repository_original_names(output, &["first", "second"]).is_err());
        }
    }

    #[test]
    fn provenance_candidate_prefers_the_largest_group() {
        let mut state = super::MappingState {
            extension_repositories: Some(Default::default()),
            ..Default::default()
        };
        let repositories: Vec<_> = (0..super::MIN_REPOSITORIES_FOR_PROVENANCE)
            .map(|index| format!("first++extension+{index}"))
            .chain(
                (0..=super::MIN_REPOSITORIES_FOR_PROVENANCE)
                    .map(|index| format!("largest++extension+{index}")),
            )
            .collect();
        let repositories: Vec<_> = repositories.iter().map(String::as_str).collect();
        assert_eq!(
            state.provenance_candidate(&repositories),
            repositories.last().copied()
        );
    }

    #[cfg(unix)]
    #[test]
    fn legacy_mapping_queries_share_only_confirmed_extension_repositories() {
        for release in ["release 9.2.0", "release 9.4.0-dzbarsky3"] {
            check_legacy_mapping_reuse(release);
        }
    }

    #[cfg(unix)]
    #[test]
    fn legacy_mapping_queries_reuse_audited_bazel_10_extensions() {
        check_legacy_mapping_reuse("release 10.0.0-pre.20261021.1");
    }

    #[cfg(unix)]
    fn check_legacy_mapping_reuse(release: &str) {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelClient;

        let root = tempfile::tempdir_in(std::env::var_os("TEST_TMPDIR").unwrap()).unwrap();
        let executable = root.path().join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
printf '%s\n' "$*" >> "${0%/*}/calls"
case "$1 $2" in
  'info execution_root') read release < "${0%/*}/release"; printf '%s\n' 'output_base: /output' "release: $release" 'starlark-semantics: enable_bzlmod=true' 'workspace: /workspace' ;;
  'mod graph') exit 1 ;;
  'mod show_repo')
    test ! -f "${0%/*}/fail-provenance" || exit 3
    printf '{"canonicalName":"%s","originalName":"%s"}\n' "${3#@@}" "${3##*+}" ;;
  'mod --enable_bzlmod')
    shift 3
    if test "$1" = '--output=compact_json'; then
      printf '%s\n' "ERROR: While parsing option --output=compact_json: Not a valid output format: 'compact_json' (should be text, json, graph, streamed_proto or streamed_jsonproto)" >&2
      exit 2
    fi
    for repo; do
      case "$repo" in
        'rules++ext+one'|'rules++ext+two') printf '%s\n' '{"seed":"rules++ext+seed","one":"rules++ext+one","two":"rules++ext+two","override":"other+"}' ;;
        'rules++ext+override') printf '%s\n' '{"actual":"different+"}' ;;
        'isolated++ext+one') printf '%s\n' '{"one":"isolated++ext+one"}' ;;
        'generated++ext+'*) cat "${0%/*}/generated-mapping" ;;
        '') printf '%s\n' '{}' ;;
        *) exit 3 ;;
      esac
    done ;;
  *) exit 4 ;;
esac
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        std::fs::write(root.path().join("release"), format!("{release}\n")).unwrap();
        let client = super::BazelCLI::new(&executable);
        client.info().unwrap();
        client.dump_repo_mapping("").unwrap();
        assert_eq!(client.selected_module("rules++ext+seed").unwrap(), None);
        assert_eq!(client.selected_module("isolated++ext+seed").unwrap(), None);
        std::fs::write(root.path().join("calls"), "").unwrap();
        let mappings = client
            .dump_repo_mappings(&[
                "rules++ext+one",
                "isolated++ext+one",
                "rules++ext+two",
                "rules++ext+one",
            ])
            .unwrap();
        assert_eq!(mappings.len(), 4);
        assert!(std::sync::Arc::ptr_eq(&mappings[0], &mappings[2]));
        assert!(std::sync::Arc::ptr_eq(&mappings[0], &mappings[3]));
        assert_eq!(mappings[1]["one"], "isolated++ext+one");
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod --enable_bzlmod dump_repo_mapping rules++ext+one isolated++ext+one\n"
        );

        std::fs::write(root.path().join("calls"), "").unwrap();
        let mappings = client
            .dump_repo_mappings(&[
                "rules++ext+one",
                "isolated++ext+one",
                "rules++ext+two",
                "rules++ext+override",
            ])
            .unwrap();
        assert!(std::sync::Arc::ptr_eq(&mappings[0], &mappings[2]));
        assert_eq!(mappings[3]["actual"], "different+");
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod --enable_bzlmod dump_repo_mapping rules++ext+one isolated++ext+one\nmod --enable_bzlmod dump_repo_mapping rules++ext+override\n"
        );

        std::fs::write(root.path().join("calls"), "").unwrap();
        assert!(client
            .dump_repo_mappings(&["rules++ext+one", "rules++ext+two", "unknown"])
            .is_err());
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod --enable_bzlmod dump_repo_mapping rules++ext+one unknown\nmod --enable_bzlmod dump_repo_mapping rules++ext+one rules++ext+two unknown\n"
        );

        std::fs::write(root.path().join("calls"), "").unwrap();
        assert!(client
            .dump_repo_mappings(&["rules++ext+one", "rules++ext+missing"])
            .is_err());
        assert_eq!(
            std::fs::read_to_string(root.path().join("calls")).unwrap(),
            "mod --enable_bzlmod dump_repo_mapping rules++ext+one\nmod --enable_bzlmod dump_repo_mapping rules++ext+missing\nmod --enable_bzlmod dump_repo_mapping rules++ext+one rules++ext+missing\n"
        );

        for release in ["release 9.4.0-dzbarsky4", "release 10.0.0"] {
            std::fs::write(root.path().join("release"), format!("{release}\n")).unwrap();
            client.info().unwrap();
            assert_eq!(client.selected_module("rules++ext+seed").unwrap(), None);
            std::fs::write(root.path().join("calls"), "").unwrap();
            client
                .dump_repo_mappings(&["rules++ext+one", "rules++ext+two"])
                .unwrap();
            assert_eq!(
                std::fs::read_to_string(root.path().join("calls")).unwrap(),
                "mod --enable_bzlmod dump_repo_mapping rules++ext+one rules++ext+two\n"
            );
        }

        let generated: Vec<_> = (0..=super::MAX_REPOSITORIES_PER_MAPPING_QUERY)
            .map(|index| format!("generated++ext+{index}"))
            .collect();
        let mapping: std::collections::HashMap<_, _> = generated
            .iter()
            .enumerate()
            .map(|(index, repository)| (index.to_string(), repository))
            .collect();
        std::fs::write(
            root.path().join("generated-mapping"),
            format!("{}\n", serde_json::to_string(&mapping).unwrap()),
        )
        .unwrap();
        let requested: Vec<_> = generated.iter().map(String::as_str).collect();
        std::fs::write(root.path().join("release"), format!("{release}\n")).unwrap();
        let fresh_client = super::BazelCLI::new(&executable);
        fresh_client.info().unwrap();
        std::fs::write(root.path().join("calls"), "").unwrap();
        let mappings = fresh_client.dump_repo_mappings(&requested).unwrap();
        assert_eq!(mappings.len(), requested.len());
        assert!(mappings.iter().all(|item| item.len() == requested.len()));
        let calls = std::fs::read_to_string(root.path().join("calls")).unwrap();
        let calls: Vec<_> = calls.lines().collect();
        assert_eq!(calls.len(), 3);
        assert!(
            calls[0].starts_with("mod --enable_bzlmod dump_repo_mapping --output=compact_json ")
        );
        assert!(calls[1].starts_with("mod show_repo @@generated++ext+"));
        assert_eq!(
            calls[2],
            "mod --enable_bzlmod dump_repo_mapping generated++ext+0"
        );

        let requested = &requested[..super::MIN_REPOSITORIES_FOR_PROVENANCE];
        let full_query = format!(
            "mod --enable_bzlmod dump_repo_mapping {}",
            requested.join(" ")
        );
        let failed_client = super::BazelCLI::new(&executable);
        failed_client.info().unwrap();
        failed_client.dump_repo_mapping("").unwrap();
        std::fs::write(root.path().join("fail-provenance"), "").unwrap();
        std::fs::write(root.path().join("calls"), "").unwrap();
        for _ in 0..2 {
            assert_eq!(
                failed_client.dump_repo_mappings(requested).unwrap().len(),
                requested.len()
            );
        }
        let calls = std::fs::read_to_string(root.path().join("calls")).unwrap();
        let calls: Vec<_> = calls.lines().collect();
        assert_eq!(calls.len(), 3);
        assert!(calls[0].starts_with("mod show_repo @@generated++ext+"));
        assert_eq!(calls[1..], [full_query.as_str(), full_query.as_str()]);
    }

    #[cfg(unix)]
    #[test]
    fn failed_queries_do_not_imply_an_unversioned_repository() {
        use std::os::unix::fs::PermissionsExt;

        use super::BazelCLI;
        use super::BazelClient;

        let root = std::path::PathBuf::from(std::env::var_os("TEST_TMPDIR").unwrap())
            .join("selected-module-client");
        std::fs::create_dir_all(&root).unwrap();
        let executable = root.join("bazel");
        std::fs::write(
            &executable,
            r#"#!/bin/sh
case "$2" in
  graph) response=graph ;;
  show_repo) response=repository ;;
  *) exit 99 ;;
esac
cat "${0%/*}/$response.json"
read status < "${0%/*}/$response.status"
exit "$status"
"#,
        )
        .unwrap();
        std::fs::set_permissions(&executable, std::fs::Permissions::from_mode(0o700)).unwrap();
        let response = |name: &str, status: i32, body: &str| {
            std::fs::write(root.join(format!("{name}.json")), body).unwrap();
            std::fs::write(root.join(format!("{name}.status")), format!("{status}\n")).unwrap();
        };
        let client = BazelCLI::new(&executable);
        response("graph", 1, "");
        response(
            "repository",
            0,
            r#"{"canonicalName":"repo","originalName":"extension"}"#,
        );
        assert_eq!(client.selected_module("repo").unwrap(), None);
        response("repository", 0, r#"{"canonicalName":"repo"}"#);
        assert!(client.selected_module("repo").is_err());
        response("repository", 1, "");
        assert!(client.selected_module("repo").is_err());
        response("graph", 0, "malformed graph JSON");
        response(
            "repository",
            0,
            r#"{"canonicalName":"repo","originalName":"extension"}"#,
        );
        assert!(client.selected_module("repo").is_err());
        response(
            "graph",
            0,
            r#"{"key":"<root>","dependencies":[{"key":"rules@1.2.0"}],"indirectDependencies":[]}"#,
        );
        response("repository", 1, "");
        assert_eq!(
            client.selected_module("repo").unwrap(),
            Some(SelectedModule {
                name: "rules".to_owned(),
                version: Some("1.2.0".to_owned()),
            })
        );
        std::fs::remove_dir_all(root).unwrap();
    }
}
