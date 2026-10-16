load("//runfiles_group:lib.bzl", "runfiles_groups")

runfiles_groups.entry(name = 42, content = depset())
runfiles_groups.entry(name = "fixture#bad", content = depset(["not a File"]))
runfiles_groups.entry(name = "fixture#bad", content = depset(), weight = "heavy")
runfiles_groups.files(depset(["not a File"]))
runfiles_groups.name_str(42)
