# Annotated source corpus

This corpus checks real implementations from five Bazel projects and callers of
their annotated helpers. Type comments live in those projects. The manifest pins
the reviewed revisions; the probes exercise their public or package-visible APIs.

Run from the sty checkout with the source checkouts under an explicit directory:

```sh
bazel run -c opt //tools/corpus -- \
  --checkouts-root "$HOME/code" \
  --output-dir /tmp/sty-corpus-results
```

The command uses Bazelisk on macOS or Linux with the manifest's Bazel versions.
These match the native versions used to validate the annotation patches, including
Skylib's `8.x` release line and Apple's checkout without a `.bazelversion` file.
An explicit `--bazelisk /path/to/bazelisk` can supply the launcher.
`bazel run` puts its own Bazel binary first on `PATH`; the runner redirects nested
discovery through Bazelisk and checks each report against the manifest's version.
This preserves the source project's validated dependency resolution.
The output directory must be new. The runner verifies each checkout's origin,
commit, and clean status. Revisions are published on the corresponding `tamird`
forks; the manifest's origin identifies the existing source checkout. Prepare those
checkouts at the pinned revisions before running the corpus.

The annotation commits are available on these fork branches:

| Checkout | Published branch |
| --- | --- |
| `with_cfg.bzl` | [tamird/with_cfg.bzl:codex/generic-return-comments](https://github.com/tamird/with_cfg.bzl/tree/codex/generic-return-comments) |
| `bazel_features` | [tamird/bazel_features:type-comments](https://github.com/tamird/bazel_features/tree/type-comments) |
| `bazel-skylib` | [tamird/bazel-skylib:path-type-comments](https://github.com/tamird/bazel-skylib/tree/path-type-comments) |
| `apple_support` | [tamird/apple_support:helper-type-comments](https://github.com/tamird/apple_support/tree/helper-type-comments) |
| `hermetic-llvm` | [tamird/hermetic-llvm:public-helper-types](https://github.com/tamird/hermetic-llvm/tree/public-helper-types) |

Each case selects every listed implementation file. Positive callers must pass
with complete coverage and zero diagnostics. Negative cases overlay an incorrect
caller or replace exactly one source expression, then require the precise
diagnostic ID, source path, and line. Overlays and reports are written to the output
directory. Repository contents are read directly from the pinned checkout.

The cases cover container element types, fixed tuples, optional results, callable
inputs, configurable rule attributes, and provider return lists. The `with_cfg`
frontend's `list[object]` contract checks its outer container; the other provider
lists constrain their elements. The manifest lists the checked API slices.

The runner uses sty's coverage report and rendered primary diagnostics. A change
to either format fails visibly and requires updating this harness. Unit tests for
that boundary run with `bazel test //tools/corpus:corpus_test`.
