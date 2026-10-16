load("//runfiles_group:lib.bzl", "runfiles_groups")
load("//runfiles_group/private/providers:runfiles_group_info.bzl", "RunfilesGroupInfo")
load("//runfiles_group/private/providers:runfiles_group_partial_info.bzl", "RunfilesGroupPartialInfo")

def materialize(_context, entry):
    # type: (ctx, RunfilesGroupInfo) -> str
    return runfiles_groups.name_str(entry)

def merge(_context, _name, partials):
    # type: (ctx, Label | str, list[RunfilesGroupPartialInfo[int]]) -> int
    total = 0
    for partial in partials:
        total += partial.handle
    return total

OPS = runfiles_groups.packager_ops(materialize = materialize, merge = merge)

def materialize_file(context, _entry):
    # type: (ctx, RunfilesGroupInfo) -> File
    return context.actions.declare_file("package.tar")

def merge_strings(_context, _name, partials):
    # type: (ctx, Label | str, list[RunfilesGroupPartialInfo[str]]) -> str
    return "".join([partial.handle for partial in partials])

FILE_OPS = runfiles_groups.packager_ops(materialize = materialize_file, merge = merge_strings)
