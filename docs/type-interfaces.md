# Starlark stubs

A *stub file* (`.bzli`) declares types for a Starlark module (`.bzl`) or bindings
in a BUILD or MODULE.bazel file. A *stub package* contains stub files and a
manifest mapping them to source files.

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

When Bazel type checks a `.bzl` source file, annotation names must resolve in
that Bazel version's type environment. Bazel type names and runtime type names
can differ: `Ctx` describes a build-rule context with runtime type `ctx`.
A `.bzli` file also accepts sty-specific names such as `repository_ctx`.

For each name loaded from a mapped `.bzl` module, sty uses the stub declaration
when present and source inference otherwise. Annotations are resolved in the
stub's scope. Call checking trusts the stub declarations.

When sty checks a mapped implementation, a single ordinary function declaration
supplies types for its unannotated parameters and return. ty checks the function
body, including paths through its default arguments, and checks that its
signature accepts the stub's calls. Source annotations and type comments take
precedence. Generic annotations retain the stub's type parameters and scope.

A stub variable annotation also supplies the declared type of a unique,
direct module assignment with the same name. ty checks the assigned value in
the stub annotation's context, including private bindings used by functions.

Annotation expressions in the implementation can also refer to declarations and
imports in its registered stub. Source lexical bindings take precedence over
these names. Stub declarations are available in annotations and type comments;
runtime expressions use the implementation's own bindings.

Bazel 9 `.bzl` files can declare top-level aliases such as `type Name = str`
and `type Names[T] = list[T]` when type syntax is enabled. sty resolves these
names in type expressions. In Bazel's default syntax-only mode, an alias is
separate from runtime bindings and module exports.

This body correspondence requires a unique top-level source function with the
same parameter layout. Decorated functions and partially mixed source and stub
generic annotations produce an `invalid-function-interface` diagnostic when
checking the implementation. Generic signatures require complete annotations
in either source or stub. Missing annotations in ordinary signatures retain
gradual typing semantics.

A function declaration can also describe a unique source binding whose value is
callable, such as a generated rule or a function alias. sty compares the value's
inferred signature with the declaration, including its parameter and return
types. The aliased implementation is inferred using its own annotations.
Incomplete source signatures remain gradual; `non-static-type` can require
them to be fully known.

The `function` annotation describes a Starlark `def` or `lambda` value. A
`Callable` annotation describes a call signature and also accepts other kinds
of callable values, including builtins.

### Materialized types

sty exposes ty's experimental `Top[T]` in its annotation namespace. It describes
the union of every fully static form of `T`. For example, a `.bzli` predicate
can use `Top[list[Unknown]]` to accept a list with any element type and preserve
an already known element type during narrowing:

```starlark
def is_list(value: object) -> TypeIs[Top[list[Unknown]]]: ...
```

Elements of an otherwise unknown list can be read as `object`; adding an element
requires knowing that the list's element type accepts it.

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

To check a mapped source implementation, follow the overload family
with an ordinary declaration that has complete parameter and return annotations:

```starlark
@overload
def identity(value: int) -> int: ...

@overload
def identity(value: str) -> str: ...

def identity(value: int | str) -> int | str: ...
```

ty checks the overloads against the ordinary implementation signature. Source
annotations still take precedence, and callers see only the overloads. Generic
implementation variables are inferred from each overload's inputs. A generic
implementation requires a fully static specialization. Unresolved inference,
generic variadics, and receiver-dependent generics produce
`invalid-function-interface` when checking mapped source. Families without an
explicit implementation produce the same diagnostic.

When the source adopts its entire signature from the stub, ty checks supported
bodies under each overload's parameter and result types. Supported bodies include
assignments, conditionals, callback calls, builtin list and dictionary
construction, supported collection methods, and typed `**kwargs`. Generic inputs
must yield a complete static implementation specialization. Optional parameters
retain the actual source default wherever the overload permits omission.

If every overload is supported, these separate views own body type diagnostics
and `non-static-type` checks, preserving relationships between parameters.
Declarations, default expressions, and condition warnings keep their shared
source interpretation.

For example, an overload promising `str` when a flag is `True` rejects `return 42`
in that branch even when the shared implementation permits `int | str`. Captures,
loops, comprehensions, and unsupported mutation or escape paths retain checking
under the shared implementation signature. Checking the paired source reports
`unverified-overload` when ty cannot check every overload against that body.
Function aliases also receive this diagnostic because the paired overloads do
not apply to the target body. Other callable values require a static signature
that satisfies every overload. Ordinary checks and supported overload checks
still run. The original `**kwargs` dictionary supports reads,
copies, and keyword expansion. Direct mutation, storage in another variable or
container, and returning that dictionary require the shared-signature check.

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

### Bazel rule keywords

`CommonRuleAttrs` is a closed dictionary schema for common Bazel rule
attributes such as `tags`, `visibility`, and `target_compatible_with`.
`CommonExecutableRuleAttrs` also includes `args` and `output_licenses`.
Both omit `name`, which wrappers declare separately:

```starlark
def wrapper(name: str, **kwargs: Unpack[CommonRuleAttrs]) -> None: ...
```

Every key is optional. Values follow the corresponding rule's attribute
contract, including `None` and configurable inputs. The selected Bazel
inventory determines available attributes and accepted aliases.

`KeywordArgs[callable, "excluded"]` projects the remaining keyword
parameters of an existing callable into a closed dictionary schema. It
preserves parameter types and whether each keyword is required:

```starlark
load(":tool.bzl", _tool = "tool")

def wrapper(name: str, **kwargs: Unpack[KeywordArgs[_tool, "name"]]) -> None: ...
```

A sidecar can import a public rule from its paired source file. The callable
expression follows ordinary lexical binding, including aliases and shadowing.
The supported contract is one nongeneric signature with fully known input
kinds and types. Positional-only parameters, variadic or open keyword tails,
overloads, and gradual inputs produce `invalid-type-form`. Excluded names
must be unique string literals naming existing keyword parameters; additional
exclusions can follow as more string arguments. Excluding a name describes the
residual keyword row; the wrapper body must still supply any required argument.
Wrapper-specific inputs belong in the wrapper's own signature.

A callable `Protocol` class projects the signature of its instances. A stub
can use this form to replace individual inputs while forwarding the remaining
keywords through the implementation's `**kwargs`:

```starlark
load(":tool.bzl", _tool = "tool")

class _Wrapper(Protocol):
    def __call__(self, *, srcs: list[str], **kwargs: Unpack[KeywordArgs[_tool, "srcs"]]) -> None: ...

def wrapper(**kwargs: Unpack[KeywordArgs[_Wrapper]]) -> None: ...
```

sty can project a rule's keyword row from a fresh attribute mapping stored in
an immutable field. The row remains incomplete if the mapping may be mutated
through an alias.

For mappings loaded from Bazel `.bzl` modules, sty observes their contents after
module evaluation, when Bazel freezes the exported values. Writes during module
evaluation still apply; untracked aliases and escapes leave the row incomplete.

### Internal Java namespace

`JavaCommonInternal` names the fixed namespace returned by Bazel's
`java_common.internal_DO_NOT_USE()`. It checks the eleven exported methods,
including compilation inputs and keyword-only options. Source-owned interfaces
use this annotation for Bazel's internal Java namespace.

### Download results

`repository_ctx` and `module_ctx` download methods retain their success and
checksum fields. With `allow_fail = True` or an unknown flag, check `success`
before using `integrity` or `sha256`. A non-SHA256 integrity checksum omits
`sha256`; an unknown algorithm requires an attribute-presence check.

`download(block = False)` returns a pending download whose `wait()` returns
the same completed result type. Flags supplied through `**kwargs` currently
retain all possible outcomes. `size_bytes` is possibly absent because the
native inventory does not distinguish hosts before Bazel 9.3; use `hasattr`
or `getattr(result, "size_bytes", default)` when reading it.

### JSON values

By default, `json.decode` permits gradual schema-dependent access while
preserving string keys in decoded objects at every nesting level.

Set `analysis.static-json-decode = true` to check decoded values using Bazel's
outer result domain: `None`, `bool`, `int`, `float`, `str`, `list[object]`, or
`dict[str, object]`. Check the outer type before using the value. Decoded
containers are mutable, so their elements have type `object`; only outer JSON
objects retain the string-key guarantee. A supplied default adds its own type
to the result in either mode.

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
can enable only the parameter rule.

With `--experimental_infer_ctx_attributes`, a local named implementation passed
to a module-level `rule`, `repository_rule`, or `aspect` registration uses its
generated parameter contract at that registration. A shared implementation's
body accepts the union of all its registered contexts. Explicit parameter annotations take precedence, and
sty checks that each registration can invoke the callback with its runtime
arguments. This verifies input domains; Bazel-specific restrictions on returned
providers are not checked. Return annotations remain required for a fully static
callback. The function's public signature is unchanged: storing it or passing it elsewhere
still requires a complete callable contract.

`rule(initializer=...)` registers the initializer's own callable signature,
independently of the implementation signature. Bazel additionally requires a
function defined in Starlark source. It validates the generated per-target
arguments and returned attribute updates when it invokes the initializer.

`transition(implementation=...)` likewise preserves the registered callback's
signature. Input and output keys must be sequences of strings. Registration
checks callability and exposes gradual callback annotations; Bazel validates
invocation arguments and returned settings later. The same
contract applies to `exec_transition` when the host exposes it; Bazel restricts
its use to builtins.

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
without relying on `Any` or `Unknown`. Argument values and inferred results
must be fully static. A gradual call result can be passed directly to a fully
static parameter if every possible value satisfies the parameter contract. For
example, a function with an `object` parameter can accept the result of
`json.decode`; a function with an `int` parameter cannot. Operations within the
argument expression are checked separately. Omitted optional parameters and
unused overloads do not affect calls whose individual input contracts ty can
establish. Otherwise, the rule conservatively requires the whole callable to be
fully static. Storing or passing a function also checks its whole callable
contract. For example, passing `1` to `int | Any` uses the known `int`
alternative, while passing it to `Any` alone cannot establish a static contract.

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

## BUILD and MODULE.bazel annotations

An explicit mapping such as `BUILD.bazel=BUILD.bzli` or
`MODULE.bazel=MODULE.bzli` applies variable annotations to top-level assignments
in BUILD files, MODULE.bazel files, and `.MODULE.bazel` fragments, including
private names:

```starlark
type _Case = dict[{"name": str, "enabled": bool}]

_CASES: list[_Case]
```

Each annotated variable requires one direct assignment to that name in the source
file and one declaration in the stub. Missing, unsupported, and ambiguous
bindings are errors. Helper classes and loads supply annotation types; top-level
function declarations are unsupported. Source type comments take precedence.
ty checks the initializer, subsequent uses, and mutations against the annotation
in the source file's host context.

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

Record fields are readonly and required unless annotated with
`NotRequired[T]`. An optional field may be absent; a required field of type
`T | None` is present and may contain `None`. For example:

```starlark
def Metadata(*, name: str, checksum: str = ...) -> record[{
    "name": str,
    "checksum": NotRequired[str],
}]: ...
```

Use `getattr(value, "checksum", None)` to read an optional field with a
default, or guard access with `hasattr(value, "checksum")`. Unguarded reads
report `possibly-missing-attribute` when that diagnostic is enabled.
Generic optional fields retain their specialized types, including stored
callable signatures.

When sty traces a declared constructor to a native provider without an
initializer, supplying an optional field makes it present on that
constructed instance. The same applies to the raw
constructor returned by `provider(init=...)`, including imported aliases.
The field keeps its declared type and readonly status. An unpacked mapping
proves presence only when argument binding establishes that the key is
required. Initializer inputs and ordinary factory parameters do not prove
which fields their results contain.

A closed record describes all fields of an instance;
`record[{"files": depset[File]}, ...]` describes a partial
contract. Additional fields must also satisfy the source provider's `fields`
declaration. `record[...]` is the return annotation of a provider constructor
in a stub. Constructor declarations have one signature.
`ProviderKey` describes a provider key without specifying its instance type.
It accepts builtin and source providers, including generic providers. A lookup
through that opaque view returns `ProviderInstance`. `Provider[T]` describes
a key with a declared lookup result `T`. Source provider values retain their exact
constructor signatures; ordinary functions and raw constructors are not keys.

`ProviderInstance` is the common type of Bazel provider values. It includes
builtin providers, source providers, and `struct` values, which Bazel accepts
in a rule implementation's provider list. Auxiliary values such as
`FilesToRunProvider` have their own types. An opaque `ProviderInstance` exposes
no provider-specific fields.

`Intersection[A, B]` requires both contracts, using ty's intersection type.
For example, a value used both as a provider key and a constructor can declare
its lookup result and call signature together:

```starlark
type FilesConstructor = Intersection[Provider[FilesInfo], Callable[[list[File]], FilesInfo]]
```

This annotation is a sty extension to the proposed Starlark type syntax.

```starlark
def forward(target: Target, keys: Sequence[ProviderKey]) -> list[ProviderInstance]:
    return [target[key] for key in keys if key in target]
```

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
`target[Partial]` does not select a particular `T` or use its default. Its
fields have a safe opaque view: an unbounded handle can be read as `object`,
while a bounded handle preserves its bound. Mutable fields retain their
unknown specialization, so a list field cannot accept arbitrary writes or
values from a separate generic lookup. Calling the constructor with known
arguments still produces the corresponding precise specialization.

For `provider(init=...)`, a uniquely associated constructor supplies input
types to corresponding unannotated initializer parameters. sty checks the
initializer's returned dictionary against the record, including field types
and required keys. Source annotations take precedence; shared initializers
use source annotations and ordinary inference. Every initializer must accept
its constructor's declared arguments. A defaulted input does not make an
output field optional.

A provider without an initializer stores its keyword arguments directly. Its
constructor declaration therefore uses keyword-only parameters and requires
every required field. Defaulted parameters may correspond to optional fields:

```starlark
def FilesInfo(*, files: depset[File]) -> record[{"files": depset[File]}]: ...
```

Raw constructors accept stored field values directly and return the same
nominal instance type. Their parameters are optional only for optional stored
fields, independently of the public initializer's defaults:

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
sty also tracks the first branch's runtime kind when the dictionary's first
entry is known. Otherwise, the mapping's value types bound the possible kinds.
The kind determines which selector operations Bazel accepts. For example,
selectors whose first branch is `None` combine with `+`, including when later
branches are dictionaries; selectors whose first branch is a dictionary
combine with `|`. Label branches have the `"label"` kind and combine with
other Label values or selectors using `+`. Attribute conversion determines
whether the receiving attribute supports the combined fragments.

Inferred types display this information as a second parameter, such as
`select[dict[str, int] | None, Literal["none"]]`. List, tuple, and range branches
share the `"list"` kind. Fully static combinations preserve the runtime kind and
every operand's payload contribution, including `None`. Homogeneous list and
dictionary payloads combine their element types.
A combination can contain both list and dictionary branches: Bazel stores these
fragments and converts each one when an attribute consumes it. For example, a
string-list attribute accepts both lists of strings and dictionaries with string
keys; a string-dictionary attribute rejects the list branches.

`select[T]` defaults the kind to `object`, accepting every runtime kind while
preserving the branch-value contract. An operation requiring a particular kind
uses an explicit annotation, such as `select[list[str], Literal["list"]]`.
A mapping with a finite set of known value categories retains the possible
selector types. For example, `dict[str, list[str] | None]` produces
`select[list[str] | None, Literal["list"]] | select[list[str] | None, Literal["none"]]`.
Each alternative retains every branch's payload type. Independent selectors
with several known kinds require proof of compatible kinds before combining.
`Unknown` and `Any` constructor inputs retain gradual kinds, so ordinary checking
permits composition through untyped helpers. A gradual alternative does not
permit operations that are invalid for a known alternative in the same union.
Unclassified static value categories retain an opaque kind, as do dictionary
value types with several native representations.
Integer values retain the `"int"` category, and literal dictionary branches
retain the `"dict"` kind. Bazel can reject integer concatenation when operands
use different internal representations, which depend on numeric range.
Successful concatenations retain their `int` payloads.

Gradual composition can still produce ambiguous overload results and lose
precision. For example, adding an untyped helper's selector to
`select[list[str | int], Literal["list"]]` can hide the incompatible `int` element
from an ordinary argument check. The `non-static-type` rule rejects the gradual
stored result and its use as a call argument. A checked helper contract with
fully static payload and kind types avoids this gradual loss of precision.

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

`transition[Kind]` preserves how a transition exposes label dependencies.
`transition()` produces `transition[Literal["split"]]`: Starlark-defined
attribute transitions expose a list of targets, including when the transition
implementation returns one settings dictionary. `config.none()` and
`config.target()` produce `transition[Literal["ordinary"]]`, which preserves
the ordinary target or optional-target view. A helper can require the split
kind explicitly. Bare `transition` accepts either kind and leaves the analyzed
label value unknown. The kind describes the dependency view, not the number
of outgoing configurations.

`ctx[Value, Attrs]` specifies the build-setting value and the fields of
`ctx.attr`. In an aspect callback, `ctx[Value, Attrs, SubjectAttrs]` also
specifies the fields the callback requires from the analyzed subject's
`ctx.rule.attr`. This requirement does not establish which targets the aspect
visits or prove that their rules supply those fields. `repository_ctx[Attrs]`
specifies the fields of `repository_ctx.attr`. A protocol describes the
attribute fields a helper requires:

```starlark
class _Attrs(Protocol):
    @property
    def exports(self) -> Sequence[Target]: ...

def exported(context: ctx[object, _Attrs]) -> Sequence[Target]: ...
```

These contexts retain their native methods and work with native functions.
With context inference enabled, eligible rule, aspect, and repository-rule
registrations supply schemas from their attribute descriptors.

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
Protocols and TypedDicts accept type parameters using the same syntax as generic
functions, for example `class _Consumer[T](Protocol)`.

`Hashable` is available for bounded inputs, such as
`def unique[T: Hashable](values: Iterable[T]) -> list[T]: ...`.
It rejects lists and dictionaries and retains the concrete input type. Struct
fields must themselves satisfy `Hashable`; this conservatively excludes frozen
structs containing lists. The canonical tuple protocol does not check nested
elements, so a tuple containing a list can satisfy this annotation even though
Bazel rejects it as a dictionary key.

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
manifest = "@rules_foo//:stubs.toml"
```

Manifest labels use the main repository's mapping. A local manifest can be
specified by a path relative to the configuration file, such as
`stubs/rules_foo/stubs.toml`.

A ruleset can ship stubs in its own Bazel repository:

```toml
# stubs.toml
format-version = 1

[files]
"foo/defs.bzl" = "foo/defs.bzli"
```

With no `[source]` table, source files belong to the canonical Bazel repository
containing the manifest. The source and stubs share the selected artifact.

A separately distributed stub package is selected through its own repository,
such as `@rules_foo_stubs//:stubs.toml`. Its manifest identifies the source
repository and accepted module versions:

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
Bazel release versions. An explicit `[source]` table requires `repository`,
`module`, and a nonempty `versions` list.

Bazel's selected module name must equal `source.module`, and its selected
version must appear in `source.versions`. Bazel dependency declarations specify
minimum versions; compatibility is checked against the resolved module graph.

When an explicit `[source]` table identifies a repository with no selected
version, stubs in that same canonical repository are accepted as part of the
selected artifact. A separate stub package requires `allow-unversioned = true`
in its consumer's `stub-packages` entry. This option requires an explicit
`[source]` table. Any available module name must match `source.module`, and
every available version must match `source.versions`.

Incompatible versions, unsupported manifest schemas, unknown fields, unresolved
repositories, unreadable files, and failed Bazel queries are configuration errors.
