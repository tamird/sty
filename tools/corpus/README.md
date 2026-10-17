# Annotated source corpus

This corpus checks real implementations from eight Bazel projects and callers of
their annotated APIs. Each project owns its `.bzli` files and their mappings in
`sty.toml`. The manifest pins the reviewed revisions; the probes exercise their
public or package-visible APIs.

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
| `with_cfg.bzl` | [tamird/with_cfg.bzl:type-contracts](https://github.com/tamird/with_cfg.bzl/tree/type-contracts) |
| `bazel_features` | [tamird/bazel_features:type-contracts](https://github.com/tamird/bazel_features/tree/type-contracts) |
| `bazel-skylib` | [tamird/bazel-skylib:type-contracts](https://github.com/tamird/bazel-skylib/tree/type-contracts) |
| `apple_support` | [tamird/apple_support:type-contracts](https://github.com/tamird/apple_support/tree/type-contracts) |
| `hermetic-llvm` | [tamird/hermetic-llvm:type-contracts](https://github.com/tamird/hermetic-llvm/tree/type-contracts) |
| `rules_cc` | [tamird/rules_cc:type-contracts](https://github.com/tamird/rules_cc/tree/type-contracts) |
| `rules_rs` | [tamird/rules_rs:type-contracts](https://github.com/tamird/rules_rs/tree/type-contracts) |
| `rules_runfiles_group` | [tamird/rules_runfiles_group:type-contracts](https://github.com/tamird/rules_runfiles_group/tree/type-contracts) |

Each case selects every listed implementation and interface file. sty reads their
associations from the source project's `sty.toml`. Positive callers must pass with
complete coverage and zero diagnostics. Negative cases overlay an incorrect
caller or replace exactly one source fragment, then require the precise
diagnostic ID, source path, and line. Overlays and reports are written to the
output directory. Repository contents are read directly from the pinned checkout.

The cases cover container element types, fixed tuples, optional results, callable
inputs, configurable rule attributes, and provider return lists. The `with_cfg`
frontend and transition-alias callbacks use `list[object]` contracts that check
the outer container. Other provider lists constrain their elements. The manifest
lists the checked API slices.

The Apple action cases check explicit callback parameters alongside gradual
variadic parameters, including incompatible executable types.

The `with_cfg` cases follow attribute values through constructor helpers,
split-transition registrations, argument rewriting, and frontend modes. Parser
cases check tagged selector pieces and the generic per-piece callback helper.
`map_attr` and `compose_select_value` still lack complete contracts for selector
decoding and composition: parsing a selector's representation loses its original
element type, and concatenation can widen the callback's result type. Source
overlays change provider fields and callback results; callers exercise label types
and configuration modes.

The LLVM wrapper cases check its constraint keyword while forwarding other
values as opaque data. The wrapper injects `name`, `data`, and `tags` into an
arbitrary rule's keyword arguments. Its callback contract remains gradual because
the remaining keyword shape and the injected values' compatibility are unproved.

The C++ toolchain configuration contracts cover all thirteen constructor helpers
and their nominal providers, including recursive flag groups. The Rust dependency
contracts cover iterable dependency specifications, optional dictionary
fields, finite key unions, shared dependencies, and platform selectors. Runfiles
group contracts cover entry construction, content conversion, provider lookup, name
rendering, and generic packagers. The packager cases preserve one handle type
through materialization, partial transformations, and merging. A separate context
parameter preserves attributes required by those callbacks. Incompatible handles,
context schemas, and implementations that change the handle type are rejected.

The runner uses sty's coverage report and rendered primary diagnostics. A change
to either format fails visibly and requires updating this harness. Unit tests for
that boundary run with `bazel test //tools/corpus:corpus_test`.
