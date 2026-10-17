load(":all_crate_deps.bzl", "all_crate_deps", "merge_structured_dep_specs")
load(":select_utils.bzl", "compute_select")

def dependency_specs() -> tuple[list[str] | select[list[str], Literal["list"]], list[str] | select[list[str]], list[str]]:
    common, conditional = compute_select(["//:shared"], {"//cfg:linux": ["//:linux"]})
    shared = list(common)  # type: list[str]
    linux = conditional["//cfg:linux"]  # type: list[str]
    set_common, set_conditional = compute_select(set(["//:shared"]), {"//cfg:linux": set(["//:linux"])})
    merged, branches = merge_structured_dep_specs([(shared, conditional), (list(set_common), set_conditional)], ["//cfg:linux", "//cfg:mac"], "//:")
    result = all_crate_deps({
        "deps": merged,
        "deps_by_platform": branches,
        "dev_deps": ["//:test"],
        "build_deps_by_platform": {"//cfg:mac": ["//:build"]},
        "crate_name": "example",
        "edition": "2024",
    }, ["//cfg:linux", "//cfg:mac"], normal = True, normal_dev = True, build = True)
    selected: list[str] | select[list[str], Literal["list"]] = result
    empty = all_crate_deps({}, (), filter_prefix = None)  # type: list[str] | select[list[str]]
    mixed = {"//cfg:linux": ["//:linux"], "//cfg:mac": set(["//:mac"])}
    tuple_common, tuple_branches = compute_select(("//:shared",), mixed)
    compute_select({"//:shared": 0}, {"//cfg:linux": ("//:linux",)})
    merge_structured_dep_specs(((tuple_common, tuple_branches),), set(["//cfg:linux"]), None)
    merge_structured_dep_specs(set(), [], None)
    empty_specs: dict[tuple[Collection[str], Mapping[str, Collection[str]]], object] = {}
    merge_structured_dep_specs(empty_specs, [], None)
    return selected, empty, linux
