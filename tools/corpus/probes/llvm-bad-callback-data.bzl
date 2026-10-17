load(":defs.bzl", "exec_test")

def narrow(*, data: list[str], name: str, tags: list[str], srcs: list[str]) -> None:
    pass

def literal(*, data: list[Literal["ok"]], name: str, tags: list[str]) -> None:
    pass

def tupled(*, data: tuple[str], name: str, tags: list[str]) -> None:
    pass

def selected(*, data: select[list[str]], name: str, tags: list[str]) -> None:
    pass

def wrong(*, data: int, name: str, tags: list[str]) -> None:
    pass

def exercise() -> None:
    exec_test(wrong, name = "bad", inner_data = ["ok"])
    exec_test(narrow, name = "bad", inner_data = select({"//conditions:default": ["ok"]}), srcs = ["ok"])
    exec_test(tupled, name = "bad", inner_data = ["ok"])
    exec_test(narrow, name = "bad", inner_data = [Label("//:x")], srcs = ["ok"])
    exec_test(selected, name = "bad", inner_data = ["ok"])
    exec_test(len, name = "bad", inner_data = ["ok"])
    exec_test(tupled, name = "bad", **{"inner_data": ["ok"]})
    exec_test(literal, name = "bad", inner_data = ["wrong"])
    exec_test(tupled, name = "omitted_tuple")
    exec_test(selected, name = "omitted_selected")
