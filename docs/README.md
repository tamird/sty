# Tracker

The dashboard reuses the refined gVisor tracker from
[tamird/gvisor at 271dac933](https://github.com/tamird/gvisor/tree/271dac9335abe54e950d52285d1d0f083ecd403d):
the layout, colors, attention queues, sortable table, dependency graph,
investigations, URL filters, selection drawer and copy controls.

`work-map-data.mjs` remains the source of truth. `tracker-data.mjs` adapts those
records to the inherited schema. Regenerate the published JSON after changing
records with `bazel run //docs:generate_registry -- --write`; the docs test
checks that both generated files match the source.

`generate-registry.mjs` records the curation time. Rebuilding does not refresh
that timestamp. The inventory separates curated recovery records from dated GitHub issue
receipts. It is not a live GitHub feed: absent provider-level check and review
receipts stay unknown. Open feedback is not proof that an old reproduction
still fails on current Bazel. Ruff mechanism groups are preliminary until the
whole pinned fork is reconciled against current upstream. Existing
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
