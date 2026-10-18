load(":args.bzl", "rewrite_args")

def make_filegroup(*, name: str, srcs: list[str], output_group: str) -> str:
    return name

def consumers() -> None:
    rewrite_args("example", [42], make_filegroup)
