load(":setting.bzl", "get_attr_type", "validate_and_get_attr_name")

def names(): # type: () -> list[str]
    return [validate_and_get_attr_name("cpu"), validate_and_get_attr_name(Label("//:flag"))]

def constructor(value): # type: (object) -> Attribute
    return getattr(attr, get_attr_type(value))()
