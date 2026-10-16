load("//runfiles_group/private/providers:runfiles_group_partial_info.bzl", "RunfilesGroupPartialInfo")

def consume(partial):
    # type: (RunfilesGroupPartialInfo[str]) -> int
    return partial.handle

def pieces(partial):
    # type: (RunfilesGroupPartialInfo[str]) -> list[int]
    return [piece[1] for piece in partial.pieces.to_list()]
