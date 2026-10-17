load(":frontend.bzl", "get_frontend")

def _mode_bad(flag: bool) -> None:
    get_frontend(executable=False, test=False)(name="alias", exports="//:target", args=[])
    get_frontend(executable=True, test=False)(name="binary", exports="//:target", size="small")
    get_frontend(executable=False, test=True)(name="test", exports="//:target", output_licenses=[])
    get_frontend(executable=flag, test=flag)(name="dynamic", exports="//:target", timeout="short")
    get_frontend(executable=False, test=True)(name="test", exports="//:target", env={"BAD": 42})
    get_frontend(executable=True, test=False)(name="missing")

print(_mode_bad)
