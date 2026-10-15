load(":args.bzl", "rewrite_args")

def make_filegroup(**kwargs):
    pass

def consumers():
    rewritten = rewrite_args("example", [42], make_filegroup)  # type: tuple[list[str], list[Label]]
    return rewritten
