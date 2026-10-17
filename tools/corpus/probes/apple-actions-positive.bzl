load("//lib:apple_support.bzl", "apple_support")

def resources(os: str, inputs: int) -> dict[str, int]:
    return {"cpu": inputs, "memory": 32}

def check(context: ctx[object, object], config: XcodeVersionConfig, output: File, tool: File, provider: FilesToRunProvider, fragment: apple) -> None:
    apple_support.run(
        actions = context.actions,
        xcode_config = config,
        apple_fragment = fragment,
        executable = tool,
        outputs = [output],
        arguments = ["arg", context.actions.args()],
        tools = [provider, depset([tool])],
        env = {"VALUE": "yes"},
        execution_requirements = {"no-remote": "1"},
        resource_set = resources,
        xcode_path_resolve_level = None,
    )
    numbers: dict[Literal["cpu"], int] = {"cpu": 1}
    apple_support.run_shell(
        actions = context.actions,
        xcode_config = config,
        apple_fragment = fragment,
        command = "echo ok",
        outputs = [output],
        tools = depset([tool]),
        resource_set = numbers,
    )

    def write(output: File, content: str | Args, is_executable: bool = False) -> None:
        context.actions.write(output, content, is_executable = is_executable)

    adapter = struct(
        args = context.actions.args,
        declare_file = context.actions.declare_file,
        run = context.actions.run,
        write = write,
    )
    apple_support.run(
        actions = adapter,
        xcode_config = config,
        apple_fragment = fragment,
        executable = "/bin/bash",
        outputs = [output],
        arguments = [tool.path],
        tools = (tool,),
        xcode_path_resolve_level = "args",
    )
