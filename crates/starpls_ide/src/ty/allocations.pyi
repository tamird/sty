"""Internal dictionary allocation and copying capabilities."""

import builtins as _builtins
from typing import Iterable, final
from ty_extensions import Intersection, Top
from ty_extensions._internal import Unknown

# Copying a mapping reads its entries, so both type parameters are covariant
# even though mapping lookup is invariant in its key type.
class _MappingEntries[_Key, _Value]:
    def items(self) -> Iterable[tuple[_Key, _Value]]: ...

# A native dictionary's iteration type may describe its keys more precisely
# than lookup. Copying its entries preserves those keys and its value type.
type _DictEntries[_Key, _Value] = Intersection[Top[_builtins.dict[Unknown, _Value]], Iterable[_Key]]

@final
class dict[_K, _V](_builtins.dict[_K, _V]): ...
