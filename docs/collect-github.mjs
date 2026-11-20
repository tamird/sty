import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectObservations, saveObservations } from './github-provider.mjs';
import { buildRegistry } from './tracker-data.mjs';
import * as records from './work-map-data.mjs';

const workspace = process.env.BUILD_WORKSPACE_DIRECTORY;
if (!workspace) throw new Error('Run with bazel run //docs:collect_github');
const sources = ['work-map-data.mjs', 'ruff-fork-audit.mjs', 'solver-inventory.mjs', 'tracker-data.mjs']
  .map(name => join(workspace, 'docs', name))
  .map(path => [path, readFileSync(path, 'utf8')]);
const registry = buildRegistry(records, records.reviewedAt);
const observations = await collectObservations(registry, async query => {
  const result = spawnSync('gh', ['api', 'graphql', '--input', '-'], {
    input: JSON.stringify({ query }), encoding: 'utf8', timeout: 60_000, maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`GitHub capture failed: ${result.stderr.trim()}`);
  const response = JSON.parse(result.stdout);
  if (response.errors?.length || !response.data) throw new Error('GitHub capture returned an incomplete query response');
  return response.data;
});
if (sources.some(([path, original]) => readFileSync(path, 'utf8') !== original))
  throw new Error('Registry source changed during capture; previous observations preserved');
const target = join(workspace, 'docs', 'github-observations.json');
saveObservations(target, observations);
console.log(`Captured ${observations.prs.length} registered PRs at ${observations.checkedAt}. Run //docs:generate_registry to publish the saved observations.`);
