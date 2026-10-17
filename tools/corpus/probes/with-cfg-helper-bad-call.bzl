load(":frontend.bzl", "get_frontend")

get_frontend(executable="yes", test=False)
get_frontend(executable=True, test="yes")
