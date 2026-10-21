"""Internal dictionary allocation and copying capabilities."""

import builtins as _builtins
from typing import Iterable, final

# Only Starlark dictionary classes inherit this view. A copy reads the
# source entries, so both type parameters are covariant even though the
# dictionary itself is mutable and invariant.
class _MappingEntries[_Key, _Value]:
    def items(self) -> Iterable[tuple[_Key, _Value]]: ...

@final
class dict[_K, _V](_builtins.dict[_K, _V]): ...
