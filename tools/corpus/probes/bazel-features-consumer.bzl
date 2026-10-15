load("//private:parse.bzl", "parse_version")
load("//private:util.bzl", "ge", "ge_same_major", "gt", "le", "lt", "ne")

parsed = parse_version("9.0.0-rc.1")  # type: tuple[list[int], bool, list[tuple[int, int | str]]]
checks = [ge("8.0.0"), ge_same_major("9.0.0"), gt("8.0.0"), le("10.0.0"), lt("10.0.0"), ne("7.0.0")]  # type: list[bool]
