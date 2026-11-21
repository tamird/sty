def none_selector():
    # type: () -> select[None, Literal["none"]]
    return select({"//conditions:default": None})


def wrong_kind():
    # type: () -> select[None, Literal["list"]]
    return none_selector()
