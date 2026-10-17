load("//runfiles_group:lib.bzl", "runfiles_groups")
load("//runfiles_group/private/lib:resolve.bzl", "fold")
load("//runfiles_group/private/providers:runfiles_group_info.bzl", "RunfilesGroupInfo")
load("//runfiles_group/private/providers:runfiles_group_partial_info.bzl", "RunfilesGroupPartialInfo")

def materialize(context: ctx[object, struct[{"prefix": str}]], entry: RunfilesGroupInfo) -> str:
    return context.attr.prefix + runfiles_groups.name_str(entry)

def merge(context: ctx[object, struct[{"prefix": str}]], _name: Label | str, partials: list[RunfilesGroupPartialInfo[str]]) -> str:
    return context.attr.prefix + "".join([partial.handle for partial in partials])

OPS = runfiles_groups.packager_ops(materialize = materialize, merge = merge)

def collect(context: ctx[object, struct[{"prefix": str}]], partial: RunfilesGroupPartialInfo[str]) -> str:
    groups = fold(context, OPS, [partial])
    return "".join([group.handle for group in groups.values()])
