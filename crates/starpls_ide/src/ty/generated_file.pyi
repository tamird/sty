    class _GeneratedFileFacts(_starpls_typing.Protocol):
        @_starpls_builtins.property
        def is_source(self) -> _starpls_typing.Literal[False]: ...

    # Artifact.isSourceArtifact distinguishes SourceArtifact from DerivedArtifact.
    type _GeneratedFile = _starpls_ty_extensions.Intersection[File, _GeneratedFileFacts]
