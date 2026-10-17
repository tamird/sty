load("//lib:apple_support.bzl", "apple_support")

def _bad(ctx) -> list[Never]:
    def require_string() -> str:
        return apple_support.target_os_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    require_string()
    return []

bad = rule(
    implementation = _bad,
    attrs = apple_support.platform_constraint_attrs(),
)
