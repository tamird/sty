use std::collections::BTreeMap;
use std::collections::BTreeSet;
use std::ffi::OsStr;
use std::fs;
use std::os::unix::fs::symlink;
use std::path::Component;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::process::Output;
use std::time::Instant;

use anyhow::bail;
use anyhow::ensure;
use anyhow::Context;
use anyhow::Result;
use clap::Parser;
use runfiles::rlocation;
use runfiles::Runfiles;
use serde::Deserialize;

#[derive(Parser)]
/// Check annotated upstream implementations and deliberately incorrect probes.
struct Args {
    #[arg(long)]
    manifest: PathBuf,
    #[arg(long)]
    sty: PathBuf,
    #[arg(long)]
    checkouts_root: PathBuf,
    /// A new directory for overlays, reports, and diagnostic output.
    #[arg(long)]
    output_dir: PathBuf,
    /// Bazelisk launcher; defaults to the launcher supplied by `bazel run`.
    #[arg(long)]
    bazelisk: Option<PathBuf>,
}

struct Checker<'a> {
    sty: &'a Path,
    runfiles: &'a Runfiles,
    fixtures: &'a Path,
    path: &'a OsStr,
    bazel_version: &'a str,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Repository {
    directory: PathBuf,
    origin: String,
    commit: String,
    bazel_version: String,
    sources: Vec<PathBuf>,
    #[serde(default)]
    interfaces: BTreeMap<PathBuf, PathBuf>,
    cases: Vec<Case>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Case {
    name: String,
    overlays: Vec<Overlay>,
    expected: Vec<ExpectedDiagnostic>,
}

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
enum Overlay {
    File {
        path: PathBuf,
        fixture: PathBuf,
    },
    Replace {
        path: PathBuf,
        old: String,
        new: String,
    },
}

#[derive(Debug, Deserialize, Eq, Ord, PartialEq, PartialOrd)]
#[serde(deny_unknown_fields)]
struct ExpectedDiagnostic {
    id: String,
    path: PathBuf,
    line: usize,
}

#[derive(Deserialize)]
struct Report {
    version: u32,
    load_scope: String,
    workspace: PathBuf,
    bazel_release: String,
    selected_files: Vec<ReportFile>,
    checked_files: Vec<ReportFile>,
    excluded_inputs: serde_json::Map<String, serde_json::Value>,
    input_errors: Vec<serde_json::Value>,
    unresolved_loads: Vec<serde_json::Value>,
    diagnostics: Counts,
    complete: bool,
}

#[derive(Deserialize)]
struct ReportFile {
    path: PathBuf,
}

#[derive(Deserialize)]
struct Counts {
    errors: usize,
    warnings: usize,
    infos: usize,
}

fn relative(path: &Path) -> Result<()> {
    ensure!(
        !path.as_os_str().is_empty()
            && path
                .components()
                .all(|part| matches!(part, Component::Normal(_))),
        "expected a nonempty relative path: {}",
        path.display()
    );
    Ok(())
}

fn git(checkout: &Path, args: &[&str]) -> Result<String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(checkout)
        .args(args)
        .output()?;
    ensure!(
        output.status.success(),
        "git {args:?}: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let text = String::from_utf8(output.stdout)?;
    Ok(text.trim().to_owned())
}

fn repository_identity(checkout: &Path, origin: &str, commit: &str) -> Result<()> {
    let actual_origin = git(checkout, &["remote", "get-url", "origin"])?;
    ensure!(
        github_repository(&actual_origin)? == github_repository(origin)?,
        "origin: expected {origin}, got {actual_origin}"
    );
    let actual_commit = git(checkout, &["rev-parse", "HEAD"])?;
    ensure!(
        actual_commit == commit,
        "revision: expected {commit}, got {actual_commit}"
    );
    let status = git(
        checkout,
        &["status", "--porcelain", "--untracked-files=all"],
    )?;
    ensure!(status.is_empty(), "checkout has changes:\n{status}");
    Ok(())
}

fn github_repository(origin: &str) -> Result<&str> {
    let repository = origin
        .strip_prefix("https://github.com/")
        .or_else(|| origin.strip_prefix("git@github.com:"))
        .context("expected an HTTPS or SSH GitHub origin")?;
    Ok(repository.strip_suffix(".git").unwrap_or(repository))
}

fn replace_once(source: &str, old: &str, new: &str) -> Result<String> {
    ensure!(
        !old.is_empty() && source.matches(old).count() == 1,
        "replacement must match exactly once: {old:?}"
    );
    Ok(source.replacen(old, new, 1))
}

// The pinned CLI's rendered diagnostics have one header and a first primary
// location. Secondary locations and notes cannot satisfy an expected error.
fn diagnostics(text: &str, checkout: &Path) -> Result<Vec<ExpectedDiagnostic>> {
    ensure!(
        !text.contains('\u{1b}'),
        "unexpected ANSI escapes in diagnostic output"
    );
    let mut result = Vec::new();
    let mut pending = None;
    for line in text.lines() {
        if let Some(header) = line.strip_prefix("error[") {
            ensure!(
                pending.is_none(),
                "diagnostic has no primary source location"
            );
            let (id, _message) = header
                .split_once("]: ")
                .context("unrecognized error header")?;
            ensure!(!id.is_empty(), "empty diagnostic ID");
            pending = Some(id.to_owned());
        } else if line.starts_with("error:")
            || line.starts_with("warning[")
            || line.starts_with("warning:")
        {
            bail!("unexpected diagnostic: {line}");
        } else if line.starts_with("info:") || line.trim_start().starts_with(":::") {
            ensure!(
                pending.is_none(),
                "diagnostic reaches a note without a primary location"
            );
        } else if let Some(location) = line.trim_start().strip_prefix("--> ") {
            if let Some(id) = pending.take() {
                let (path_line, column) =
                    location.rsplit_once(':').context("missing source column")?;
                let (path, line) = path_line.rsplit_once(':').context("missing source line")?;
                let _column: usize = column.parse()?;
                let line = line.parse()?;
                let path = Path::new(path);
                let path = path.strip_prefix(checkout).unwrap_or(path).to_owned();
                relative(&path)?;
                result.push(ExpectedDiagnostic { id, path, line });
            }
        }
    }
    ensure!(
        pending.is_none(),
        "diagnostic has no primary source location"
    );
    result.sort();
    Ok(result)
}

fn checked_paths(files: Vec<ReportFile>) -> BTreeSet<PathBuf> {
    files.into_iter().map(|ReportFile { path }| path).collect()
}

fn check_report(
    report: Report,
    checkout: &Path,
    selected: &BTreeSet<PathBuf>,
    errors: usize,
    bazel_version: &str,
) -> Result<()> {
    let Report {
        version,
        load_scope,
        workspace,
        bazel_release,
        selected_files,
        checked_files,
        excluded_inputs,
        input_errors,
        unresolved_loads,
        diagnostics,
        complete,
    } = report;
    let Counts {
        errors: actual_errors,
        warnings,
        infos,
    } = diagnostics;
    ensure!(
        version == 2 && load_scope == "requested",
        "unexpected coverage report version or load scope"
    );
    ensure!(
        workspace == checkout,
        "report workspace differs from the selected checkout"
    );
    ensure!(
        bazel_release == format!("release {bazel_version}"),
        "expected Bazel {bazel_version}, got {bazel_release}"
    );
    ensure!(complete, "source check was incomplete");
    ensure!(
        excluded_inputs.is_empty() && input_errors.is_empty() && unresolved_loads.is_empty(),
        "source check excluded inputs or failed to resolve them"
    );
    ensure!(
        checked_paths(selected_files) == *selected,
        "report selected files differ from requested sources"
    );
    ensure!(
        checked_paths(checked_files) == *selected,
        "report checked files differ from requested sources"
    );
    ensure!(actual_errors == errors && warnings == 0 && infos == 0, "report counts: {actual_errors} errors, {warnings} warnings, {infos} infos; expected {errors} errors");
    Ok(())
}

fn run_case(
    checker: &Checker<'_>,
    checkout: &Path,
    output: &Path,
    sources: &[PathBuf],
    interfaces: &BTreeMap<PathBuf, PathBuf>,
    case: Case,
) -> Result<()> {
    let Checker {
        sty,
        runfiles,
        fixtures,
        path,
        bazel_version,
    } = checker;
    let Case {
        name,
        overlays,
        mut expected,
    } = case;
    relative(Path::new(&name))?;
    let output = output.join(&name);
    fs::create_dir(&output)?;
    let report_path = output.join("report.json");
    let mut command = Command::new(sty);
    command
        .current_dir(checkout)
        .env("PATH", path)
        .env("USE_BAZEL_VERSION", bazel_version)
        .env("NO_COLOR", "1")
        .args(["check", "--experimental_infer_ctx_attributes", "--report"])
        .arg(&report_path);
    let mut selected = BTreeSet::new();
    for source in sources {
        relative(source)?;
        let path = checkout.join(source);
        ensure!(path.is_file(), "source does not exist: {}", path.display());
        selected.insert(path);
    }
    for (source, interface) in interfaces {
        relative(source)?;
        relative(interface)?;
        ensure!(
            sources.contains(source),
            "interface source must be a selected implementation: {}",
            source.display()
        );
        let source = checkout.join(source);
        let interface = checkout.join(interface);
        ensure!(
            interface.is_file(),
            "interface does not exist: {}",
            interface.display()
        );
        command.arg("--type_interface").arg(format!(
            "{}={}",
            source.display(),
            interface.display()
        ));
        selected.insert(interface);
    }
    let mut overlaid = BTreeSet::new();
    for (index, overlay) in overlays.into_iter().enumerate() {
        let (path, content) = match overlay {
            Overlay::File { path, fixture } => {
                relative(&fixture)?;
                ensure!(
                    !checkout.join(&path).exists(),
                    "fixture cannot replace an implementation: {}",
                    path.display()
                );
                let fixture = rlocation!(runfiles, fixtures.join(fixture))
                    .context("fixture runfile missing")?;
                let content = fs::read_to_string(fixture)?;
                (path, content)
            }
            Overlay::Replace { path, old, new } => {
                relative(&path)?;
                ensure!(
                    sources.contains(&path),
                    "replacement must target a selected implementation: {}",
                    path.display()
                );
                let source = fs::read_to_string(checkout.join(&path))?;
                let content = replace_once(&source, &old, &new)?;
                (path, content)
            }
        };
        relative(&path)?;
        ensure!(
            overlaid.insert(path.clone()),
            "source overlaid twice: {}",
            path.display()
        );
        let logical = checkout.join(path);
        let physical = output.join(format!("overlay-{index}.bzl"));
        fs::write(&physical, content)?;
        command.arg("--source-overlay").arg(format!(
            "{}={}",
            logical.display(),
            physical.display()
        ));
        selected.insert(logical);
    }
    command.args(&selected);
    let start = Instant::now();
    let Output {
        status,
        stdout,
        stderr,
    } = command.output()?;
    let elapsed = start.elapsed();
    fs::write(output.join("stdout.log"), &stdout)?;
    fs::write(output.join("stderr.log"), &stderr)?;
    let text = format!(
        "{}\n{}",
        String::from_utf8(stdout)?,
        String::from_utf8(stderr)?
    );
    let actual = diagnostics(&text, checkout)?;
    expected.sort();
    ensure!(
        actual == expected,
        "diagnostics differ:\nexpected {expected:?}\nactual {actual:?}"
    );
    let report = fs::read(&report_path)?;
    let report = serde_json::from_slice(&report)?;
    check_report(report, checkout, &selected, expected.len(), bazel_version)?;
    let expected_exit = if expected.is_empty() { 0 } else { 1 };
    ensure!(
        status.code() == Some(expected_exit),
        "expected exit {expected_exit}, got {status}"
    );
    println!(
        "{name}: {} files, {} expected errors, {:.3}s",
        selected.len(),
        expected.len(),
        elapsed.as_secs_f64()
    );
    Ok(())
}

fn main() -> Result<()> {
    let Args {
        manifest,
        sty,
        checkouts_root,
        output_dir,
        bazelisk,
    } = Args::parse();
    let runfiles = Runfiles::create()?;
    let fixtures = manifest
        .parent()
        .context("manifest has no parent directory")?;
    let sty = rlocation!(runfiles, sty).context("sty runfile missing")?;
    let checkouts_root = fs::canonicalize(checkouts_root)?;
    let manifest_file = rlocation!(runfiles, &manifest).context("manifest runfile missing")?;
    let content = fs::read(manifest_file)?;
    let repositories: Vec<Repository> = serde_json::from_slice(&content)?;
    ensure!(
        !repositories.is_empty(),
        "manifest contains no repositories"
    );
    let output_parent = output_dir
        .parent()
        .context("output directory needs a parent")?;
    let output_parent = fs::canonicalize(output_parent)?;
    let output_name = output_dir
        .file_name()
        .context("output directory needs a name")?;
    let output_dir = output_parent.join(output_name);
    ensure!(
        !output_dir.starts_with(&checkouts_root),
        "output directory must be outside the checkout root"
    );
    fs::create_dir(&output_dir).context("output directory must be new")?;
    let output_dir = fs::canonicalize(output_dir)?;
    // Bazelisk puts the outer Bazel binary on PATH during `bazel run`.
    // Invoke the launcher again so each source checkout uses its own version.
    let inherited_path = std::env::var_os("PATH").context("PATH is unset")?;
    let bazelisk = bazelisk
        .or_else(|| std::env::var_os("BAZELISK").map(PathBuf::from))
        .or_else(|| {
            std::env::split_paths(&inherited_path)
                .map(|directory| directory.join("bazelisk"))
                .find(|path| path.is_file())
        })
        .context("run through Bazelisk or pass --bazelisk with its existing executable")?;
    let bazelisk = fs::canonicalize(bazelisk)?;
    let bin = output_dir.join("bin");
    fs::create_dir(&bin)?;
    symlink(bazelisk, bin.join("bazel"))?;
    let path =
        std::env::join_paths(std::iter::once(bin).chain(std::env::split_paths(&inherited_path)))?;
    let started = Instant::now();
    for Repository {
        directory,
        origin,
        commit,
        bazel_version,
        sources,
        interfaces,
        cases,
    } in repositories
    {
        ensure!(
            !sources.is_empty() && !cases.is_empty(),
            "repository must select implementations and cases"
        );
        relative(&directory)?;
        let checkout = fs::canonicalize(checkouts_root.join(&directory))?;
        repository_identity(&checkout, &origin, &commit)
            .with_context(|| directory.display().to_string())?;
        let checker = Checker {
            sty: &sty,
            runfiles: &runfiles,
            fixtures,
            path: &path,
            bazel_version: &bazel_version,
        };
        let output = output_dir.join(&directory);
        fs::create_dir(&output)?;
        println!("{} at {commit}", directory.display());
        for case in cases {
            let name = case.name.clone();
            run_case(&checker, &checkout, &output, &sources, &interfaces, case).with_context(
                || {
                    format!(
                        "{} / {name}; evidence: {}",
                        directory.display(),
                        output.display()
                    )
                },
            )?;
        }
        repository_identity(&checkout, &origin, &commit)?;
    }
    println!("Complete in {:.3}s", started.elapsed().as_secs_f64());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn primary_location_is_required() {
        let text = "error[invalid-return-type]: wrong return\n  --> lib/body.bzl:4:5\ninfo: declaration\n  --> contract.bzli:9:1\n";
        assert_eq!(
            diagnostics(text, Path::new("/repo")).unwrap(),
            vec![ExpectedDiagnostic {
                id: "invalid-return-type".into(),
                path: "lib/body.bzl".into(),
                line: 4,
            }]
        );
        assert!(diagnostics(
            "error[invalid-return-type]: no location",
            Path::new("/repo")
        )
        .is_err());
        assert!(diagnostics(
            "error[new]: missing location\nerror[next]: next\n --> x.bzl:1:2",
            Path::new("/repo")
        )
        .is_err());
        assert!(diagnostics("error: different format", Path::new("/repo")).is_err());
        assert!(diagnostics(
            "error[wrong]: no primary\ninfo: declaration\n --> x.bzl:1:2",
            Path::new("/repo")
        )
        .is_err());
    }

    #[test]
    fn mutation_must_have_one_source_match() {
        assert_eq!(
            replace_once("return value", "value", "42").unwrap(),
            "return 42"
        );
        assert!(replace_once("return other", "value", "42").is_err());
        assert!(replace_once("value + value", "value", "42").is_err());
    }

    #[test]
    fn coverage_must_include_the_implementation() {
        let checkout = Path::new("/repo");
        let selected = BTreeSet::from([checkout.join("source.bzl"), checkout.join("probe.bzl")]);
        let report = || Report {
            version: 2,
            load_scope: "requested".into(),
            workspace: checkout.into(),
            bazel_release: "release 9.2.0".into(),
            selected_files: selected
                .iter()
                .map(|path| ReportFile { path: path.clone() })
                .collect(),
            checked_files: selected
                .iter()
                .map(|path| ReportFile { path: path.clone() })
                .collect(),
            excluded_inputs: Default::default(),
            input_errors: Vec::new(),
            unresolved_loads: Vec::new(),
            diagnostics: Counts {
                errors: 0,
                warnings: 0,
                infos: 0,
            },
            complete: true,
        };
        check_report(report(), checkout, &selected, 0, "9.2.0").unwrap();
        let mut fixture_only = report();
        fixture_only
            .checked_files
            .retain(|file| file.path.ends_with("probe.bzl"));
        assert!(check_report(fixture_only, checkout, &selected, 0, "9.2.0").is_err());
    }
}
