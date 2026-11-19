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
that timestamp. These recovered records are curated evidence, not a live GitHub
feed: absent provider-level check and review receipts stay unknown. Existing
dependency references are evidence links, not invented blocking graph edges.
All repositories use the tracker's ordinary GitHub policy, without Copybara.

Upstream proposals link to published, qualified Ruff changes. Qualification does
not authorize submission: Tamir reviews every potential upstream contribution
before it is posted.
