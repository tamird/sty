#!/usr/bin/env bash
set -euo pipefail

export GITHUB_STEP_SUMMARY="$TEST_TMPDIR/github-summary"
cat >"$TEST_TMPDIR/coverage.json" <<'JSON'
{"workspace": "/repo", "complete": true, "checked_files": [{"path": "/repo/defs.bzl"}], "diagnostics": {"errors": 1, "warnings": 2, "infos": 0}}
JSON
cat >"$TEST_TMPDIR/diagnostics.jsonl" <<'JSON'
{"filename": "/repo/defs.bzl", "location": {"row": 7, "column": 3}, "severity": "error", "name": "invalid-return-type", "message": "expected int, got str"}
{"severity": "warning", "name": "non-static-type"}
{"severity": "warning", "name": "non-static-type"}
JSON
python3 action/summary.py "$TEST_TMPDIR" >"$TEST_TMPDIR/job.log"
grep -F 'defs.bzl:7:3: invalid-return-type: expected int, got str' "$TEST_TMPDIR/job.log"
grep -F '| `non-static-type` | 2 |' "$GITHUB_STEP_SUMMARY"

# A report with no diagnostics can still represent a failed source/load audit.
echo '{"workspace": "/repo", "complete": false, "checked_files": [], "diagnostics": {"errors": 0, "warnings": 0, "infos": 0}}' >"$TEST_TMPDIR/coverage.json"
: >"$TEST_TMPDIR/diagnostics.jsonl"
if python3 action/summary.py "$TEST_TMPDIR"; then
    echo "accepted an incomplete report" >&2
    exit 1
fi
