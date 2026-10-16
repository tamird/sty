load(":cc_toolchain_config_lib.bzl", "feature_set", "flag_group", "flag_set", "tool_path", "variable_with_value")

def invalid():
    leaf = flag_group(flags = ["-O2"])
    flag_group(flag_groups = [tool_path("compiler", "/usr/bin/cc")])
    flag_group(expand_if_equal = feature_set(["fast"]))
    flag_set(flag_groups = [leaf], actions = [123])
    variable_with_value("mode", False)
