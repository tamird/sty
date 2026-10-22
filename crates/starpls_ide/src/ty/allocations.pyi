"""Internal dictionary allocation and copying capabilities."""

import builtins as _builtins
from typing import Iterable, final

# Copying a mapping reads its entries, so both type parameters are covariant
# even though mapping lookup is invariant in its key type.
class _MappingEntries[_Key, _Value]:
    def items(self) -> Iterable[tuple[_Key, _Value]]: ...

@final
class dict[_K, _V](_builtins.dict[_K, _V]): ...
