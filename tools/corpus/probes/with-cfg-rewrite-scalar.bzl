load(":rewrite.bzl", "rewrite_locations_in_single_value")

def rewrite(value: str) -> str:
    return value

def check(value: str) -> str:
    return rewrite_locations_in_single_value(value, rewrite)
