load(":frontend.bzl", "filter_exec_properties")
load(":select.bzl", "map_dict_attr")

def fresh(value: object) -> ExactDict[str, str]:
    return {"pool": "test"}

plain: ExactDict[str, str] | select[dict[str, str], Literal["dict"]] = filter_exec_properties({"pool": "all", "compile.pool": "compile"})
empty: ExactDict[str, str] | select[dict[str, str], Literal["dict"]] = filter_exec_properties(None)
selected: ExactDict[str, str] | select[dict[str, str], Literal["dict"]] = filter_exec_properties(select({"//conditions:default": None, ":other": {"pool": "all"}}))
mapped: ExactDict[str, str] | select[dict[str, str], Literal["dict"]] = map_dict_attr(fresh, select({"//conditions:default": None}))
print(plain, empty, selected, mapped)
