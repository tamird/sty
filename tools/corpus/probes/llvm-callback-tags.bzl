load(":defs.bzl", "exec_test")

def manual(*, tags: list[Literal["manual"]], data: list[str], name: str) -> None:
    pass

def foo(*, tags: list[Literal["foo", "manual"]], data: list[str], name: str) -> None:
    pass

def broad(*, tags: list[str], data: list[str], name: str) -> None:
    pass

def exact(*, tags: list[Literal["foo", "manual"]], data: list[str], name: Literal["case_"], srcs: list[str]) -> None:
    pass

# Each exec_test call checks data and tags. The remaining callback signature
# is gradual; the non-static-type ignores cover each complete call.
def exercise(tags: list[str]) -> None:
    # ty: ignore[non-static-type]
    exec_test(manual, name = "omitted")
    # ty: ignore[non-static-type]
    exec_test(manual, name = "empty", tags = [])
    # ty: ignore[non-static-type]
    exec_test(manual, name = "manual", tags = ["manual"])
    # ty: ignore[non-static-type]
    exec_test(foo, name = "foo", tags = ["foo"])
    # ty: ignore[non-static-type]
    exec_test(foo, name = "both", tags = ["foo", "manual"])
    # ty: ignore[non-static-type]
    exec_test(exact, name = "case", tags = ["foo"], srcs = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(broad, name = "bound", tags = tags)
