load(":defs.bzl", "exec_test")

def declare_test(*, data: list[object], tags: list[str], **kwargs: object) -> dict[str, object]:
    return kwargs

# Each exec_test call checks data and tags. The remaining callback signature
# is gradual; the non-static-type ignores cover each complete call.
def consumers() -> None:
    # ty: ignore[non-static-type]
    exec_test(declare_test, name = "opaque", metadata = struct(value = 42))

    # ty: ignore[non-static-type]
    exec_test(
        declare_test,
        name = "labels",
        target_compatible_with = ("//:one", Label("//:two")),
    )

    # ty: ignore[non-static-type]
    exec_test(
        declare_test,
        name = "depset",
        target_compatible_with = depset([Label("//:constraint")]),
    )

    # ty: ignore[non-static-type]
    exec_test(
        declare_test,
        name = "selected",
        target_compatible_with = select({
            "//conditions:default": None,
            "//:enabled": ["//:constraint"],
        }),
    )

    # ty: ignore[non-static-type]
    exec_test(declare_test, name = "none", target_compatible_with = None)
