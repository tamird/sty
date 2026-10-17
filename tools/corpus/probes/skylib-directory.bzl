load("//rules/directory:providers.bzl", "DirectoryInfo", "create_directory_info")

def check(file: File) -> DirectoryInfo:
    leaf = create_directory_info(
        entries = {},
        transitive_files = depset([file]),
        path = "leaf",
        human_readable = "leaf",
    )
    directory = create_directory_info(
        entries = {"leaf": leaf, "file": file},
        transitive_files = depset([file]),
        path = "root",
        human_readable = "root",
        get_path = 42,
    )
    _either: File | DirectoryInfo = directory.get_path("file")
    _found: File = directory.get_file("file")
    _child: DirectoryInfo = directory.get_subdirectory("leaf")
    _files: depset[File] = directory.glob(include = ["**"], exclude = ["missing"], allow_empty = True)
    print(_either, _found, _child, _files)
    return directory
