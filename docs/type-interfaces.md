# Starlark stubs

A *stub file* (`.bzli`) declares types for a Starlark module (`.bzl`) or variables
in a BUILD file. A *stub package* contains stub files and a manifest mapping
them to source files.

## Stub files

```starlark
DEFAULT_TIMEOUT: int

def fetch(name: string, timeout: int = ...) -> list[string]: ...
```

A stub consists of variable annotations, function declarations, type aliases,
provider declarations, loads, docstrings, and placeholders. Variable
initializers and parameter defaults are omitted or `...`. A function body
consists of an optional docstring followed by `...` or `pass`. Public variables,
functions, and classes declared in the stub define its exports; loaded names
are available in annotation expressions.

Field-map annotations and type aliases use syntax from
[starlark#362](https://github.com/bazelbuild/starlark/pull/362). The field-map,
openness, and record semantics below are defined by sty. Existing Python-style
provider, TypedDict, and Protocol declarations remain accepted.

For each name loaded from a mapped `.bzl` module, sty uses the stub declaration
when present and source inference otherwise. Annotations are resolved in the
stub's scope. Call checking trusts the stub declarations.

When sty checks a mapped implementation, a single ordinary function declaration
supplies types for its unannotated parameters and return. ty checks the function
body, including paths through its default arguments, and checks that its
signature accepts the stub's calls. Source annotations and type comments take
precedence. Generic annotations retain the stub's type parameters and scope.

This correspondence requires a unique top-level source function with the same
parameter layout. Overloads, aliases, decorated functions, and partially mixed
source and stub generic annotations produce an `invalid-function-interface`
diagnostic when checking the implementation. Generic signatures require complete
annotations in either source or stub. Missing annotations in ordinary signatures
retain gradual typing semantics.

### Overloaded functions

Use `@overload` on consecutive declarations with the same name to describe
multiple call signatures. `overload` is available in the annotation namespace:

```starlark
@overload
def identity(value: int) -> int: ...

@overload
def identity(value: str) -> str: ...
```

Calls use the complete overload family. Each declaration has its own parameter
and result annotations and may declare type parameters. Overload families must
contain at least two declarations. ty checks the declarations and resolves calls
using its ordinary overload rules.

### Shared declarations

Stub loads accept `.bzl` and `.bzli` labels. For example, `shared.bzli` can
declare a public struct type:

```starlark
type Builder = struct[{"build": Callable[[], str]}, ...]
```

Other stubs can import it under a private local name:

```starlark
load(":shared.bzli", _Builder = "Builder")

def builder() -> _Builder: ...
```

## Project configuration

Projects register their own interfaces in `sty.toml` at the Bazel workspace root:

```toml
[type-interfaces]
"lib/paths.bzl" = "lib/paths.bzli"
"BUILD.bazel" = "BUILD.bzli"
```

Paths are relative to the configuration file. The CLI and language server use
these mappings. The CLI also accepts repeatable `--type_interface SOURCE=STUB`
arguments. Each source requires one registration across local mappings, arguments,
and selected stub packages; duplicate registrations are configuration errors.

The `[rules]` table accepts ty and sty diagnostic names with levels `ignore`,
`warn`, or `error`. Unknown names and levels are configuration errors.

### Requiring annotations

Projects can require type contracts at function boundaries:

```toml
[rules]
missing-parameter-annotation = "error"
missing-return-annotation = "error"
missing-type-argument = "error"
```

`missing-parameter-annotation` checks every named parameter, including `*args`
and `**kwargs`. `missing-return-annotation` checks function returns. Both include
private and nested functions and are disabled by default. Inline annotations,
type comments, registered `.bzli` annotations, and generated Bazel contracts
satisfy these rules. Implicit method receivers use ty's inferred receiver type.
Local variables continue to use inference. Projects that prefer inferred returns
can enable only the parameter rule. Generated callback contracts can describe a
function body without declaring its public callable signature; passing that
function under `non-static-type` also requires a complete public annotation.

ty's `missing-type-argument` rejects bare generic annotations such as `list`.

Projects can also require fully known types:

```toml
[rules]
explicit-any = "error"
non-static-type = "error"
unsound-assignment = "error"
unsound-return-statement = "error"
```

`explicit-any` rejects `Any` in inline annotations, type comments, and `.bzli`
declarations, including nested annotations, generic bounds and defaults, and
aliases that resolve to `Any`.
`non-static-type` checks parameters, function returns, assigned variables,
returned values, callees, call arguments, and call results. It reports inferred
types containing `Any` or `Unknown`, including partially known types such as
`list[dict[str, Any]]`. This includes inherited protocol requirements. It also
reports types whose recursive structure prevents ty from establishing that they
are fully static. Both rules are disabled by default.

For a call, each supplied argument must satisfy its selected parameter contract
without relying on `Any` or `Unknown`. The argument values and inferred result
must also be fully static. Omitted optional parameters and unused overloads do
not affect calls whose individual input contracts ty can establish. Otherwise,
the rule conservatively requires the whole callable to be fully static. Storing
or passing a function also checks its whole callable contract. For example,
passing `1` to `int | Any` uses the known `int` alternative, while passing it to
`Any` alone cannot establish a static contract.

An explicit `object` annotation describes an opaque value and satisfies these
rules. Code can narrow that value before using operations that require a more
specific type. Inference retains ty's distinction between `object`, `Any`, and
`Unknown`.

The `analysis` section exposes ty's stricter generic narrowing:

```toml
[analysis]
strict-generic-narrowing = true
```

After a runtime check establishes that an `object` is a list, its elements can
be read as `object`. Mutating that list requires evidence of its element type.
This setting applies to CLI and editor analysis and is independent of diagnostic
severity. It preserves existing `Any` in values that were already gradual.

ty's `unsound-assignment` and `unsound-return-statement` check values crossing
fully static declared variable and return boundaries. They can be enabled while
unannotated code still uses gradual types.

Suppressions use `# ty: ignore[rule-name]`. Unused suppressions are errors by
default, including suppressions made obsolete by adding an annotation.

## BUILD annotations

An explicit mapping such as `BUILD.bazel=BUILD.bzli` applies variable annotations
to the BUILD file's module assignments, including private names:

```starlark
type _Case = dict[{"name": str, "enabled": bool}]

_CASES: list[_Case]
```

Each annotated variable requires one direct assignment to that name in the BUILD
file and one declaration in the stub. Missing, unsupported, and ambiguous
bindings are errors. Helper classes and loads supply annotation types; top-level
function declarations are unsupported. Source type comments take precedence.
ty checks the initializer, subsequent uses, and mutations against the annotation
in the BUILD host context.

## Providers

A provider constructor declaration describes its arguments and the fields of
its instances:

```starlark
def FilesInfo(files: list[File]) -> record[{"files": depset[File]}]: ...
```

The declaration pairs with the source module's `provider(...)` binding,
including aliases and reexports. `FilesInfo` denotes the constructor in value
expressions and its nominal instance type in annotations. Two provider
declarations with the same fields have distinct identities. Recursive fields
can refer to the constructor's name:

```starlark
def Node(value: str, next: Node | None = ...) -> record[{
    "value": str,
    "next": Node | None,
}]: ...
```

Record fields are readonly and required. A closed record describes all fields
of an instance; `record[{"files": depset[File]}, ...]` describes a partial
contract. Additional fields must also satisfy the source provider's `fields`
declaration. `record[...]` is the return annotation of a provider constructor
in a stub. Constructor declarations have one signature.
`Provider[T]` describes a constructor returning `T`.

Constructor type parameters relate input values to stored fields:

```starlark
def Partial[T](*, handle: T, pieces: depset[T]) -> record[{
    "handle": T,
    "pieces": depset[T],
}]: ...

def handles[T](partials: list[Partial[T]]) -> list[T]: ...
```

Calls infer type arguments from their inputs. `Partial[str]` describes an
instance with a `str` handle and `depset[str]` pieces. Specializations of one
provider share its nominal identity. Readonly fields preserve their value types;
a field containing `list[T]` still permits list mutations and therefore
requires compatible element types. Recursive generic provider declarations produce
an `invalid-provider-interface` diagnostic.

Omitted type arguments in annotations use the declaration's defaults. A runtime
provider key identifies every specialization of that provider, so
`target[Partial].handle` has an unknown type, including when the declaration
specifies a default for `T`.

For `provider(init=...)`, a uniquely associated constructor supplies input
types to corresponding unannotated initializer parameters. sty checks the
initializer's returned dictionary against the record, including field types
and required keys. Source annotations take precedence; shared initializers
use source annotations and ordinary inference. Every initializer must accept
its constructor's declared arguments. A defaulted input does not make an
output field optional.

A provider without an initializer stores its keyword arguments directly. Its
constructor declaration therefore uses keyword-only parameters and requires
every promised field:

```starlark
def FilesInfo(*, files: depset[File]) -> record[{"files": depset[File]}]: ...
```

Raw constructors accept stored field values directly and return the same
nominal instance type:

```starlark
def raw_files(*, files: depset[File]) -> FilesInfo: ...
```

For a direct `FilesInfo, raw_files = provider(...)` binding, sty checks the raw
constructor's inferred signature against its declaration.

The Python-style provider declaration remains supported:

```starlark
class FilesInfo:
    files: Final[depset[File]]
    def __init__(self, files: list[File]) -> None: ...
```

Its field declarations form a partial contract. Every declared field is
present; `T | None` permits a present field containing `None`.

## Dictionaries

A dictionary field map assigns a type to each string key:

```starlark
type _Artifact = dict[{"path": str, "checksum": NotRequired[str]}]

ARTIFACTS: list[_Artifact]

def artifact() -> _Artifact: ...
```

The map is closed: values may contain only the declared keys. Fields are required
unless annotated with `NotRequired[T]`. A field of type
`T | None` permits a `None` value; `NotRequired[T]` permits an absent key. ty
checks field values and required keys, and preserves their types through
indexing, `get`, and keyword expansion.

A trailing ellipsis permits additional keys, including in literal values:

```starlark
type _Named = dict[{"name": str}, ...]
```

Additional values have type `object`. The contract permits reading these values;
declared fields retain their individual types and mutability. `ReadOnly[T]`
marks a declared key as readable without permitting assignment or deletion
through this contract.

The equivalent Python-style closed declaration is
`class _Artifact(TypedDict, closed=True)`. An open field map corresponds to
`extra_items=ReadOnly[object]`.

`ExactDict[K, V]` describes dictionaries allocated by dictionary literals,
comprehensions, `dict()`, and dictionary union. It preserves the same invariant
key and value types as `dict[K, V]` and can carry allocation information through
callback parameters and results. Ordinary `dict` and `TypedDict` annotations
cover dictionaries supplied by Bazel as well as these allocations. A native
`type(value) == "dict"` check identifies that broader category.

## Structs

Struct field maps describe immutable attributes structurally:

```starlark
type _Point = struct[{"x": int, "y": int}]
type _HasName = struct[{"name": str}, ...]

def distance(point: _Point) -> int: ...
def name(value: _HasName) -> str: ...
```

`_Point` requires exactly `x` and `y`. `_HasName` requires `name` and permits
additional fields. Independently constructed structs satisfy the same shape
when their fields have compatible types. An open contract does not establish
that other fields are absent, so it cannot satisfy a closed contract.

Struct fields are required unless annotated with `NotRequired[T]`:

```starlark
type _CompilerAttrs = struct[{"compiler": NotRequired[str]}, ...]
```

This contract permits an absent `compiler` field and requires a string when it
is present. A successful `hasattr(value, "compiler")` check preserves its string
type; `getattr(value, "compiler", None)` has type `str | None`. Extra fields in an
open shape do not weaken the types of declared optional fields. The existing
`struct[T]` form bounds field values without declaring their names.

## Selectors

`select[T]` describes configurable values whose branches have type `T`.
sty also tracks the first branch's runtime kind when its value is a
supported literal and the dictionary keys are distinct string literals. It
also recognizes mappings whose values all have one runtime category: strings,
booleans, `None`, or lists and tuples. For these mappings, every possible first
branch has the same kind. The kind determines which selector operations Bazel
accepts. For example, selectors whose first branch is `None` combine with `+`,
including when later branches are
dictionaries; selectors whose first branch is a dictionary combine with `|`.

Inferred types display this information as a second parameter, such as
`select[dict[str, int] | None, Literal["none"]]`. List and tuple branches share
the `"list"` kind. Combined selectors preserve their kind and include the
nullable contributions of both operands in their branch type.

`select[T]` defaults the kind to `Any`, so annotations can describe branch
values while leaving runtime kind unspecified. Mappings with unknown or mixed
value categories retain an unspecified kind, as do integer and dictionary value
types with several native representations. Integer literals retain the `"int"`
category, and literal dictionary branches retain the `"dict"` kind. Bazel uses
several native integer representations, so integer operands carry an `Unknown`
compatibility requirement.

A predicate testing for any selector uses `TypeIs[select[object, object]]`.
The second `object` covers every kind, so both outcomes of the predicate can
narrow its argument. A gradual kind describes an unspecified subset instead.

Bazel 9.2 distinguishes dictionary implementations that share Starlark's
`dict` type. An `ExactDict` branch establishes the `"dict"` selector kind, and
an `ExactDict` operand supports `|` with selectors of that kind. Operations
on a broadly annotated dictionary retain their ordinary inferred result.

## Rule contexts

`Attribute[T]` describes the value an attribute produces in a rule or aspect's
`ctx.attr`. Helpers can preserve named attributes across their return contracts:

```starlark
def attributes() -> dict[{
    "enabled": Attribute[bool],
    "dependency": Attribute[Target],
}]: ...
```

ty checks the helper body against these declarations. An `attr.bool()` cannot
satisfy `Attribute[Target]`; a nullable label requires `Attribute[Target | None]`.
A required dictionary key establishes the corresponding context field. Optional
keys establish only possible fields.

Concrete attribute constructors supply rule-call parameter types, defaults,
flags, and the `ctx.file`, `ctx.files`, and `ctx.executable` views.
`Attribute[T]` carries only the analyzed `ctx.attr` projection. Repository-rule
and macro contexts use their host-specific conversions from concrete descriptors.
Bare `Attribute` leaves its analyzed value unknown.

`ctx[Value, Attrs]` specifies the build-setting value and the fields of
`ctx.attr`. A protocol describes the attribute fields a helper requires:

```starlark
class _Attrs(Protocol):
    @property
    def exports(self) -> Sequence[Target]: ...

def exported(context: ctx[object, _Attrs]) -> Sequence[Target]: ...
```

These contexts retain their native methods and work with native functions.
`ctx` and `ctx[Value]` use the native open `struct[object]` view for attributes;
an attribute without a declared schema has type `object`.
With context inference enabled, eligible rule and aspect registrations supply
schemas from their attribute descriptors.

## Protocols

A protocol describes values by their fields and methods:

```starlark
class _Builder(Protocol):
    def set(self, value: int) -> _Builder: ...
    def build(self) -> str: ...

def builder() -> _Builder: ...
```

Protocol bases are names resolved in the stub's scope. Method signatures use
ordinary function annotations and declaration bodies. ty checks compatibility
structurally. Private helper protocols describe return values and parameters
without declaring a corresponding source export.

Readonly properties describe fields that callers can read but cannot assign.
A named callback protocol preserves the keyword parameters of a callable field:

```starlark
class _Set(Protocol):
    def __call__(self, value: int) -> _Builder: ...

class _Builder(Protocol):
    @property
    def set(self) -> _Set: ...
```

Undecorated special methods for Starlark operations specify their call
signatures: for example, `__call__` describes `value(...)`, `__getitem__`
describes indexing, and `__len__` describes `len(value)`. The same rule applies
to iteration, containment, conversions, and Starlark unary and binary operators.
A readonly property specifies an immutable stored field, including callable
fields and fields named `__call__`.
Undecorated attribute interception and Python class lifecycle methods use
ordinary member requirements.

An explicit `@type_check_only` method supplies the signature used to check an
operation. Explicit runtime attribute access follows the value's fields. A
partial namespace combines named fields with gradual access through other
names:

```starlark
class _Namespace(Protocol):
    @property
    def known(self) -> int: ...

    @type_check_only
    def __getattr__(self, name: str) -> Any: ...
```

Named properties establish the presence of required fields. The getter bounds
values from successful lookups, and `getattr` includes a supplied default in its
result.
Other method declarations require the member on the value's class. Interface
methods accept one bare `@property` or `@type_check_only` decorator.

`struct[T]` bounds the values of existing fields. Required protocol fields need
independent presence evidence, such as explicit constructor keywords or required
keys in an unpacked dictionary. Every Starlark value is assignable to `object`;
attribute access requires a more specific type.

## Packaging

Projects obtain source and stub repositories through Bazel dependencies and
select stub packages in `sty.toml` at the workspace root:

```toml
[[stub-packages]]
manifest = "@rules_foo_stubs//:stubs.toml"
```

Manifest labels use the main repository's mapping. A local manifest can be
specified by a path relative to the configuration file, such as
`stubs/rules_foo/stubs.toml`.

The package manifest defines the source repository, supported versions, and
file mappings:

```toml
# stubs.toml
format-version = 1

[source]
repository = "@rules_foo"
module = "rules_foo"
versions = ["1.4.0", "1.4.1"]

[files]
"foo/defs.bzl" = "foo/defs.bzli"
```

The package declares the Bazel dependencies referenced by its manifest and stub
files. `source.repository` resolves in the package's repository mapping.
`files` maps source paths, relative to the source repository root, to stub paths
relative to the manifest directory. Paths identify installed files within their
respective repositories, including files and directories mounted by symlinks.

## Resolution

Registrations identify a canonical Bazel repository and source file. Each
selected repository instance has its own registrations. Loads within a stub use
its repository's mapping; a load of its mapped implementation resolves the
source definitions.

Each source file may have one registered stub. Packages covering different
files compose. Multiple registrations for the same file are a configuration
error, including identical mappings or stubs declaring different exports.
This rule applies to package manifests and direct CLI mappings. The error
identifies the source file and both registrations.

## Version compatibility

`format-version` identifies the manifest schema. Stub packages have independent
Bazel release versions. `source.versions` is a nonempty list of accepted source
module versions.

Bazel's selected module name must equal `source.module`, and its selected
version must appear in `source.versions`. Bazel dependency declarations specify
minimum versions; compatibility is checked against the resolved module graph.

For a source with no selected module version, a `stub-packages` entry may set
`allow-unversioned = true`. Any available module name must match `source.module`.
Otherwise, an unverifiable version is a configuration error.

Incompatible versions, unsupported manifest schemas, unknown fields, unresolved
repositories, unreadable files, and failed Bazel queries are configuration errors.
