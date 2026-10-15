load("//lib:paths.bzl", "paths")

BASENAME = paths.basename("src/main.bzl")  # type: string
DIRNAME = paths.dirname("src/main.bzl")  # type: string
ABSOLUTE = paths.is_absolute("/src/main.bzl")  # type: bool
JOINED = paths.join("src", "lib", "main.bzl")  # type: string
NORMALIZED = paths.normalize("src/../lib/main.bzl")  # type: string
IS_NORMALIZED = paths.is_normalized("src/main.bzl", False)  # type: bool
RELATIVE = paths.relativize("src/lib/main.bzl", "src")  # type: string
REPLACED = paths.replace_extension("src/main.bzl", ".bzli")  # type: string
SPLIT = paths.split_extension("src/main.bzl")  # type: tuple[string, string]
STARTS_WITH = paths.starts_with("src/lib/main.bzl", "src")  # type: bool
