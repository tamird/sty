load(":rewrite.bzl", "rewrite_dependency_labels")
load(":utils.bzl", "is_label")

def reset_target(*, name, exports):
    # type: (str, str) -> object
    return exports

def rewrite(value):
    # type: (object) -> object
    return rewrite_dependency_labels(value, label_map = {}, reset_target = reset_target, name = "deps")

def label_only(value):
    # type: (Label) -> str
    return value.name

def label_text(value):
    # type: (Label | str) -> str
    if is_label(value):
        return label_only(value)
    return label_only(value)
