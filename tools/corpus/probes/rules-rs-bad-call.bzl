load(":all_crate_deps.bzl", "all_crate_deps", "merge_structured_dep_specs")
load(":select_utils.bzl", "compute_select")

def invalid():
    compute_select(["//:shared"], {"//cfg:linux": [42]})
    merge_structured_dep_specs([(["//:shared"], {"//cfg:linux": [42]})], [], None)
    all_crate_deps({"deps_by_platform": {"//cfg:linux": [42]}}, [])
    all_crate_deps({"deps": {"//:invalid": []}}, [])
    compute_select("//:not-a-collection", {})
