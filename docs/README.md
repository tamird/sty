# Tracker

The dashboard reuses the refined gVisor tracker from
[tamird/gvisor at 271dac933](https://github.com/tamird/gvisor/tree/271dac9335abe54e950d52285d1d0f083ecd403d):
the layout, attention queues, sortable table, dependency graph,
investigations, URL filters, selection drawer and copy controls.
sty uses its own indigo palette and SVG favicon.

`work-map-data.mjs` remains the source of truth. `tracker-data.mjs` adapts those
records to the inherited schema. Regenerate the published JSON after changing
records with `bazel run //docs:generate_registry -- --write`; the docs test
checks that the registry, status snapshot and fork audit match their sources.

`work-map-data.mjs` records the curation time. Rebuilding does not refresh
that timestamp. Capture current registered PRs with
`bazel run //docs:collect_github`, then regenerate the published JSON.
The collector reads the canonical registrations, including changes that have
not yet been generated. It saves bounded, dated observations of PR heads,
checks, reviews and unresolved threads, with completeness flags, in
`github-observations.json`.
The browser joins observations to each PR and keeps missing evidence unknown.
Curated follow-ups belong to the head on which they were recorded.

Bazel issue receipts remain separate from fresh reproductions. An open issue
does not establish that its reproduction still fails on current Bazel.
Ruff mechanism groups remain unqualified until the surviving changes pass
current-upstream reproduction and runtime checks. Existing
dependency references are evidence links, not invented blocking graph edges.
All repositories use the tracker's ordinary GitHub policy, without Copybara.

Upstream proposals link to published, qualified Ruff changes. Qualification does
not authorize submission: Tamir reviews every potential upstream contribution
before it is posted.

`ruff-fork-audit.mjs` records every path in the immutable Ruff diff from
`d63450150b` to `352ce32f76`, compared with upstream `aa46aae607`.
Its captured Git manifest is independent of the curated coverage records;
generation rejects missing paths and unknown mechanisms. The published
[`ruff-fork-audit.json`](ruff-fork-audit.json) includes exact file blobs,
sampled changed APIs/test headings, classifications and unresolved work.
Whole-file blob equality is distinguished from a compared mechanism or a
matching historical change title. Supporting tests and docs are not additional
upstream proposals. This old-fork coverage does not replace auditing the
surviving delta after the current rebase.

`solver-inventory.mjs` maps the reviewed solver changes to tracker tasks and
exact source links. Its review units include supporting and superseded
implementation details; their count is not a proposed PR count. Frozen source
review, forward reconciliation and runtime qualification have separate states.
