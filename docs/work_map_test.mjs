import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { generated } from './generate-registry.mjs';
import { goals, projects, upstream } from './work-map-data.mjs';

function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

unique(goals.map(goal => goal.id), 'Goal IDs');
unique(projects.map(project => `${project.repo}#${project.number}`), 'Project PRs');
unique(upstream.map(item => item.id), 'Upstream IDs');
unique(upstream.filter(item => item.number).map(item => item.number), 'Upstream PRs');

for (const project of projects) {
  assert.match(project.repo, /^[\w.-]+\/[\w.-]+$/);
  assert.ok(Number.isInteger(project.number) && project.number > 0, `Invalid PR for ${project.name}`);
  assert.match(project.head, /^[a-f0-9]{40}$/);
  for (const [label, url] of project.dependencies) {
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'https:', label);
    assert.equal(parsed.hostname, 'github.com', label);
  }
}

for (const item of upstream) {
  if (item.state === 'Merged') {
    assert.ok(item.number, `Merged item ${item.id} needs an upstream PR`);
    assert.match(item.merge, /^[a-f0-9]{10,40}$/);
  }
  if (item.state === 'Awaiting Tamir review') {
    assert.match(item.qualifiedHead, /^[a-f0-9]{40}$/);
    const reviewURL = new URL(item.qualifiedURL);
    assert.equal(reviewURL.protocol, 'https:');
    assert.equal(reviewURL.hostname, 'github.com');
    assert.match(reviewURL.pathname, /^\/tamird\/ruff\/(commit|compare|pull)\//, 'Review needs a published Ruff change, not a raw patch');
    assert.ok(item.qualification?.summary, `Review request ${item.id} needs completed qualification evidence`);
    assert.ok(item.qualification.evidence.length > 0, `Review request ${item.id} needs evidence links`);
    for (const evidence of item.qualification.evidence) assert.equal(new URL(evidence.url).protocol, 'https:');
  }
}

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
for (const asset of ['style.css', 'app.js', 'draft.js', 'icon.svg']) {
  assert.ok(html.includes(asset), `Missing published asset reference: ${asset}`);
  assert.ok(readFileSync(new URL(asset, import.meta.url)).length > 0);
}
for (const id of ['workspace', 'state-filters', 'dag-pane', 'table-pane', 'investigations-pane', 'details', 'search', 'group-filter', 'work-table', 'refresh']) {
  assert.ok(html.includes(`id="${id}"`), `Missing app mount: ${id}`);
}
for (const asset of ['app.js', 'draft.js', 'draft-reader.js']) {
  const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(asset, import.meta.url))], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
}
for (const [name, expected] of [['registry.json', generated.registry], ['github-status.json', generated.snapshot]]) {
  const actual = JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
  assert.deepEqual(actual, expected, `Regenerate ${name} with bazel run //docs:generate_registry -- --write`);
}

// Exercise the inherited browser application's real schema and attention logic.
const source = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
assert.ok(source.endsWith('start();\n'));
const tracker = runInNewContext(source.slice(0, -'start();\n'.length) + `
({ validateRegistry, validateSnapshot, attentionReasons, historical, citationURL,
  load(data, snapshot) {
    registry = data;
    model = { ...data, nodes: registryNodes(data) };
    for (const node of model.nodes) node.workStates = stateRecords(snapshot, node);
    return model.nodes;
  }
})`, { URL, console });
tracker.validateRegistry(generated.registry);
tracker.validateSnapshot(generated.snapshot, generated.registry);
const nodes = tracker.load(generated.registry, generated.snapshot);
assert.equal(nodes.filter(node => node.group === 'community').length, projects.length);
assert.equal(generated.registry.investigations.length, goals.length);
assert.equal(generated.snapshot.prs.length, 0, 'Do not invent provider-level check or review evidence');
assert.deepEqual(generated.registry.edges, [], 'Related links do not establish blocking dependencies');
for (const item of projects) {
  const node = nodes.find(node => node.repo === item.repo && node.number === item.number);
  assert.equal(node.followup.sourceHead, item.head);
  assert.equal(node.followup.nextAction, item.nextAction);
  assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'agent-recorded-followup'));
  assert.equal(node.github, undefined, 'Curated check prose must not become an effective approval');
}
for (const item of upstream) {
  if (item.state === 'Merged') assert.ok(tracker.historical(nodes.find(node => node.number === item.number)));
  if (item.state !== 'Awaiting Tamir review') continue;
  const node = nodes.find(node => node.id === `branch:${item.id}`);
  assert.equal(node.contributorReview.head, item.qualifiedHead);
  assert.equal(node.contributorReview.url, item.qualifiedURL);
  assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.owner === 'user'));
  assert.equal(node.humanAction, undefined, 'Review does not authorize an upstream submission');
  const invalid = structuredClone(generated.registry);
  invalid.nodes.find(candidate => candidate.id === node.id).contributorReview.head = '0'.repeat(40);
  assert.throws(() => tracker.validateRegistry(invalid), /Invalid contributor decision/);
}
