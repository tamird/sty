load(":defs.bzl", "exec_test")

def declare_test(**kwargs: object) -> dict[str, object]:
    return kwargs

def consumers() -> None:
    exec_test(declare_test, name = "opaque", metadata = struct(value = 42))
    exec_test(
        declare_test,
        name = "labels",
        target_compatible_with = ("//:one", Label("//:two")),
    )
    exec_test(
        declare_test,
        name = "depset",
        target_compatible_with = 42,
    )
    exec_test(
        declare_test,
        name = "selected",
        target_compatible_with = select({
            "//conditions:default": None,
            "//:enabled": ["//:constraint"],
        }),
    )
    exec_test(declare_test, name = "none", target_compatible_with = None)
