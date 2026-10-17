load(":providers.bzl", "ArgsInfo", "FrontendInfo")

def frontend(file: File, target: Target) -> FrontendInfo:
    keys = [DefaultInfo, ArgsInfo]
    info = FrontendInfo(
        executable = file,
        providers = keys,
        run_environment_info = None,
        template_variable_info = None,
    )
    for key in info.providers:
        if key in target:
            _value = target[key]  # type: object
            print(_value)
    return info
