load("//rules/directory:providers.bzl", "DirectoryInfo", "create_directory_info")

def check(file: File, directory: DirectoryInfo) -> None:
    create_directory_info(entries = {"bad": "not a file"}, transitive_files = depset([file]), path = "root", human_readable = "root")
    create_directory_info(entries = {}, path = "root", human_readable = "root")
    directory.get_file(42)
    directory.glob(include = [42])
    directory.glob(include = [], unknown = True)
    _wrong_file: DirectoryInfo = directory.get_file("file")
    _wrong_directory: File = directory.get_subdirectory("leaf")
    print(_wrong_file, _wrong_directory)
