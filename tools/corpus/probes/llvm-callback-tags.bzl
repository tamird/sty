load(":defs.bzl", "exec_test")

def manual(*, tags: list[Literal["manual"]], data: list[str], name: str) -> None:
    pass

def foo(*, tags: list[Literal["foo", "manual"]], data: list[str], name: str) -> None:
    pass

def broad(*, tags: list[str], data: list[str], name: str) -> None:
    pass

def exact(*, tags: list[Literal["foo", "manual"]], data: list[str], name: Literal["case_"], srcs: list[str]) -> None:
    pass

def exercise(tags: list[str]) -> None:
    exec_test(manual, name = "omitted")
    exec_test(manual, name = "empty", tags = [])
    exec_test(manual, name = "manual", tags = ["manual"])
    exec_test(foo, name = "foo", tags = ["foo"])
    exec_test(foo, name = "both", tags = ["foo", "manual"])
    exec_test(exact, name = "case", tags = ["foo"], srcs = ["ok"])
    exec_test(broad, name = "bound", tags = tags)
