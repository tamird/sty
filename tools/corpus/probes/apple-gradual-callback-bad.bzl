load("//lib:apple_support.bzl", "apple_support")

def check(context: ctx[object, object], config: XcodeVersionConfig, output: File, tool: File, fragment: apple) -> None:
    def run(*args: Unknown, outputs: Sequence[File], executable: int, **kwargs: Unknown) -> None:
        pass
    adapter = struct(
        args = context.actions.args,
        declare_file = context.actions.declare_file,
        write = context.actions.write,
        run = run,
    )
    apple_support.run(actions = adapter, xcode_config = config, apple_fragment = fragment, outputs = [output], executable = tool)
