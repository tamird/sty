# GitHub Actions

Run sty in a dedicated job on an Ubuntu runner. Pin the action to a full commit
SHA; that pin selects both the action and the checker source. The action builds
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
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          persist-credentials: false
      - uses: tamird/sty@FULL_COMMIT_SHA
```

Ship a companion next to the implementation, for example `foo/defs.bzli` next
to `foo/defs.bzl`. The action checks each companion against its implementation
in the current Bazel repository, including pairs that no caller loads. It also
checks registered interfaces and their locally owned sources. The optional
`files` input adds implementations or directories, including dependency sources.

The check follows loads and enables inference of `ctx.attr` fields from Bazel rule
declarations, and reports possibly unbound names and unreachable code. Run the
corresponding local check with:

```sh
sty check --check-local-interface-sources --experimental_infer_ctx_attributes --experimental_use_code_flow_analysis
```

See the [stub specification](type-interfaces.md) for supported declarations and
external stub packages.

The step fails on type errors. Set diagnostic severities in `sty.toml`:

```toml
[rules]
blanket-ignore-comment = "error"
possibly-unresolved-reference = "error"
division-by-zero = "error"
```

An `unverified-overload` error means a paired implementation could not be checked
against every declared overload.

`code-flow-analysis: false` disables the additional flow diagnostics supplied by
the flag; explicitly configured rules retain their configured severity. Set
`audit-loads: true` to resolve every transitive load and check cycles. Load auditing
does not select dependency bodies for checking.

With `--check-local-interface-sources`, an `--ignore_pattern` that excludes an
owned source fails coverage. Ignored sources remain excluded from diagnostics;
the coverage report records the input failure.
The check also fails if no implementation is selected. Configured local sources
that resolve outside the workspace or beneath a nested repository boundary must
be checked from their own workspace instead.

Each run uploads build logs, rendered diagnostics, the requested file list,
and a JSON coverage report as the `sty` artifact, including after a failed check.
Build failures appear in the build step and its log; a successful type check
requires successful dependency resolution and complete selected-file coverage.

To report findings outside the strict selection, supply `advisory-files-from`:
a file containing one workspace-relative path per line.
Generate that inventory from tracked source files in each Bazel workspace.
The action runs the same checker and configuration for both selections.
The strict selection still fails on errors. The advisory check writes
`advisory/diagnostics.jsonl`, `advisory/coverage.json`, and the requested
`advisory/files.txt` into the artifact. The job summary counts findings across all
checked files, including paired implementations and interfaces. An empty
inventory, missing requested file, incomplete coverage, or tool failure fails
the job.

For a workspace that has no strict selection, set `advisory-only: true`
with `advisory-files-from`. This mode requires a nonempty advisory inventory
and rejects the strict `files` input.

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
that directory. Set `artifact-name` when a workflow checks multiple workspaces.

Use the ordinary `pull_request` event and `contents: read` permissions. Bazel
loads the contributor's repository configuration, so this job belongs on an
unprivileged runner. The action's Bazel setup is scoped to its dedicated job.
