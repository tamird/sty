load(":args.bzl", "rewrite_args")

def make_filegroup(*, name: str, srcs: list[str], output_group: str) -> str:
    return name

def consumers() -> tuple[list[str], list[Label]]:
    rewritten = rewrite_args("example", ["--flag"], make_filegroup)  # type: tuple[list[str], list[Label]]
    return rewritten
