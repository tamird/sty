load(":providers.bzl", "FrontendInfo")

def ordinary() -> str:
    return "not a provider"

FrontendInfo(
    executable = None,
    providers = [ordinary],
    run_environment_info = None,
    template_variable_info = None,
)
FrontendInfo(
    executable = "wrong",
    providers = [],
    run_environment_info = "wrong",
    template_variable_info = "wrong",
)
