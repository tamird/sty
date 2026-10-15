load("//lib:apple_support.bzl", "apple_support")

SDKROOT = apple_support.path_placeholders.sdkroot()  # type: string
XCODE = apple_support.path_placeholders.xcode()  # type: string
ACTION_ATTRS = apple_support.action_required_attrs()  # type: dict[string, Attribute]
PLATFORM_ATTRS = apple_support.platform_constraint_attrs()  # type: dict[string, Attribute]

def selected_platform(ctx):
    # type: (ctx) -> list[string]
    arch = apple_support.target_arch_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    environment = apple_support.target_environment_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    os = apple_support.target_os_from_rule_ctx(ctx, fail_on_missing_constraint = False)
    parts = []
    if arch != None:
        parts.append(arch)
    if environment != None:
        parts.append(environment)
    if os != None:
        parts.append(os)
    return parts
