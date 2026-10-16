load(":args.bzl", "rewrite_args")

def make_filegroup(*, name: str, srcs: list[int], output_group: str) -> None:
    pass

rewrite_args("example", ["--flag"], make_filegroup)
