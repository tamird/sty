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
        continue-on-error: true
        with:
          files: |
            foo/defs.bzl
            foo/private/helpers.bzl
```

List the implementations covered by the repository's `.bzli` files and map those
interfaces in `sty.toml` at the Bazel workspace root:

```toml
[type-interfaces]
"foo/defs.bzl" = "foo/defs.bzli"
"foo/private/helpers.bzl" = "foo/private/helpers.bzli"
```

The check reads this configuration, validates the stubs and their implementations,
and follows their loads. It enables inference of `ctx.attr` fields from Bazel rule
declarations. Run the corresponding local check with:

```sh
sty check --experimental_infer_ctx_attributes foo/defs.bzl foo/private/helpers.bzl
```

See the [stub specification](type-interfaces.md) for supported declarations and
external stub packages.

`continue-on-error: true` makes the step advisory while retaining its failing
outcome in the job log. Remove it when the project is ready to require a passing
check. Each run uploads build logs, rendered diagnostics, the selected file list,
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
