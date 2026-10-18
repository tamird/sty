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
The list and selector args paths validate decoded values and return string lists
or `None`, directly or through `select`, together with generated labels. Selected
dictionaries contribute their keys, following Bazel's string-list attribute
conversion. Source overlays reject incorrect leaf results, selector kinds, and
callback arguments.
Location rewriting checks the finite values produced by the parser. Its selected
accumulator combines prefixes and suffixes through the same generic fold as the
list and dictionary mappers. Source overlays check parsed dictionary values,
callback arguments, and the shared list rewriter.
General `map_attr` and `_compose_compat` remain gradual: representation decoding
loses the original element type, and arbitrary callback results determine the
runtime operator family used by composition.
Frontend execution properties use a checked dictionary mapper. Its callback
validates property names and retained values before constructing a dictionary;
the generic mapper preserves key and value types through selected branches and
composition. Probes reject callbacks returning an ordinary `dict` or a list, and
source overlays check incorrect dictionary keys, values, and composition.
Other overlays change provider fields and callback results; callers exercise
label types and configuration modes.

Plain dictionary inputs to `rewrite_args` return mappings with string keys;
tuple inputs retain their string elements. Their cases check prebound dictionaries,
empty inputs, mapping parameters, and incorrect keys, elements, and result types.
The dictionary helper checks keys while sharing value rewriting and collision
order with selected dictionaries.

The LLVM wrapper cases relate explicit `inner_data` to the callback's `data`
parameter. Omitted data uses the empty-list default; list and sequence callbacks
accept it, while tuple-only and selector-only callbacks require explicit data.
The cases also check the constraint keyword. The implementation callback remains
gradual; its forwarding of `data` and compatibility with injected `name`/`tags`
and other keywords remain unproved.

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
