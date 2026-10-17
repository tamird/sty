load(":frontend.bzl", "filter_exec_properties")
load(":select.bzl", "map_dict_attr")

def ordinary(value: object) -> dict[str, str]:
    return {"pool": "test"}

def wrong_kind(value: object) -> list[str]:
    return ["test"]

map_dict_attr(ordinary, None)
map_dict_attr(wrong_kind, None)
wrong_result: list[str] = filter_exec_properties(None)
print(wrong_result)
