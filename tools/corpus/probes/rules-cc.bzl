load(":cc_toolchain_config_lib.bzl", "ActionConfigInfo", "ArtifactNamePatternInfo", "EnvEntryInfo", "EnvSetInfo", "FeatureInfo", "FeatureSetInfo", "FlagGroupInfo", "FlagSetInfo", "MakeVariableInfo", "ToolInfo", "ToolPathInfo", "VariableWithValueInfo", "WithFeatureSetInfo", "action_config", "artifact_name_pattern", "env_entry", "env_set", "feature", "feature_set", "flag_group", "flag_set", "make_variable", "tool", "tool_path", "variable_with_value", "with_feature_set")

def configuration(artifact):
    # type: (File) -> ActionConfigInfo
    condition = variable_with_value("mode", "fast")  # type: VariableWithValueInfo
    leaf = flag_group(flags = ["-O2"], expand_if_equal = condition)
    nested = flag_group(flag_groups = [leaf], iterate_over = "objects")  # type: FlagGroupInfo
    flags = flag_set(actions = ["c-compile"], flag_groups = [nested])  # type: FlagSetInfo
    enabled = with_feature_set(features = ["fast"], not_features = ["debug"])  # type: WithFeatureSetInfo
    entry = env_entry("MODE", "fast")  # type: EnvEntryInfo
    environment = env_set(["c-compile"], [entry], [enabled])  # type: EnvSetInfo
    required = feature_set(["supports_fast"])  # type: FeatureSetInfo
    configured = feature("fast", flag_sets = [flags], env_sets = [environment], requires = [required])  # type: FeatureInfo
    compiler = tool(tool = artifact, with_features = [enabled])  # type: ToolInfo
    path = tool_path("compiler", "/usr/bin/cc")  # type: ToolPathInfo
    variable = make_variable("CC", path.path)  # type: MakeVariableInfo
    pattern = artifact_name_pattern("object_file", None, ".o")  # type: ArtifactNamePatternInfo
    filename = pattern.prefix or ""  # type: str
    value = nested.flag_groups[0].expand_if_equal
    if value != None:
        filename += value.value
    setting = configured.env_sets[0].env_entries[0].value + variable.value + filename  # type: str
    return action_config(setting, tools = [compiler], flag_sets = configured.flag_sets)

def provider_lookup(target):
    # type: (Target) -> list[str]
    return target[FlagGroupInfo].flag_groups[0].flags

def direct_action_config():
    # type: () -> ActionConfigInfo
    return ActionConfigInfo(action_name = "c-compile", enabled = False, tools = [], flag_sets = [], implies = [], type_name = "action_config", config_name = "legacy")
