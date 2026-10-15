load("//lib:apple_support.bzl", "apple_support")

def bad(ctx):
    # type: (ctx) -> None
    apple_support.target_os_from_rule_ctx(ctx, fail_on_missing_constraint = "yes")
