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

Map the repository's implementations to their `.bzli` files in `sty.toml` at the
Bazel workspace root:

```toml
[type-interfaces]
"foo/defs.bzl" = "foo/defs.bzli"
"foo/private/helpers.bzl" = "foo/private/helpers.bzli"
```

The action checks all registered interfaces and every paired implementation owned
by the checked Bazel repository, including pairs from local stub manifests. The
optional `files` input adds implementations or directories, including dependency
sources.
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

The checked workspace uses its own `.bazelversion`. Set `bazel-version` to an
exact version if the project selects Bazel through another mechanism. For a
nested workspace, set `working-directory` to its path; `files` are relative to
that directory. Set `artifact-name` when a workflow checks multiple workspaces.

Use the ordinary `pull_request` event and `contents: read` permissions. Bazel
loads the contributor's repository configuration, so this job belongs on an
unprivileged runner. The action's Bazel setup is scoped to its dedicated job.
