import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTracker } from './tracker-data.mjs';
import * as records from './work-map-data.mjs';

// This is the curation time, not a fresh observation from the GitHub API.
// Advance it when reviewing records, never merely when rebuilding the site.
export const reviewedAt = '2026-11-19T23:07:10Z';
export const generated = buildTracker(records, reviewedAt);

if (process.argv.includes('--write')) {
  const directory = process.env.BUILD_WORKSPACE_DIRECTORY;
  if (!directory) throw new Error('Run with bazel run //docs:generate_registry -- --write');
  for (const [name, value] of [['registry.json', generated.registry], ['github-status.json', generated.snapshot],
    ['ruff-fork-audit.json', generated.audit]]) {
    writeFileSync(join(directory, 'docs', name), JSON.stringify(value, null, 2) + '\n');
  }
}
