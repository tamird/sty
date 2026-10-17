load(":frontend.bzl", "get_frontend")

def _mode_probe(flag: bool) -> None:
    alias = get_frontend(executable=False, test=False)
    alias(name="alias", exports="//:target", applicable_licenses=None)
    executable = get_frontend(executable=True, test=False)
    executable(name="binary", exports="//:target", args=("--flag",), output_licenses=["notice"], data=depset(["//:data"]), env={"MODE": "test"}, env_inherit=("HOME",), exec_group_compatible_with={"tools": ["//:constraint"]})
    test = get_frontend(executable=False, test=True)
    test(name="test", exports="//:target", args=select({"//conditions:default": ["--test"]}), size="small", timeout="short", flaky=1, local=True, shard_count=select({"//conditions:default": 2}))
    both = get_frontend(executable=True, test=True)
    both(name="both", exports="//:target", timeout="short")
    dynamic = get_frontend(executable=flag, test=flag)
    dynamic(name="dynamic", exports="//:target", tags=["manual"])

print(_mode_probe)
