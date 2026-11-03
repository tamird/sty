"""Print every blocking finding and summarize warnings from the same sty run."""

import json
import os
import sys
from collections import Counter
from pathlib import Path


def summarize(directory: Path) -> str:
    report = json.loads((directory / "coverage.json").read_text())
    workspace = Path(report["workspace"])
    warnings: Counter[str] = Counter()
    with (directory / "diagnostics.jsonl").open() as diagnostics:
        for line in diagnostics:
            finding = json.loads(line)
            if finding["severity"] == "error":
                path = os.path.relpath(finding["filename"], workspace)
                row, column = finding["location"]["row"], finding["location"]["column"]
                print(f"sty: {path}:{row}:{column}: {finding['name']}: {finding['message']}")
            elif finding["severity"] == "warning":
                warnings[finding["name"]] += 1
    counts = report["diagnostics"]
    lines = [
        f"Checked {len(report['checked_files']):,} files: "
        f"{counts['errors']:,} errors, {counts['warnings']:,} warnings, {counts['infos']:,} infos."
    ]
    if warnings:
        lines.extend(["", "| Warning | Count |", "|---|---:|"])
        lines.extend(f"| `{rule}` | {count:,} |" for rule, count in warnings.most_common())
        lines.extend(["", "Download the job artifact for each finding and its source location."])
    if not report["complete"]:
        raise ValueError("sty could not check all selected files; see the coverage report")
    return "\n".join(lines)


if __name__ == "__main__":
    summary = summarize(Path(sys.argv[1]))
    print(summary)
    with Path(os.environ["GITHUB_STEP_SUMMARY"]).open("a") as output:
        print(summary, file=output)
