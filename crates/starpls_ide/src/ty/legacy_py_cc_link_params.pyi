# Bazel's original provider is defined in builtins_bzl/common/python/providers.bzl.
# Its key is distinct from the provider exported by rules_python.
class _LegacyPyCcLinkParamsInput(_starpls_typing.Protocol):
    @_starpls_builtins.property
    def linking_context(self) -> _starpls_types.LinkingContext | None: ...

@_starpls_typing.final
class _LegacyPyCcLinkParamsProvider(_starpls_types.ProviderInstance):
    cc_info: _starpls_typing.Final[_starpls_types.CcInfo]

@_starpls_typing.final
class _LegacyPyCcLinkParamsProviderKey(_starpls_types.Provider[_LegacyPyCcLinkParamsProvider]):
    def __call__(self, /, cc_info: _LegacyPyCcLinkParamsInput) -> _LegacyPyCcLinkParamsProvider: ...
