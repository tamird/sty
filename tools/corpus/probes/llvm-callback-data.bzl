load(":defs.bzl", "exec_test")

def narrow(*, data: list[str], name: str, tags: list[str], srcs: list[str]) -> None:
    pass

def exact(*, data: list[str], name: Literal["case_"], tags: list[str], srcs: list[str]) -> None:
    pass

def literal(*, data: list[Literal["ok"]], name: str, tags: list[str]) -> None:
    pass

def tupled(*, data: tuple[str], name: str, tags: list[str]) -> None:
    pass

def selected(*, data: select[list[str]], name: str, tags: list[str]) -> None:
    pass

def sequence(*, data: Sequence[str], name: str, tags: list[str]) -> None:
    pass

def integers(*, data: list[int], name: str, tags: list[str]) -> None:
    pass

# Each exec_test call checks data and tags. The remaining callback signature
# is gradual; the non-static-type ignores cover each complete call.
def exercise() -> None:
    # ty: ignore[non-static-type]
    exec_test(narrow, name = "case", inner_data = ["ok"], srcs = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(narrow, name = "empty", inner_data = [], srcs = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(sequence, name = "seq_empty", inner_data = [])
    # ty: ignore[non-static-type]
    exec_test(exact, name = "case", inner_data = ["ok"], srcs = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(literal, name = "literal", inner_data = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(tupled, name = "tuple", inner_data = ("ok",))
    # ty: ignore[non-static-type]
    exec_test(selected, name = "selected", inner_data = select({"//conditions:default": ["ok"]}))
    # ty: ignore[non-static-type]
    exec_test(narrow, name = "omitted", srcs = ["ok"])
    # ty: ignore[non-static-type]
    exec_test(sequence, name = "omitted_seq")
    # ty: ignore[non-static-type]
    exec_test(integers, name = "omitted_int")
