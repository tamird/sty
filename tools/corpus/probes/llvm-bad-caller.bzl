load(":defs.bzl", "exec_test")
load(":directory.bzl", "headers_directory")

def declare_test(**kwargs: object) -> dict[str, object]:
    return kwargs

def consumers() -> None:
    exec_test("not callable", name = "rule")
    exec_test(declare_test, name = 1)
    exec_test(declare_test, name = "tags", tags = [1])
    exec_test(declare_test, name = "args", args = [1])
    exec_test(declare_test, name = "env", env = {"KEY": 1})
    exec_test(declare_test, name = "data", data = [1])
    exec_test(declare_test, name = "inner_data", inner_data = [1])
    exec_test(declare_test, name = "tools", tools = [1])
    headers_directory(1, "include")
    headers_directory("path", False)
    headers_directory("visibility", "include", visibility = [1])
