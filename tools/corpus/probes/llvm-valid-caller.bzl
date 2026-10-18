load(":defs.bzl", "exec_test")
load(":directory.bzl", "headers_directory")

def declare_test(*, data: select[list[str]], tags: list[str], **kwargs: object) -> dict[str, object]:
    return kwargs

# Each exec_test call checks data and tags. The remaining callback signature
# is gradual; the non-static-type ignores cover each complete call.
def consumers() -> None:
    # ty: ignore[non-static-type]
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
