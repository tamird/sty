load(":defs.bzl", "exec_test")

def manual(*, tags: list[Literal["manual"]], data: list[str], name: str) -> None:
    pass

def foo(*, tags: list[Literal["foo"]], data: list[str], name: str) -> None:
    pass

def integers(*, tags: list[int], data: list[str], name: str) -> None:
    pass

def exercise(tags: list[str]) -> None:
    exec_test(manual, name = "wrong", tags = ["foo"])
    exec_test(foo, name = "injected", tags = ["foo"])
    exec_test(integers, name = "incompatible")
    exec_test(manual, name = "bound", tags = tags)
