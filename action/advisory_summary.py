"""Verify that every requested file appears in the advisory report."""

import json
import sys
from pathlib import Path


def summarize(directory: Path) -> str:
    requested = set((directory / "files.txt").read_text().splitlines()) - {""}
    if not requested:
        raise ValueError("empty advisory inventory")
    if any(Path(path).is_absolute() or ".." in Path(path).parts for path in requested):
        raise ValueError("advisory paths must be relative to the checked workspace")
    report = json.loads((directory / "coverage.json").read_text())
    if report["complete"] is not True:
        raise ValueError("incomplete advisory check")
    workspace = Path(report["workspace"])
    checked = {Path(file["path"]) for file in report["checked_files"]}
    required: set[str] = set()
    context_file = directory / "load-files.txt"
    if context_file.exists():
        required = set(context_file.read_text().splitlines()) - {""}
        if not required <= requested:
            outside = sorted(required - requested)
            raise ValueError(f"load-context files outside the advisory inventory: {outside}")
    remapped = report.get("bazel_load_context", {})
    missing = []
    for path in requested:
        source = workspace / path
        selected = Path(remapped.get(str(source), source)) if path in required else source
        if selected not in checked:
            missing.append(path)
    if missing:
        raise ValueError(f"advisory files were not checked: {sorted(missing)}")
    counts = report["diagnostics"]
    return (
        f"Advisory: checked all {len(requested)} requested files. "
        f"Findings across all {len(report['checked_files'])} checked files: "
        f"Errors: {counts['errors']:d}, warnings: {counts['warnings']:d}, infos: {counts['infos']:d}."
    )


if __name__ == "__main__":
    try:
        print(summarize(Path(sys.argv[1])))
    except ValueError as error:
        sys.exit(str(error))
