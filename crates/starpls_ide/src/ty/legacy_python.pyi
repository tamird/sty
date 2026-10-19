# The legacy providers survived behind native.legacy_globals after their types
# disappeared from Bazel's exported inventory. These contracts describe Bazel
# 8.5's builtins_bzl/common/python/providers.bzl and Bazel 7's Python provider
# APIs; the autoload policy decides whether the corresponding key is present.

@_starpls_typing.final
class _LegacyPyInfo(_starpls_types.ProviderInstance):
    transitive_sources: _starpls_typing.Final[_starpls_types.depset[_starpls_types.File]]
    uses_shared_libraries: _starpls_typing.Final[_starpls_builtins.bool]
    imports: _starpls_typing.Final[_starpls_types.depset[_starpls_builtins.str]]
    has_py2_only_sources: _starpls_typing.Final[_starpls_builtins.bool]
    has_py3_only_sources: _starpls_typing.Final[_starpls_builtins.bool]

@_starpls_typing.final
class _LegacyPyInfoKey(_starpls_types.Provider[_LegacyPyInfo]):
    def __call__(
        self,
        /,
        *,
        transitive_sources: _starpls_types.depset[_starpls_types.File],
        uses_shared_libraries: _starpls_builtins.bool = False,
        imports: _starpls_types.depset[_starpls_builtins.str] = ...,
        has_py2_only_sources: _starpls_builtins.bool = False,
        has_py3_only_sources: _starpls_builtins.bool = False,
    ) -> _LegacyPyInfo: ...

@_starpls_typing.final
class _LegacyPyRuntimeInfo(_starpls_types.ProviderInstance):
    interpreter_path: _starpls_typing.Final[_starpls_builtins.str | None]
    interpreter: _starpls_typing.Final[_starpls_types.File | None]
    files: _starpls_typing.Final[_starpls_types.depset[_starpls_types.File] | None]
    coverage_tool: _starpls_typing.Final[_starpls_types.File | None]
    coverage_files: _starpls_typing.Final[_starpls_types.depset[_starpls_types.File] | None]
    python_version: _starpls_typing.Final[_starpls_builtins.str]
    stub_shebang: _starpls_typing.Final[_starpls_builtins.str]
    bootstrap_template: _starpls_typing.Final[_starpls_types.File | None]

@_starpls_typing.final
class _LegacyPyRuntimeInfoKey(_starpls_types.Provider[_LegacyPyRuntimeInfo]):
    def __call__(
        self,
        /,
        *,
        interpreter_path: _starpls_builtins.str | None = None,
        interpreter: _starpls_types.File | None = None,
        files: _starpls_types.depset[_starpls_types.File] | None = None,
        coverage_tool: _starpls_types.File | None = None,
        coverage_files: _starpls_types.depset[_starpls_types.File] | None = None,
        python_version: _starpls_builtins.str,
        stub_shebang: _starpls_builtins.str | None = None,
        bootstrap_template: _starpls_types.File | None = None,
    ) -> _LegacyPyRuntimeInfo: ...
