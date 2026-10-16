load(":defs.bzl", "exec_test")
load(":directory.bzl", "headers_directory")

def declare_test(**kwargs: object) -> dict[str, object]:
    return kwargs

def consumers() -> None:
    exec_test(
        declare_test,
        name = "valid",
        tags = ["manual"],
        args = ("--verbose",),
        env = select({"//conditions:default": {"KEY": "value"}}),
        data = [Label("//:data")],
        inner_data = select({"//conditions:default": ["//:inner_data"]}),
        tools = ("//:tool",),
    )
    headers_directory("headers", "include", visibility = ["//visibility:public"])
    headers_directory("defaults", ".")
