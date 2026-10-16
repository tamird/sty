load(":all_crate_deps.bzl", "all_crate_deps", "merge_structured_dep_specs")
load(":select_utils.bzl", "compute_select")

def invalid():
    _, branches = compute_select([], {"//cfg:linux": ["//:linux"]})
    bad = branches["//cfg:linux"][0]  # type: int
    ordinary = all_crate_deps({}, [])  # type: list[str]
    merged, _ = merge_structured_dep_specs([], [], None)
    merged.append(42)
    print(bad, ordinary)
