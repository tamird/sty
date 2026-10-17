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

def exercise() -> None:
    exec_test(narrow, name = "case", inner_data = ["ok"], srcs = ["ok"])
    exec_test(narrow, name = "empty", inner_data = [], srcs = ["ok"])
    exec_test(sequence, name = "seq_empty", inner_data = [])
    exec_test(exact, name = "case", inner_data = ["ok"], srcs = ["ok"])
    exec_test(literal, name = "literal", inner_data = ["ok"])
    exec_test(tupled, name = "tuple", inner_data = ("ok",))
    exec_test(selected, name = "selected", inner_data = select({"//conditions:default": ["ok"]}))
    exec_test(narrow, name = "omitted", srcs = ["ok"])
    exec_test(sequence, name = "omitted_seq")
    exec_test(integers, name = "omitted_int")
