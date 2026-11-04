# GitHub Actions

Run sty in a dedicated job on an Ubuntu runner. Follow your repository’s
convention for third-party actions: use a [release tag](https://github.com/tamird/sty/tags)
or its full commit SHA. The ref selects both the action and the checker source.
The action builds
`//:sty` with Bazel, using sty's toolchain and lockfile, and caches Bazel downloads
and build outputs. The first run for a revision includes a Rust build.

```yaml
name: Starlark types

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  sty:
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: tamird/sty@sty-action-v0.3.0
```

The default check selects every Git-tracked `.bzl` file in the Bazel workspace.
It respects `.bazelignore` directory entries and stops at nested workspaces.
It checks local implementations against adjacent or registered stubs, including
pairs that no caller loads. When a workspace provides a stub for a dependency,
sty checks the declared functions and values against the source Bazel installed.
For example, if a local stub declares `digest() -> str`, returning an integer
or an untyped value in the installed function fails the check. The stub's
declarations determine which dependency bodies sty checks.

Use `additional-files` to check a BUILD file that calls your macros along with
the tracked implementations. List one workspace-relative path per line:

```yaml
with:
  additional-files: docs/BUILD
```

For a repository with two independent Bazel workspaces, run one job per
workspace. Each gets its own report:

```yaml
jobs:
  sty:
    runs-on: ubuntu-24.04
    strategy:
      fail-fast: false
      matrix:
        workspace: [".", "gazelle"]
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: tamird/sty@sty-action-v0.3.0
        with:
          working-directory: ${{ matrix.workspace }}
```

Use `files` to replace Git discovery with specific sources or directories.
The local interface check still runs. To check an entire dependency file with
your workspace's rules, name its source by its Bazel label:

```yaml
with:
  files: |
    rules/defs.bzl
    @bazel_skylib//lib:shell.bzl
```

When both the stub and the implementation come from dependencies, sty verifies
the stub manifest's version constraint and uses the stub to check callers.

The check follows loads and enables inference of `ctx.attr` fields from Bazel rule
declarations, and reports possibly unbound names and unreachable code. Run the
corresponding local check with:

```sh
sty check --tracked-bzl --check-local-interface-sources --audit-loads \
  --experimental_infer_ctx_attributes --experimental_use_code_flow_analysis
```

See the [stub specification](type-interfaces.md) for supported declarations and
external stub packages.

The step fails on errors and incomplete checks. The job summary groups
warnings by rule; the artifact contains each diagnostic and its source
location. Set severity in `sty.toml` to apply the same policy in the editor,
in the CLI, and in the job:

```toml
[rules]
blanket-ignore-comment = "error"
possibly-unresolved-reference = "error"
division-by-zero = "error"
```

`code-flow-analysis: false` disables the additional flow diagnostics supplied by
the flag; explicitly configured rules retain their configured severity. The default workspace check audits every
transitive load and checks cycles. To change this behavior, set `audit-loads`
explicitly. A custom file or advisory selection enables load auditing only
when requested.

With `--check-local-interface-sources`, an `--ignore_pattern` that excludes an
owned source fails coverage. Ignored sources remain excluded from diagnostics;
the coverage report records the input failure.
The check also fails if no implementation is selected. Configured local sources
that resolve outside the workspace or beneath a nested repository boundary must
be checked from their own workspace instead.

Each run uploads the build log, diagnostics and coverage report, including
after a failed check. The coverage report lists the selected and checked files.

## Separate advisory reports

To run a second, nonblocking check over a different inventory, configure
`files` for the required check and `advisory-pathspecs` for the advisory check.
Supply one [Git pathspec](https://git-scm.com/docs/gitglossary#def_pathspec)
per line to partition a repository with several Bazel workspaces. For example,
check the root and run a separate step in `examples`:

```yaml
with:
  advisory-pathspecs: |
    *.bzl
    :(exclude)examples/**
```

Git evaluates the patterns from `working-directory`. For a custom inventory,
use `advisory-files-from` with one workspace-relative file per line instead.
Both selections use the workspace configuration by default.
The strict selection still fails on errors. The advisory check writes
`advisory/diagnostics.jsonl`, `advisory/coverage.json`, and the requested
`advisory/files.txt` into the artifact. The job summary counts findings across all
checked files, including paired implementations and interfaces. An empty
inventory, missing requested file, incomplete coverage, or tool failure fails
the job.

For a workspace that has no strict selection, set `advisory-only: true`
with either advisory input. This mode requires a nonempty advisory inventory
and rejects the strict `files` input.

Set `advisory-config` to a tracked TOML file to override rules or analysis
settings for the advisory check, for example `../sty-advisory.toml` when checking
a nested workspace. The path is relative to `working-directory`. The workspace's
interface and stub package selections still apply. The artifact includes the
settings as `advisory/config.toml`.

For a tracked fixture installed in another Bazel repository, specify a target
that loads the file and the inventory path that must occur in its load graph:

```yaml
with:
  advisory-files-from: authored-bzl.txt
  advisory-bazel-load-context: '@example//:binary'
  advisory-require-bazel-load-context: fixtures/example/defs.bzl
```

Both inputs accept one entry per line. The checker uses the installed
repository to resolve the fixture's imports. The `bazel_load_context` object
in `advisory/coverage.json` maps requested paths to installed paths when they
differ. A target that does not load the file or loads it under two repository
identities fails the check.

The checked workspace uses its own `.bazelversion`. Set `bazel-version` to an
exact version if the project selects Bazel through another mechanism. For a
nested workspace, set `working-directory` to its path; `files` are relative to
that directory. The default artifact name is `sty` at the checkout root and `sty-<workspace>` elsewhere. Set `artifact-name` for multiple reports from the same workspace.

Use the ordinary `pull_request` event and `contents: read` permissions. Bazel
loads the contributor's repository configuration, so this job belongs on an
unprivileged runner. The action's Bazel setup is scoped to its dedicated job.
