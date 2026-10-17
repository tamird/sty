load(":args.bzl", "rewrite_args")

def make_filegroup(*, name: str, srcs: list[str], output_group: str) -> str:
    return name + str(srcs) + output_group

plain: tuple[list[str], list[Label]] = rewrite_args("plain", ["$(location :dep)"], make_filegroup)
selected: tuple[select[list[str]], list[Label]] = rewrite_args("selected", select({"//conditions:default": ["$(location :dep)"]}), make_filegroup)
print(plain, selected)

wrong: tuple[select[list[int]], list[Label]] = rewrite_args("bad", select({"//conditions:default": ["text"]}), make_filegroup)
rewrite_args("bad", select({"//conditions:default": [42]}), make_filegroup)
print(wrong)

rewrite_args("bad_nullable", select({"//conditions:default": None, ":condition": [42]}), make_filegroup)
