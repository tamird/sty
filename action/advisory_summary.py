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
    missing = sorted(path for path in requested if workspace / path not in checked)
    if missing:
        raise ValueError(f"advisory files were not checked: {missing}")
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
