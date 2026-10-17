load(":transitioning_alias.bzl", "make_transitioning_alias")

def probe(config: transition[Literal["split"]], strings: dict[str, int], labels: dict[Label, str]) -> None:
    make_transitioning_alias(providers=[DefaultInfo], transition=config, values=strings, original_settings_label=None)
    make_transitioning_alias(providers=(DefaultInfo,), transition=config, values=labels, original_settings_label=Label("//:settings"))
