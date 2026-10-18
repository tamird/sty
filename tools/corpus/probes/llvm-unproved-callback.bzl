load(":defs.bzl", "exec_test")

def declare_test(*, data: list[object], tags: list[str], **kwargs: object) -> None:
    pass

def consumers() -> None:
    exec_test(declare_test, name = "unproved")
