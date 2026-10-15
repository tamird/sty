load("//lib:apple_support.bzl", "apple_support")

def bad(ctx):
    # type: (ctx) -> string
    return apple_support.target_os_from_rule_ctx(ctx, fail_on_missing_constraint = False)
