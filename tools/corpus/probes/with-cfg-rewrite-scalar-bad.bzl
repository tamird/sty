load(":rewrite.bzl", "rewrite_locations_in_single_value")

def wrong(value: str) -> int:
    return 1

def rewrite(value: str) -> str:
    return value

_bad: int = rewrite_locations_in_single_value("text", rewrite)
rewrite_locations_in_single_value("$(location :target)", wrong)
print(_bad)
