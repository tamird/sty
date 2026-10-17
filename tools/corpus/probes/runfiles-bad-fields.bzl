load("//runfiles_group:lib.bzl", "runfiles_groups")
load("//runfiles_group:providers.bzl", "RunfilesGroupInfo")

def wrong_fields(target):
    # type: (Target) -> None
    entry = target[RunfilesGroupInfo]
    entry.weight + 1
    _rank = entry.rank  # type: str
    _file = runfiles_groups.files(entry.content).to_list()[0]  # type: str
    _foreign = struct(name = entry.name, content = entry.content)  # type: RunfilesGroupInfo
    print(_rank, _file, _foreign)
