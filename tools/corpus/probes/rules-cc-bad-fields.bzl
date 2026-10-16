load(":cc_toolchain_config_lib.bzl", "FlagGroupInfo", "MakeVariableInfo", "VariableWithValueInfo", "flag_group", "make_variable", "tool")

def invalid(target):
    # type: (Target) -> None
    value = target[FlagGroupInfo].flag_groups[0].flags[0]
    _integer = value  # type: int
    _variable = make_variable("mode", "fast")  # type: VariableWithValueInfo
    compiler = tool(path = "/usr/bin/cc")
    _path = compiler.tool.path
    flag_group(flags = ["-O2"]).flag_groups.append(make_variable("mode", "fast"))
    print(_integer, _variable, _path)
