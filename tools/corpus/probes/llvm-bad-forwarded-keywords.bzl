load(":defs.bzl", "exec_test")

def declare_test(*, data: list[object], tags: list[str], **kwargs: object) -> dict[str, object]:
    return kwargs

def consumers() -> None:
    exec_test(
        declare_test,
        name = "depset",
        target_compatible_with = 42,
    )
