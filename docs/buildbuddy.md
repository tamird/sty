# BuildBuddy builds

The workspace builds sty with Bazel and the Cargo dependency lock. Use a
Bazelisk launcher to select `.bazelversion`. With mise, the equivalent is
`mise x bazel@9.3.1 -- bazel`, without changing global settings.

For a native executable and bounded local work:

```sh
bazel build --jobs=2 //:sty
bazel test --jobs=2 //crates/... //tools/corpus:corpus_test //action/...
```

The `buildbuddy-cache` profile adds a shared cache and build-event reporting.
The `buildbuddy` profile also selects a Linux AMD64 target, a separate Linux
execution platform, the hermetic Zig C toolchain, and a digest-pinned Ubuntu
24.04 worker image. It permits 32 concurrent actions while limiting local CPU
resources to two. The worker image comes from the gVisor BuildBuddy integration.
Linux outputs cannot run as native macOS executables.

```sh
bazel build --config=buildbuddy //:sty
bazel test --config=buildbuddy //crates/... //tools/corpus:corpus_test //action/...
```

The `bb` CLI uses an existing `bb login` for its local and remote commands.
Plain Bazel needs a standard Bazel credential helper. Configure it
in the ignored `.bazelrc.local`, scoped to the actual endpoint. Keep API keys out
of command arguments, rc files, and the client environment recorded by Bazel's
build events. For example, with an existing credential helper:

```text
build:buildbuddy-cache --credential_helper=remote.buildbuddy.io=/absolute/path/to/helper
```

The default endpoint is `remote.buildbuddy.io`. For a different authorized
BuildBuddy instance, override `remote_cache`, `bes_backend`, and
`bes_results_url` in `build:buildbuddy-cache`, plus `remote_executor` in
`build:buildbuddy`, and scope its helper to that instance. A helper scoped to
one instance is not authorization to use another account.

These profiles are opt-in CLI support. The older build and release workflows
still use their original `starpls.buildbuddy.io` configuration; configuring a
personal CLI login does not migrate those workflows or provision their secrets.

## Remote Bazel frontend

Remote execution still leaves loading and analysis on the local machine.
[BuildBuddy Remote Bazel](https://www.buildbuddy.io/docs/remote-bazel/) moves the
entire Bazel frontend to a Linux runner, including repository resolution and
analysis. With the installed `bb` CLI and an authorized account:

```sh
bb remote --os=linux --arch=amd64 build --config=buildbuddy //:sty
bb remote --os=linux --arch=amd64 test --config=buildbuddy //crates/... //tools/corpus:corpus_test //action/...
```

The CLI mirrors local Git changes to its runner. Select `origin` when it asks
which remote to use: this repository also has an upstream Starpls remote.
Use the selected instance's login configuration; the commands above do not
establish a login. Native macOS execution requires a Mac runner, which is a
separate service capability.

`bb remote build` downloads the Linux executable under
`bb-out/bazel-out/k8-fastbuild/bin/crates/starpls/sty` in the local checkout.
The IDE test requests eight remote CPUs for its parallel suite; its test timeout
is unchanged.

## Community corpus

The [corpus runner](../tools/corpus/README.md) checks eight exact source
revisions and 148 positive and negative cases. Its commit and clean-checkout
guards deliberately reject newer PR heads. Restoring those checkouts does not
validate the current drafts. Review and update the pins and probes together
when moving the corpus to newer declarations.

The runner invokes nested Bazel discovery in each checkout. Its end-to-end
command requires those source checkouts and their dependencies on the machine
running it; the source directories are not uploaded automatically by a
`bb remote` command in the sty repository.
