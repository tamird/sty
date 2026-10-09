# sty

`sty` (Starlark ty) is an experimental type checker and language server for
[Starlark](https://github.com/bazelbuild/starlark), with Bazel support and
analysis powered by [ty](https://github.com/astral-sh/ty).
It is a fork of [Starpls](https://github.com/withered-magic/starpls).

## Installation

Build the executable from [this repository](https://github.com/tamird/sty):

```sh
bazel build -c opt //:sty
```

The executable is `bazel-bin/crates/starpls/sty` (`sty.exe` on Windows).
Put it on your `PATH` as `sty`, or configure your editor with its absolute path.
Tagged builds use the [releases page](https://github.com/tamird/sty/releases).

### VS Code and Cursor

Install the [Bazel extension](https://github.com/bazelbuild/vscode-bazel),
version 0.10.0 or later, and add this to your editor settings:

```json
{
  "bazel.lsp.command": "sty",
  "bazel.lsp.args": ["server", "--experimental_infer_ctx_attributes"]
}
```

Reload the editor after changing the executable. Bazel metadata loads in the
background while local hover, completion, and navigation are available.
Diagnostics wait for configuration loading to finish; workspace references and
rename require a valid configuration.

For the development extension in this repository, build and copy the server:

```sh
bazel run -c opt //editors/code:copy_sty
```

This writes `editors/code/bin/sty`. The extension's debug launch configuration
uses that executable.

### Other editors

Configure your Starlark language client to launch `sty server` over stdio.
For an existing nvim-lspconfig Starpls configuration, override the executable:

```lua
require("lspconfig").starpls.setup { cmd = { "sty", "server" } }
```

### Migrating from this fork's Starpls name

Rename the workspace configuration from `starpls.toml` to `sty.toml`, and
update editor commands and scripts to launch `sty`.

## Tips and Tricks

### Editor features

In VS Code or Cursor, use **Find All References**, **Rename Symbol**, and
**Go to Definition** on Starlark names. References include unopened Bazel
files in the workspace, loaded dependencies, and configured stubs. An
initial search can take longer while Bazel resolves dependencies.

Rename updates workspace declarations, callers, and uniquely paired `.bzli`
declarations. Renaming an explicit `load` alias changes its local uses;
renaming an export changes its imported spelling and unaliased uses.
External repositories are read-only. Ambiguous stub correspondence, escaped
load spellings, and possible binding collisions produce an error. Dynamic
provider and context fields support navigation; rename requires a source
binding.

Semantic highlighting, selection expansion, folding, and document highlights
use the editor's standard controls. To display inferred types and argument
names inline, enable inlay hints in the editor settings:

```json
{
  "editor.inlayHints.enabled": "on"
}
```

Make sure to use [PEP 484 type comments](https://peps.python.org/pep-0484/#type-comments) to document your function signatures. This helps a ton with autocomplete for situations like `rule` implementation functions. For example, if you add a type comment as in the following...

```python
def _impl(ctx):
    # type: (ctx) -> Unknown
    ctx.
    #  ^ and this period was just typed...
```

then you'll get autocomplete suggestions for the attributes on `ctx`, like `ctx.actions`, `ctx.attr`, and so on!

Type diagnostics and `# type: ignore` use Ty's rules. For a diagnostic spanning multiple lines,
put the suppression on the first or last line of the diagnostic's range. A comment on an interior
line does not suppress the entire diagnostic.

Python-only syntax is diagnosed and its containing statement is omitted from analysis. Valid
neighboring statements are still checked; names introduced only by an omitted statement remain
undefined.

Selector concatenation preserves known element types through nullable payloads:

```python
parts = select({"//:enabled": ["a"], "//conditions:default": None})
combined = parts + [42]  # inferred: select[list[str | int] | None]
```

Empty containers can still contribute `Unknown`: `parts + []` produces
`select[list[str | Unknown] | None]`. Concatenating a macro label-list parameter
with `[]` similarly retains `Label` in `select[list[Label | Unknown] | None]`.

## Batch checking

Run `sty check` from the Bazel workspace with source files or directories:

```sh
sty check --bazel-only --files-from files.txt --progress --report coverage.json
```

`--files-from` reads one path per line; `-` reads standard input. Relative
paths use the current directory. `--bazel-only` selects recognized Bazel
sources and `.bzli` interfaces and records other inputs as exclusions.
Recursive discovery stops at nested repository roots. Explicit paths use
their existing repository context, including Bazel's external directory.

Suppress a diagnostic on its source line with a rule-specific comment:

```starlark
value: str = 42  # ty: ignore[invalid-assignment]
```

Unused suppressions, malformed directives, and unknown Ty rule names are
errors. A check fails when it reports an error, including a suppression
whose diagnostic has been fixed.

For a BUILD file or `.bzl` source installed by a repository rule, use
`--source-overlay LOGICAL=PHYSICAL`. Each mapping selects the logical
file and reads its contents from the physical source. Relative paths use
the current directory. Loads use the logical repository and
package; an overlaid BUILD file establishes its package boundary. This
allows checking owned sources before Bazel downloads their repositories.
Dependencies are fetched as ordinary load resolution requires them.

For `sty check`, repeat `--ignore_pattern` to exclude inputs. A bare name
such as `vendor` matches that file or directory name anywhere in a path.
A path such as `project/tools/vendor` uses exact components to exclude that
workspace-relative file or subtree. Use `./vendor` to limit a single name to
the workspace root. Patterns are literal names and paths; paths use lexical
normalization and must stay within the workspace. These CLI exclusions
apply to recursive discovery, explicit paths, `--files-from`, configured
interface roots, and appear in `excluded_inputs`. Excluded files can still
be loaded as dependencies of selected files. Installed stub declarations
remain available to callers.

Checking resolves loads requested by the selected files and by inference of
their dependencies. Generated dependency trees can contain many
files whose exports selected analysis never needs; resolving loads on
demand avoids their Bazel repository mapping queries. `--audit-loads`
traverses the entire transitive load graph, including unused imports, and
reports load cycles. Editors continue to check load cycles.

Missing external repositories are fetched through Bazel and their loads
retried. Bzlmod repositories are fetched in bounded batches; a failed
multi-repository batch retries each member individually
to determine its outcome. Completed attempts are cached for the check,
including failures. Missing files within an existing repository remain
load failures.

`--progress` reports load discovery, repository mapping batches, fetches,
and file checking on stderr. The JSON report separates selected files,
completed checks, loaded dependencies, exclusions, input failures, and
unresolved loads. Repository names are canonical;
the empty name denotes the main repository, and `null` denotes a source
without a known Bazel repository context.

Report version 2 names the load coverage in `load_scope`: `requested` for
ordinary checking and `transitive` for `--audit-loads`. Requested loads
include those encountered during earlier inference passes in the same
invocation. `complete` means every selected file was checked and every
load in that scope resolved.
`loaded_dependencies` lists successfully resolved dependencies and sources
whose loads were requested; `checked_files` lists selected files and
validated implementations. Requested-load coverage includes failed and
pending loads encountered while inferring dependency exports. Cycle diagnostics are
warnings, separate from load resolution. Deliberate scope exclusions
appear separately. Type errors, failed input paths, and unresolved loads
produce a failing exit status.
Failed Bzlmod fetches leave coverage incomplete, even if they created
partial files. Without Bzlmod, a best-effort repository query may report
unrelated package errors after creating readable sources; coverage then
depends on whether the requested loads resolve. Native errors appear on
stderr in either case.

## Stub files

See the [stub specification](docs/type-interfaces.md) for declarations,
package selection, conflict handling, and versioning.

Select packages in `sty.toml` at the Bazel workspace root. Batch checking
and the language server read this configuration at startup:

```toml
[[stub-packages]]
manifest = "@rules_foo_stubs//:stubs.toml"
```

The language server reloads saved configuration, selected manifests, and Bazel module
and workspace inputs. It watches Starlark files in discovered repositories; saving a
`.bzl` file revalidates selected packages. Restart the server after changes to
`.bazelrc`, `.bazelversion`, or other files read by repository extensions.

Use a `.bzli` stub file to provide types for a `.bzl` module:

```starlark
# types/vendor.bzli
DEFAULT_TIMEOUT: int

def fetch(name: string, timeout: int = ...) -> list[string]:
    """Fetch the named resources."""
    ...
```

Configure the same mapping for batch checking or the language server:

```sh
sty check --type_interface third_party/vendor.bzl=types/vendor.bzli BUILD.bazel
sty server --type_interface third_party/vendor.bzl=types/vendor.bzli
```

Repeat `--type_interface SOURCE=INTERFACE` for additional modules. Relative paths use the main
Bazel workspace root; both files must exist and be readable. Duplicate source mappings are errors.
Names loaded from the mapped `.bzl` module use stub declarations when present and source
inference otherwise. Stubs may load provider types for use in annotations. Function bodies
use `...` or `pass`, and optional defaults use `= ...`.

## Experimental features

sty has a number of experimental features that can be enabled via command-line arguments:

### `--experimental_infer_ctx_attributes`

Infer `ctx.attr`, `ctx.files`, `ctx.file`, `ctx.executable`, `ctx.outputs`,
and `ctx.split_attr` from a rule's attribute declarations. Completion, hover,
and navigation use those declarations. A callback registered by exactly one
rule receives this context; repository rule callbacks receive `ctx.attr`
alongside native repository methods.

```python
def _foo_impl(ctx):
    ctx.attr.bar # type: int

foo = rule(
    implementation = _foo_impl,
    attrs = {
        "bar": attr.int(),
    },
)
```

### `--experimental_use_code_flow_analysis`

Report unreachable code and uses of possibly unbound variables. Type inference always uses code
flow analysis, regardless of this option.

```python
def example():
    return
    print("unreachable") # Reported when this option is enabled.
```

### `--experimental_enable_label_completions`

Enables completions for labels within Bazel files. For example, given the following `BUILD.bazel` file at the repository root:

```python
my_rule(
    name = "foo"
)

my_rule(
    name = "bar",
    srcs = ["//:"],
              # ^ ... If the cursor is here, "foo" will be suggested.
)
```

## Roadmap

- Parsing
    - [x] Error resilient Starlark parser
    - [x] Syntax error reporting
- Semantic highlighting
    - [x] Unbound variables
    - [x] Type mismatches
    - [x] Function call argument validation
- Auto-completion
    - [x] Variables/function parameters
    - [x] Builtin type fields
    - [x] Rule attributes
    - [x] Custom provider fields
    - [x] Custom struct fields
- Hover
    - [x] Variable types
    - [x] Function signatures
    - [x] Function/method docs
- Go to definition
    - [x] Variables (including `load`ed symbols)
    - [x] Function definitions
    - [x] Struct fields
    - [x] Provider fields
    - [x] Labels and targets
    - [ ] Rule attributes
- Document symbols
    - [x] Variables, functions
    - [x] Bazel targets
- Type inference
    - [x] Basic type inference
    - [ ] Dataflow analysis
    - [x] PEP-484 type comments
        - [x] Variables
        - [x] Parameters (only basic types currently supported)
        - [x] Other constructs where type comments are supported
- Third-party integrations
    - [x] Bazel builtins (partial, Bazel builtins are supported but still need to handle a number of edge cases)
    - Special handling for various Bazel constructs
        - [x] `struct`s (autocomplete fields)
        - [x] providers (autocomplete and validate fields)
        - [x] rules defined with `rule` and `repository_rule` (autocomplete and validate attributes)
- Projects
    - [x] Type inference across multiple files
    - [x] `load` support
        - [x] Relative paths
        - [x] Bazel workspace
    - [x] Bazel external repositories
    - [ ] Nested local repositories

## Development

`sty` uses the Rust version pinned in `rust-toolchain.toml` and `MODULE.bazel`.

### Prerequisites

- `pnpm`, for managing Node dependencies
- `protoc`, for compiling `builtin.proto`

Steps to get up and running:
1. Run `pnpm install` in `editors/code`.
2. Open VSCode, `Run and Debug > Run Extension (Debug Build)`.
3. In the extension development host, open a `.star` file and enjoy syntax highlighting and error messages!

## Known Issues

- Type guards are not supported.
- Type checker shows some false positives, especially when the definitions from the builtins proto are incorrect.
    - Because of these two issues, some type checking diagnostics are currently set to display as warnings.
- Type checking + goto definition for symbols loaded from external dependencies will only work if those dependencies have already been fetched. If you see `Could not resolve module` warnings in `load` statements, make sure to run `bazel fetch //...` to make sure the external output base is up-to-date.
- When `--enable-bzlmod` is set, type checking/goto definition may be slow for a given file the first time it is loaded. This is because resolution of repo mappings, done with `bazel mod dump_repo_mappings`, is done lazily.
    - Additionally, when new dependencies are added, the language server needs to be restarted to refresh the mappings. This is due to the fact that repo mappings are cached, which is necessary to avoid slow type checking.

## Acknowledgements

- [Starpls](https://github.com/withered-magic/starpls) provides the Starlark frontend, Bazel integration, and language server foundation.
- [ty and Ruff](https://github.com/astral-sh/ruff) provide the type analysis and shared language tooling used by this fork.
- Starpls was heavily based on [rust-analyzer](https://github.com/rust-lang/rust-analyzer). [Aleksey Kladov's Explaining rust-analyzer series](https://www.youtube.com/playlist?list=PLhb66M_x9UmrqXhQuIpWC5VgTdrGxMx3y) was an important resource for its original author.
- Starpls's original type inference was derived from [Pyright](https://github.com/microsoft/pyright).
