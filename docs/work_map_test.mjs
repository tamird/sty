import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
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
    assert.ok(item.qualification?.summary, `Review request ${item.id} needs completed qualification evidence`);
    assert.ok(item.qualification.evidence.length > 0, `Review request ${item.id} needs evidence links`);
    for (const evidence of item.qualification.evidence) assert.equal(new URL(evidence.url).protocol, 'https:');
  }
}

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
for (const asset of ['style.css', 'app.mjs']) {
  assert.ok(html.includes(`"${asset}"`), `Missing published asset reference: ${asset}`);
}
for (const id of ['goals', 'upstream-items', 'projects', 'search', 'state', 'count']) {
  assert.ok(html.includes(`id="${id}"`), `Missing app mount: ${id}`);
}
const syntax = spawnSync(process.execPath, ['--check', fileURLToPath(new URL('./app.mjs', import.meta.url))], { encoding: 'utf8' });
assert.equal(syntax.status, 0, syntax.stderr);
