load("//lib:apple_support.bzl", "apple_support")

SDKROOT: str = apple_support.path_placeholders.sdkroot()
XCODE: str = apple_support.path_placeholders.xcode()
ACTION_ATTRS: Mapping[str, Attribute[Target]] = apple_support.action_required_attrs()
PLATFORM_ATTRS: Mapping[str, Attribute[Target]] = apple_support.platform_constraint_attrs()

def _selected_platform(ctx) -> list[Never]:
    arch = apple_support.target_arch_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    environment = apple_support.target_environment_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    os = apple_support.target_os_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    parts: list[str] = []
    if arch != None:
        parts.append(arch)
    if environment != None:
        parts.append(environment)
    if os != None:
        parts.append(os)
    apple_support.platform_info_from_rule_ctx(ctx)
    return []

selected_platform = rule(
    implementation = _selected_platform,
    attrs = apple_support.platform_constraint_attrs(),
)
