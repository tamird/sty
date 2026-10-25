"""Starlark declarations whose contracts differ from Python's builtins.

These fixed language declarations use ty's ordinary generic call inference.
They do not describe or rewrite executable Starlark source.
"""

import builtins as _builtins
import typing as _typing
from _typeshed import SupportsRichComparisonT as _ComparableT
from types import FunctionType as _starpls_annotation_function

_T = _typing.TypeVar("_T")
_U = _typing.TypeVar("_U")
_V = _typing.TypeVar("_V")
_W = _typing.TypeVar("_W")
_X = _typing.TypeVar("_X")

def print(*args: _builtins.object, sep: _builtins.str = " ") -> None: ...

def enumerate(
    list: _typing.Iterable[_T], start: _builtins.int = 0
) -> _builtins.list[_builtins.tuple[_builtins.int, _T]]: ...

def reversed(sequence: _typing.Iterable[_T], /) -> _builtins.list[_T]: ...

@_typing.overload
def sorted(
    iterable: _typing.Iterable[_ComparableT],
    /,
    key: None = None,
    *,
    reverse: _builtins.bool = False,
) -> _builtins.list[_ComparableT]: ...
@_typing.overload
def sorted(
    iterable: _typing.Iterable[_T],
    /,
    key: _typing.Callable[[_T], _ComparableT],
    *,
    reverse: _builtins.bool = False,
) -> _builtins.list[_T]: ...

@_typing.overload
def min(first: _ComparableT, second: _ComparableT, /, *args: _ComparableT, key: None = None) -> _ComparableT: ...
@_typing.overload
def min(first: _T, second: _T, /, *args: _T, key: _typing.Callable[[_T], _ComparableT]) -> _T: ...
@_typing.overload
def min(iterable: _typing.Iterable[_ComparableT], /, *, key: None = None) -> _ComparableT: ...
@_typing.overload
def min(iterable: _typing.Iterable[_T], /, *, key: _typing.Callable[[_T], _ComparableT]) -> _T: ...

@_typing.overload
def max(first: _ComparableT, second: _ComparableT, /, *args: _ComparableT, key: None = None) -> _ComparableT: ...
@_typing.overload
def max(first: _T, second: _T, /, *args: _T, key: _typing.Callable[[_T], _ComparableT]) -> _T: ...
@_typing.overload
def max(iterable: _typing.Iterable[_ComparableT], /, *, key: None = None) -> _ComparableT: ...
@_typing.overload
def max(iterable: _typing.Iterable[_T], /, *, key: _typing.Callable[[_T], _ComparableT]) -> _T: ...

# Use builtins.zip's positional overloads with Starlark's eager list result.
@_typing.overload
def zip() -> _builtins.list[_builtins.tuple[()]]: ...
@_typing.overload
def zip(first: _typing.Iterable[_T], /) -> _builtins.list[_builtins.tuple[_T]]: ...
@_typing.overload
def zip(
    first: _typing.Iterable[_T], second: _typing.Iterable[_U], /
) -> _builtins.list[_builtins.tuple[_T, _U]]: ...
@_typing.overload
def zip(
    first: _typing.Iterable[_T],
    second: _typing.Iterable[_U],
    third: _typing.Iterable[_V],
    /,
) -> _builtins.list[_builtins.tuple[_T, _U, _V]]: ...
@_typing.overload
def zip(
    first: _typing.Iterable[_T],
    second: _typing.Iterable[_U],
    third: _typing.Iterable[_V],
    fourth: _typing.Iterable[_W],
    /,
) -> _builtins.list[_builtins.tuple[_T, _U, _V, _W]]: ...
@_typing.overload
def zip(
    first: _typing.Iterable[_T],
    second: _typing.Iterable[_U],
    third: _typing.Iterable[_V],
    fourth: _typing.Iterable[_W],
    fifth: _typing.Iterable[_X],
    /,
) -> _builtins.list[_builtins.tuple[_T, _U, _V, _W, _X]]: ...
@_typing.overload
def zip(*args: _typing.Iterable[_T]) -> _builtins.list[_builtins.tuple[_T, ...]]: ...
