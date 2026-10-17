load(":args.bzl", "rewrite_args")

def make_filegroup(*, name: str, srcs: list[str], output_group: str) -> str:
    return name + str(srcs) + output_group

plain: tuple[list[str], list[Label]] = rewrite_args("plain", ["$(location :dep)"], make_filegroup)
selected: tuple[select[list[str]], list[Label]] = rewrite_args("selected", select({"//conditions:default": ["$(location :dep)"]}), make_filegroup)
print(plain, selected)

none: tuple[None, list[Label]] = rewrite_args("none", None, make_filegroup)
nullable: tuple[select[list[str] | None], list[Label]] = rewrite_args("nullable", select({"//conditions:default": None, ":condition": ["--flag"]}), make_filegroup)

def union_args(args: list[str] | None) -> tuple[list[str] | None, list[Label]]:
    return rewrite_args("union", args, make_filegroup)

print(none, nullable, union_args)

dictionary: tuple[select[list[str] | None], list[Label]] = rewrite_args("dictionary", select({"//conditions:default": {"--flag": "$(location :value)"}}), make_filegroup)
mixed: tuple[select[list[str] | None], list[Label]] = rewrite_args("mixed", select({"//conditions:default": None, ":condition": {"--flag": None}}), make_filegroup)
print(dictionary, mixed)
