load("//runfiles_group:lib.bzl", "runfiles_groups")
load("//runfiles_group:providers.bzl", "RunfilesGroupInfo")

def collect(context, target):
    # type: (ctx[object, object], Target) -> list[str]
    files = target[DefaultInfo].files
    entry = runfiles_groups.entry(name = target.label, content = files)
    declared = entry  # type: RunfilesGroupInfo
    weight = declared.weight  # type: int | None
    if weight != None:
        weight += 1
    full = runfiles_groups.runfiles(context, declared.content)  # type: runfiles
    other = runfiles_groups.entry(name = "fixture#assets", content = full, weight = weight)
    combined = runfiles_groups.union(context, [declared.content, other.content])
    paths = [file.short_path for file in runfiles_groups.files(combined).to_list()]
    names = [runfiles_groups.name_str(declared), runfiles_groups.name_str(other.name)]
    return paths + names

def indexed(target):
    # type: (Target) -> depset[File]
    return runfiles_groups.files(target[RunfilesGroupInfo].content)
