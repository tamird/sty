import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTracker } from './tracker-data.mjs';
import * as records from './work-map-data.mjs';

export const reviewedAt = records.reviewedAt;
export const observations = JSON.parse(readFileSync(new URL('./github-observations.json', import.meta.url), 'utf8'));
export const generated = buildTracker(records, reviewedAt, observations);

if (process.argv.includes('--write')) {
  const directory = process.env.BUILD_WORKSPACE_DIRECTORY;
  if (!directory) throw new Error('Run with bazel run //docs:generate_registry -- --write');
  for (const [name, value] of [['registry.json', generated.registry], ['github-status.json', generated.snapshot],
    ['ruff-fork-audit.json', generated.audit], ['ruff-forward-audit.json', records.ruffForwardAudit]]) {
    writeFileSync(join(directory, 'docs', name), JSON.stringify(value, null, 2) + '\n');
  }
}
