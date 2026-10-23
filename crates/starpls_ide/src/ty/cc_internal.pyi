    # Bazel 9 CcCompilationContext.HeaderInfo is a native value, not a struct.
    @_starpls_typing.final
    class _HeaderInfo:
        @_starpls_builtins.property
        def modular_public_headers(self) -> _starpls_builtins.list[_starpls_types.File]: ...
        @_starpls_builtins.property
        def modular_private_headers(self) -> _starpls_builtins.list[_starpls_types.File]: ...
        @_starpls_builtins.property
        def textual_headers(self) -> _starpls_builtins.list[_starpls_types.File]: ...
        @_starpls_builtins.property
        def separate_module_headers(self) -> _starpls_builtins.list[_starpls_types.File]: ...
        @_starpls_builtins.property
        def header_module(self) -> _starpls_types._GeneratedFile | None: ...
        @_starpls_builtins.property
        def pic_header_module(self) -> _starpls_types._GeneratedFile | None: ...
        @_starpls_builtins.property
        def separate_module(self) -> _starpls_types._GeneratedFile | None: ...
        @_starpls_builtins.property
        def separate_pic_module(self) -> _starpls_types._GeneratedFile | None: ...

    @_starpls_typing.final
    class _CcInternal:
        # Other private host methods remain unmodeled, including freeze.
        def __getattr__(self, name: _starpls_builtins.str) -> _starpls_unknown: ...

        def create_header_info(
            self, *,
            header_module: _starpls_types._GeneratedFile | None = ...,
            pic_header_module: _starpls_types._GeneratedFile | None = ...,
            separate_module: _starpls_types._GeneratedFile | None = ...,
            separate_pic_module: _starpls_types._GeneratedFile | None = ...,
            modular_public_headers: _starpls_typing.Sequence[_starpls_types.File] = ...,
            modular_private_headers: _starpls_typing.Sequence[_starpls_types.File] = ...,
            textual_headers: _starpls_typing.Sequence[_starpls_types.File] = ...,
            separate_module_headers: _starpls_typing.Sequence[_starpls_types.File] = ...,
        ) -> _starpls_types._HeaderInfo: ...

        # The Java annotation defaults header_info to None, but the body
        # unconditionally reads it. Only an actual HeaderInfo can succeed.
        def create_header_info_with_deps(
            self, *,
            header_info: _starpls_types._HeaderInfo,
            deps: _starpls_typing.Sequence[_starpls_types._HeaderInfo] = ...,
            merged_deps: _starpls_typing.Sequence[_starpls_types._HeaderInfo] = ...,
        ) -> _starpls_types._HeaderInfo: ...
