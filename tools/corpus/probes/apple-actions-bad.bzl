load("//lib:apple_support.bzl", "apple_support")

def check(context: ctx[object, object], config: XcodeVersionConfig, output: File, tool: File, fragment: apple) -> None:
    apple_support.run(actions = context.actions, xcode_config = config, apple_fragment = fragment, outputs = [output])
    apple_support.run(actions = context.actions, xcode_config = config, apple_fragment = fragment, executable = tool)
    apple_support.run(actions = context.actions, xcode_config = config, apple_fragment = fragment, outputs = [output], executable = tool, env = {"BAD": 42})
    apple_support.run(actions = context.actions, xcode_config = config, apple_fragment = fragment, outputs = [output], executable = tool, tools = [42])
    apple_support.run_shell(actions = context.actions, xcode_config = config, apple_fragment = fragment, outputs = [output])
    apple_support.run_shell(actions = context.actions, xcode_config = config, apple_fragment = fragment, outputs = [output], command = "ok", commmand = "typo")

    def bad_run(*, outputs: Sequence[File], executable: int, **kwargs: object) -> None:
        pass
    bad_adapter = struct(
        args = context.actions.args,
        declare_file = context.actions.declare_file,
        write = context.actions.write,
        run = bad_run,
    )
    apple_support.run(actions = bad_adapter, xcode_config = config, apple_fragment = fragment, outputs = [output], executable = tool)
