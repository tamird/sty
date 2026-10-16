load("//runfiles_group:lib.bzl", "runfiles_groups")
load("//runfiles_group/private/lib:resolve.bzl", "fold")
load("//runfiles_group/private/providers:runfiles_group_info.bzl", "RunfilesGroupInfo")
load("//runfiles_group/private/providers:runfiles_group_partial_info.bzl", "RunfilesGroupPartialInfo")

def materialize(_context, entry):
    # type: (ctx, RunfilesGroupInfo) -> str
    return runfiles_groups.name_str(entry)

def merge(_context, _name, partials):
    # type: (ctx, Label | str, list[RunfilesGroupPartialInfo[str]]) -> str
    return "".join([partial.handle for partial in partials])

OPS = runfiles_groups.packager_ops(materialize = materialize, merge = merge)

def collect(context, partial):
    # type: (ctx, RunfilesGroupPartialInfo[str]) -> str
    renamed = runfiles_groups.derive(partial, name = "renamed", weight = 1)
    groups = fold(context, OPS, [partial, renamed])
    return "".join([group.handle for group in groups.values()])

def pieces(partial):
    # type: (RunfilesGroupPartialInfo[str]) -> list[str]
    return [piece[1] for piece in partial.pieces.to_list()]
