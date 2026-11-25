import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';
import { generated, observations } from './generate-registry.mjs';
import { checkProviderIntegration } from './github-provider-test.mjs';
import { buildRegistry, validateForkAudit, validateSolverInventory, validateForwardAudit } from './tracker-data.mjs';
import { registeredPRs } from './github-provider.mjs';
import { ruffForkAudit } from './ruff-fork-audit.mjs';
import * as records from './work-map-data.mjs';
const { goals, projects, additionalProjects, relatedChanges, languageWork, bazelFeedback, bazelFeedbackObservedAt, tyWork, upstream } = records;
const { solverInventory } = records;
const { ruffForwardAudit } = records;

function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

unique(goals.map(goal => goal.id), 'Goal IDs');
unique(projects.map(project => `${project.repo}#${project.number}`), 'Project PRs');
unique(upstream.map(item => item.id), 'Upstream IDs');
unique(upstream.filter(item => item.number).map(item => item.number), 'Upstream PRs');
unique(tyWork.map(item => item.id), 'ty task IDs');

validateForwardAudit(ruffForwardAudit, tyWork);
const missingForwardPath = structuredClone(ruffForwardAudit);
missingForwardPath.manifest.pop();
assert.throws(() => validateForwardAudit(missingForwardPath, tyWork), /Incomplete forward path inventory/);
const alteredForwardBlob = structuredClone(ruffForwardAudit);
alteredForwardBlob.manifest[0].candidateBlob = '1'.repeat(40);
assert.throws(() => validateForwardAudit(alteredForwardBlob, tyWork), /manifest digest/);
const falseFrozenReuse = structuredClone(ruffForwardAudit);
falseFrozenReuse.manifest.find(row => row.disposition === 'forward-source-attributed').disposition = 'frozen-source-reused';
assert.throws(() => validateForwardAudit(falseFrozenReuse, tyWork), /Unproven frozen source reuse/);
const inconsistentFrozenEquality = structuredClone(ruffForwardAudit);
inconsistentFrozenEquality.manifest[0].sameBaseBlobAsFrozen = !inconsistentFrozenEquality.manifest[0].sameBaseBlobAsFrozen;
assert.throws(() => validateForwardAudit(inconsistentFrozenEquality, tyWork), /Inconsistent forward blob equality/);
const missingForwardAttribution = structuredClone(ruffForwardAudit);
missingForwardAttribution.files.pop();
assert.throws(() => validateForwardAudit(missingForwardAttribution, tyWork), /Incomplete forward Rust source coverage/);
const detachedForwardUnit = structuredClone(ruffForwardAudit);
detachedForwardUnit.forwardReviewUnits[0].trackerParent = 'unregistered';
assert.throws(() => validateForwardAudit(detachedForwardUnit, tyWork), /Invalid forward producer family/);
const unprovenForwardQualification = structuredClone(ruffForwardAudit);
unprovenForwardQualification.runtimeQualifiedByThisAudit = true;
assert.throws(() => validateForwardAudit(unprovenForwardQualification, tyWork), /Invalid forward source inventory/);
for (const unit of ruffForwardAudit.forwardReviewUnits) {
  const task = generated.registry.investigations.find(item => item.id === `investigation:${unit.trackerParent}`);
  assert.ok(task.findings.some(finding => finding.forwardSourceInventory && finding.sourceInventory && finding.text.includes(unit.title) &&
    finding.evidence.some(source => source.url === unit.evidence[0].url)), `Missing forward producer: ${unit.id}`);
}

validateSolverInventory(solverInventory, tyWork);
assert.equal(solverInventory.coverage.runtimeOrMixedHunks, 939);
assert.equal(solverInventory.units.length, 169);
assert.equal(solverInventory.frozen.indexDigest, '3079cbd8391602919f08654ec210ad9dbad6a6c1eba3e0b4ef6c8ec21a33ac8b');
const missingSolverUnit = structuredClone(solverInventory);
missingSolverUnit.units.pop();
assert.throws(() => validateSolverInventory(missingSolverUnit, tyWork), /Incomplete solver source inventory/);
const detachedSolverUnit = structuredClone(solverInventory);
detachedSolverUnit.units[0].trackerParent = 'not-registered';
assert.throws(() => validateSolverInventory(detachedSolverUnit, tyWork), /Invalid solver source unit/);
const falselyQualified = structuredClone(solverInventory);
falselyQualified.units[0].qualified = true;
assert.throws(() => validateSolverInventory(falselyQualified, tyWork), /Invalid solver source unit/);
for (const unit of solverInventory.units) {
  const task = generated.registry.investigations.find(item => item.id === `investigation:${unit.trackerParent}`);
  assert.ok(task.findings.some(finding => finding.text.includes(unit.detail) &&
    finding.evidence.some(source => source.url === unit.evidence[0].url)), `Missing source finding: ${unit.id}`);
}

const sourceAudit = JSON.parse(readFileSync(new URL('./ruff-source-audit.json', import.meta.url), 'utf8'));
assert.equal(sourceAudit.candidate, solverInventory.frozen.revision);
assert.equal(sourceAudit.base, solverInventory.frozen.base);
assert.equal(sourceAudit.rows.length, 231);
unique(sourceAudit.rows.map(row => row.path), 'Frozen rebased source paths');
const runtimeRows = sourceAudit.rows.filter(row => row.role === 'runtime-or-public-api');
assert.equal(runtimeRows.length, 142);
assert.ok(runtimeRows.every(row => row.sourceAttribution &&
  row.sourceURL === `https://github.com/tamird/ruff/blob/${sourceAudit.candidate}/${row.path}`));
assert.equal(sourceAudit.solverHunks.revision, solverInventory.frozen.hunkRevision);
const historicalHunks = sourceAudit.solverHunks.rows;
unique(historicalHunks.map(row => row.id), 'Historical solver hunk identities');
assert.deepEqual(new Set(historicalHunks.map(row => row.id)),
  new Set(solverInventory.units.flatMap(unit => unit.hunkIds)), 'Every frozen solver hunk needs semantic attribution');
for (const hunk of historicalHunks) {
  assert.match(hunk.patchSHA256, /^[a-f0-9]{64}$/);
  assert.equal(hunk.sourceURL,
    `https://github.com/tamird/ruff/blob/${sourceAudit.solverHunks.revision}/${hunk.path}#L${hunk.newStart}`);
}

// Capture follows registrations that have not yet been written to registry.json.
const removed = upstream.find(item => item.number).number;
const changedRecords = { ...records, upstream: upstream.filter(item => item.number !== removed).concat({
  id: 'new-capture-target', title: 'Newly registered PR', number: 999999, state: 'Related upstream work',
}) };
const captureTargets = registeredPRs(buildRegistry(changedRecords, records.reviewedAt));
assert.ok(captureTargets.some(item => item.repo === 'astral-sh/ruff' && item.number === 999999));
assert.ok(!captureTargets.some(item => item.repo === 'astral-sh/ruff' && item.number === removed));

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
  if (item.qualifiedCommitCount !== undefined) {
    assert.ok(Number.isSafeInteger(item.qualifiedCommitCount) && item.qualifiedCommitCount > 0);
    assert.match(item.qualifiedHead, /^[a-f0-9]{40}$/);
    assert.match(item.qualifiedBase, /^[a-f0-9]{40}$/);
    const path = item.qualifiedCommitCount === 1
      ? `commit/${item.qualifiedHead}` : `compare/${item.qualifiedBase}...${item.qualifiedHead}`;
    assert.equal(item.qualifiedURL, `https://github.com/tamird/ruff/${path}`,
      'A single commit needs its native commit page; a series needs its range');
  }
  if (item.state === 'Awaiting Tamir review') {
    assert.ok(item.ref, `Review request ${item.id} needs its published branch`);
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
for (const [name, expected] of [['registry.json', generated.registry], ['github-status.json', generated.snapshot],
  ['ruff-fork-audit.json', generated.audit], ['ruff-forward-audit.json', ruffForwardAudit]]) {
  const actual = JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
  assert.deepEqual(actual, expected, `Regenerate ${name} with bazel run //docs:generate_registry -- --write`);
}

// Exercise the inherited browser application's real schema and attention logic.
const source = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
assert.ok(source.endsWith('start();\n'));
const document = {
  createElement(tag) {
    let resolveHref;
    const hrefReady = new Promise(resolve => { resolveHref = resolve; });
    return { tagName: tag.toUpperCase(), children: [], hrefReady,
      get href() { return this.url; },
      set href(value) { this.url = value; resolveHref(value); },
      append(...children) { this.children.push(...children); },
      setAttribute(name, value) { this[name] = value; },
      addEventListener() {} };
  },
};
const tracker = runInNewContext(readFileSync(new URL('./draft.js', import.meta.url), 'utf8') + '\n' + source.slice(0, -'start();\n'.length) + `
({ validateRegistry, validateSnapshot, attentionReasons, historical, citationURL, status, checkInfo, checksPassed, effectiveReviewDecision, withConflictResult, mergeProviderPRs,
  recheck(pr, result) {
    const id = prIdentity(pr);
    conflictResults.set(id, result);
    try { return withConflictResult(pr); }
    finally { conflictResults.delete(id); }
  },
  async renderDecisionLinks(node) {
    const parent = document.createElement('div');
    const current = { ...node, workStates: stateRecords(liveSnapshot, node) };
    appendContributorDecisions(parent, current, pendingDecisions(current));
    const anchors = parent.children.flatMap(section => section.children.filter(child => child.tagName === 'A'));
    return Promise.all(anchors.map(async anchor => ({ label: anchor.textContent, url: await anchor.hrefReady })));
  },
  async renderChangeLink(node, decision) {
    return await reviewChangeLink(node, decision).hrefReady;
  },
  async renderSettledLinks(node) {
    const parent = document.createElement('div');
    appendSettledPublications(parent, node);
    return Promise.all(parent.children.filter(child => child.tagName === 'A')
      .map(async anchor => ({ label: anchor.textContent, url: await anchor.hrefReady })));
  },
  findDraft, findDraftEntry, draftReturnURL, refinementComparison,
  load(data, snapshot) {
    registry = data;
    liveSnapshot = snapshot;
    model = { ...data, nodes: mergeProviderPRs(data, snapshot).nodes };
    for (const node of model.nodes) node.workStates = stateRecords(snapshot, node);
    return model.nodes;
  }
})`, { URL, console, document, crypto: webcrypto, TextEncoder, location: { href: 'https://tamird.github.io/sty/' } });
tracker.validateRegistry(generated.registry);
tracker.validateSnapshot(generated.snapshot, generated.registry);
const nodes = tracker.load(generated.registry, generated.snapshot);
assert.equal(nodes.filter(node => node.group === 'community').length, projects.length + additionalProjects.length + relatedChanges.length);
assert.equal(generated.registry.investigations.length, goals.length + tyWork.length);
assert.deepEqual(generated.snapshot.prs, observations.prs, 'Provider records must come from saved observations');
await checkProviderIntegration(tracker, generated.registry, generated.snapshot);
assert.ok(generated.registry.edges.every(edge => edge.type === 'includes'), 'Related links do not establish blocking dependencies');
for (const item of [...projects, ...additionalProjects]) {
  const node = nodes.find(node => node.repo === item.repo && node.number === item.number);
  const observed = observations.prs.find(row => row.repo === item.repo && row.number === item.number);
  assert.equal(Boolean(node.github), Boolean(observed), 'Curated prose must not manufacture provider observations');
  if (item.settledReviews) {
    assert.deepEqual(node.settledReviews, item.settledReviews);
    assert.equal((await tracker.renderDecisionLinks(node)).length, 0);
    const links = await tracker.renderSettledLinks(node);
    const delivered = links.find(link => link.label === 'Read delivered amendment range-diff');
    const reader = new URL(delivered.url);
    assert.deepEqual(await tracker.findDraft(node, reader.searchParams.get('draft')), item.settledReviews[0]);
  }
  assert.equal(node.followup.sourceHead, item.head);
  assert.equal(node.followup.nextAction, item.nextAction);
  if (!observed || observed.head === item.head && !['closed', 'merged'].includes(observed.status))
    assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'agent-recorded-followup'));
  else assert.ok(!tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'agent-recorded-followup'), 'Recorded follow-ups belong to their source head');
}
const renderedReviewLinks = [];
for (const item of upstream) {
  if (item.qualifiedCommitCount !== undefined) {
    const node = nodes.find(node => item.number ? node.repo === 'astral-sh/ruff' && node.number === item.number : node.id === `branch:${item.id}`);
    if (item.contributorReview?.kind === 'scope') {
      assert.equal(node.contributorReview.head, item.qualifiedHead);
      assert.deepEqual(node.contributorReview, item.contributorReview);
      assert.equal(tracker.refinementComparison(node, node.contributorReview), null,
        'Scope authorization does not review a source revision');
      assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'authorize-scope'));
      const links = await tracker.renderDecisionLinks(node);
      const reader = new URL(links[0].url);
      assert.deepEqual(await tracker.findDraft(node, reader.searchParams.get('draft')), item.contributorReview);
      assert.equal(links[1].url, node.url, 'Scope context links the existing PR');
      const changed = { ...node, github: { ...node.github, head: '0'.repeat(40) } };
      assert.ok(!tracker.attentionReasons(changed, 'tamird').some(reason => reason.id === 'authorize-scope'),
        'A changed PR head requires reassessing the source-bound scope decision');
      console.log('RENDERED_SCOPE_READER_URL', reader.href);
    } else if (item.contributorReview) {
      assert.deepEqual(node.contributorReview, item.contributorReview);
      assert.equal(node.head, item.qualifiedHead, 'An amendment does not replace the published PR head');
      if (node.contributorReview.kind === 'amendment') {
        assert.equal(node.github.head, item.qualifiedHead);
        assert.equal(node.contributorReview.baseHead, item.qualifiedHead);
        assert.notEqual(node.contributorReview.head, item.qualifiedHead);
      } else {
        assert.equal(node.type, 'branch');
        assert.equal(node.contributorReview.kind, 'proposal');
        assert.equal(node.contributorReview.head, item.qualifiedHead);
        assert.equal(node.contributorReview.baseHead, item.qualifiedBase);
      }
      const comparison = tracker.refinementComparison(node, node.contributorReview);
      if (node.refinement || node.contributorReview.kind === 'amendment')
        assert.ok(comparison, 'A recorded revision must retain its actual range-diff comparison');
      if (comparison) assert.ok(comparison.command.includes('--creation-factor=999'),
        'The copyable single-commit command pairs the same replacement as the captured range-diff');
      assert.equal(node.followup, undefined, 'The amendment decision has no duplicate agent task');
      const amendmentLinks = await tracker.renderDecisionLinks(node);
      const reader = new URL(amendmentLinks[0].url);
      assert.equal(reader.pathname, '/sty/draft.html');
      assert.equal(decodeURIComponent(reader.hash.slice(1)), node.id);
      const draft = await tracker.findDraft(node, reader.searchParams.get('draft'));
      assert.deepEqual(draft, item.contributorReview, 'The reader addresses the exact amendment text');
      assert.equal(amendmentLinks[1].url, item.contributorReview.url, 'Retain the complete commit artifact separately');
      if (comparison) {
        assert.equal(await tracker.renderChangeLink(node, node.contributorReview), reader.href,
          'The table and details use the same actual reader action');
        assert.equal(amendmentLinks[0].label, node.contributorReview.kind === 'amendment'
          ? 'Read amendment range-diff' : 'Read revised proposal range-diff');
        assert.ok(draft.body.includes('```diff\n') && draft.body.includes('range-diff --no-color --no-dual-color --creation-factor=999'),
          'The reader contains the actual comparison, not only its command');
        const markdown = runInNewContext(readFileSync(new URL('./vendor/markdown-it-15.0.3/markdown-it.min.js', import.meta.url), 'utf8')
          + '\nmarkdownit({ html: false, linkify: true })');
        assert.ok(markdown.render(draft.body).includes('<pre><code class="language-diff">'), 'The existing reader renderer presents the diff');
      } else {
        assert.equal(amendmentLinks[0].label, 'Read draft');
        assert.equal(await tracker.renderChangeLink(node, node.contributorReview), item.contributorReview.url,
          'An initial proposal links its native commit without inventing a prior review');
      }
      console.log('RENDERED_AMENDMENT_READER_URL', reader.href);
      assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.owner === 'user'));
      console.log('RENDERED_AMENDMENT_ACTION_URL', node.contributorReview.url);
    } else if (item.state !== 'Awaiting Tamir review') {
      assert.equal((await tracker.renderDecisionLinks(node)).length, 0, 'Current approved or held heads must not ask for approval again');
      assert.ok(!tracker.attentionReasons(node, 'tamird').some(reason => reason.owner === 'user'));
    } else assert.deepEqual(Array.from(await tracker.renderDecisionLinks(node), anchor => anchor.url), [item.qualifiedURL]);
    const preview = { ...node, id: `branch:${item.id}`, type: 'branch', repo: 'tamird/ruff',
      url: item.qualifiedURL, head: item.qualifiedHead, ref: item.ref, github: undefined,
      settledReviews: undefined, followup: undefined, refinement: undefined,
      contributorReview: { kind: 'proposal', status: 'pending', head: item.qualifiedHead,
        baseHead: item.qualifiedBase, url: item.qualifiedURL } };
    const links = await tracker.renderDecisionLinks(preview);
    assert.deepEqual(Array.from(links, anchor => anchor.url), [item.qualifiedURL], 'Check the actual proposal-action renderer');
    renderedReviewLinks.push({ head: item.qualifiedHead, url: links[0].url });
    const approval = item.settledReviews?.findLast(review => ['proposal', 'amendment'].includes(review.kind)
      && review.head === item.qualifiedHead && review.url === item.qualifiedURL);
    const delivery = item.settledReviews?.findLast(review => review.kind === 'amendment'
      && review.outcome === 'posted' && review.head === item.qualifiedHead && review.url === item.qualifiedURL);
    if (delivery) assert.ok(item.settledReviews.some(review => review.outcome === 'approved'
      && review.head === delivery.baseHead && review.url === `https://github.com/tamird/ruff/commit/${delivery.baseHead}`),
    'Delivered amendments retain the approval of their original contribution');
    if (approval?.outcome === 'approved' || delivery) {
      assert.equal(node.settledReviews.findLast(review => ['proposal', 'amendment'].includes(review.kind)
        && review.head === item.qualifiedHead).outcome, delivery ? 'posted' : 'approved');
      assert.deepEqual(node.settledReviews, item.settledReviews, 'The actual node keeps its settled approval');
      if (node.type === 'branch')
        assert.equal((await tracker.renderDecisionLinks({ ...preview, settledReviews: node.settledReviews })).length, 0,
          'An exact settled approval must suppress a repeated branch request');
      assert.deepEqual(node.contributorReview, item.contributorReview, 'Old approval only settles its exact proposal head');
      assert.equal(node.humanAction, undefined, 'Submission is already authorized, not a new human task');
      assert.ok(node.summary.includes((delivery || approval).summary), 'Describe exact approval or authorized delivery without conflating them');
      const approved = node.settledReviews.find(review => review.outcome === 'approved' && review.body);
      if (approved) {
        const links = await tracker.renderSettledLinks(node);
        const label = approved.kind === 'proposal' ? 'Read approved proposal' : 'Read approved revision range-diff';
        const reader = new URL(links.find(link => link.label === label).url);
        assert.deepEqual(await tracker.findDraft(node, reader.searchParams.get('draft')), approved);
        const key = reader.searchParams.get('draft');
        assert.equal((await tracker.findDraftEntry(nodes, node.id, key)).item, node);
        if (node.type === 'pr') {
          const oldBranchID = `branch:${item.id}`;
          assert.ok(!nodes.some(candidate => candidate.id === oldBranchID));
          const migrated = await tracker.findDraftEntry(nodes, oldBranchID, key);
          assert.equal(migrated.item, node, 'A sent branch link resolves after PR registration');
          assert.equal(migrated.draft, approved, 'Migration preserves the exact retained review text');
          const oldURL = new URL(reader);
          oldURL.hash = encodeURIComponent(oldBranchID);
          oldURL.searchParams.set('group', 'ty');
          const back = tracker.draftReturnURL(oldURL, migrated.item.id);
          assert.equal(decodeURIComponent(back.hash.slice(1)), node.id, 'Back and Escape return to the current card');
          assert.equal(back.searchParams.get('group'), 'ty');
          assert.equal(back.searchParams.has('draft'), false);
          assert.equal(await tracker.findDraftEntry(nodes, oldBranchID, key + '-wrong'), null);
          assert.equal(await tracker.findDraftEntry([node, { ...node, id: 'duplicate-history' }], oldBranchID, key), null,
            'An ambiguous retained key must not select an unrelated item');
        }
        if (approved.kind === 'amendment' || node.refinement?.after.head === approved.head)
          assert.ok(approved.body.includes('```diff\n'), 'Approved comparison remains readable without a new decision');
        console.log('RENDERED_APPROVED_HISTORY_READER_URL', reader.href);
      }
      if (delivery) {
        const links = await tracker.renderSettledLinks(node);
        const deliveredLinks = links.filter(link => link.label === 'Read delivered amendment range-diff');
        const drafts = await Promise.all(deliveredLinks.map(link =>
          tracker.findDraft(node, new URL(link.url).searchParams.get('draft'))));
        assert.ok(drafts.includes(delivery), 'The current delivery has a reader alongside earlier deliveries');
        assert.ok(delivery.body.includes('```diff\n'), 'Delivered source changes retain their actual range-diff');
      }
    } else assert.equal(node.settledReviews, undefined, 'Assessment is not approval');
    if (item.state === 'Submitted') {
      assert.equal(node.url, `https://github.com/astral-sh/ruff/pull/${item.number}`);
      assert.ok(node.evidence.some(evidence => evidence.url === item.qualifiedURL), 'Submitted PR keeps its native commit review artifact');
    }
  }
  if (item.state === 'Merged') assert.ok(tracker.historical(nodes.find(node => node.number === item.number)));
  if (item.nextAction && item.state !== 'Awaiting Tamir review') {
    const node = nodes.find(node => item.number ? node.repo === 'astral-sh/ruff' && node.number === item.number : node.id === `branch:${item.id}`);
    assert.equal(node.contributorReview, undefined, 'Outstanding feedback must not request approval of the old proposal');
    assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'agent-recorded-followup'));
  }
  if (item.state !== 'Awaiting Tamir review' || item.number) continue;
  const node = nodes.find(node => node.id === `branch:${item.id}`);
  assert.equal(node.ref, item.ref, 'Each proposal needs its own published branch');
  assert.equal(node.followup, undefined, 'Qualified proposals need one contributor decision, without a duplicate agent task');
  assert.equal(node.contributorReview.head, item.qualifiedHead);
  assert.equal(node.contributorReview.url, item.qualifiedURL);
  assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.owner === 'user'));
  assert.equal(node.humanAction, undefined, 'Review does not authorize an upstream submission');
  const invalid = structuredClone(generated.registry);
  invalid.nodes.find(candidate => candidate.id === node.id).contributorReview.head = '0'.repeat(40);
  assert.throws(() => tracker.validateRegistry(invalid), /Invalid contributor decision/);
}

console.log('RENDERED_REVIEW_ACTION_URLS', JSON.stringify(renderedReviewLinks));

unique(bazelFeedback.map(item => item.number), 'Bazel feedback issues');
assert.equal(bazelFeedback.length, 17, 'Reconcile the full discovered typing issue set');
assert.equal(Object.keys(generated.snapshot.issues).length, bazelFeedback.length);
for (const item of bazelFeedback) {
  const id = `issue:bazelbuild/bazel:${item.number}`;
  const node = nodes.find(node => node.id === id);
  assert.equal(node.type, 'issue');
  const receipt = generated.snapshot.issues[id];
  assert.equal(receipt.githubState, item.state);
  assert.ok(tracker.status({ ...node, ...receipt }).startsWith(`Issue ${item.state}`));
  assert.ok(tracker.historical({ ...node, ...receipt, githubState: 'closed' }), 'Closed issues become history through provider state');
  assert.equal(receipt.checkedAt, bazelFeedbackObservedAt);
  assert.ok(Date.parse(receipt.updatedAt) <= Date.parse(receipt.checkedAt));
  assert.equal(receipt.githubStateReason, undefined, 'Unknown closure reason must stay absent');
}
const incompleteIssues = structuredClone(generated.snapshot);
delete incompleteIssues.issues[`issue:bazelbuild/bazel:${bazelFeedback[0].number}`];
assert.throws(() => tracker.validateSnapshot(incompleteIssues, generated.registry), /Incomplete issue inventory/);
const invalidIssue = structuredClone(generated.snapshot);
invalidIssue.issues[`issue:bazelbuild/bazel:${bazelFeedback[0].number}`].updatedAt = 'unknown';
assert.throws(() => tracker.validateSnapshot(invalidIssue, generated.registry), /Invalid issue provider/);
for (const item of tyWork) {
  const node = nodes.find(node => node.id === `investigation:${item.id}`);
  assert.ok(tracker.attentionReasons(node, 'tamird').some(reason => reason.id === 'agent-recorded-followup'));
  assert.equal(tracker.attentionReasons({ ...node, owner: 'Maintainer' }, 'tamird').length, 0);
  assert.equal(tracker.attentionReasons({ ...node, task: false }, 'tamird').length, 0);
  assert.equal(node.contributorReview, undefined, 'Inventory candidates are not qualified review proposals');
}
const invalidGroup = structuredClone(generated.registry);
invalidGroup.investigations.find(item => item.task).group = 'unknown';
assert.throws(() => tracker.validateRegistry(invalidGroup), /Invalid investigation group/);
assert.equal(generated.registry.meta.inventory.sourceReview.qualified, false);
assert.equal(generated.registry.meta.inventory.sourceReview.runtimePathsWithSourceRecords, runtimeRows.length);
assert.ok(languageWork.some(item => item.number === 318 && item.state === 'merged'));

// Freeze the independently captured scope, then exercise curation failures at the
// same boundary used by the generator. No mutable Ruff checkout is a test input.
assert.equal(ruffForkAudit.manifest.length, 250);
const manifestDigest = createHash('sha256').update(JSON.stringify(ruffForkAudit.manifest)).digest('hex');
assert.equal(manifestDigest, '9e64a3e6c4c0b233270f2664f683e816a97f707fded48e86653cee8068fdf0d1');
assert.equal(manifestDigest, ruffForkAudit.manifestSHA256);
validateForkAudit(ruffForkAudit, tyWork);
const missingPath = structuredClone(ruffForkAudit);
missingPath.coverage.pop();
assert.throws(() => validateForkAudit(missingPath, tyWork), /Incomplete fork path coverage/);
const inventedMechanism = structuredClone(ruffForkAudit);
inventedMechanism.coverage[0].mechanisms.push('unknown');
assert.throws(() => validateForkAudit(inventedMechanism, tyWork), /Invalid fork disposition/);
const unknownReconciliation = structuredClone(ruffForkAudit);
unknownReconciliation.coverage[0].reconciliation = 'reconciled';
assert.throws(() => validateForkAudit(unknownReconciliation, tyWork), /Invalid fork disposition/);
const hiddenWork = structuredClone(ruffForkAudit);
const partial = hiddenWork.coverage.find(item => item.reconciliation === 'partial');
partial.categories = partial.categories.filter(value => value !== 'unreconciled');
assert.throws(() => validateForkAudit(hiddenWork, tyWork), /Hidden unresolved fork work/);
const unprovenMatch = structuredClone(ruffForkAudit);
unprovenMatch.coverage.find(item => item.reconciliation === 'exact-file-match').upstreamBlob = '0'.repeat(40);
assert.throws(() => validateForkAudit(unprovenMatch, tyWork), /Unproven upstream file equivalence/);
assert.equal(generated.registry.meta.inventory.pathAudit.paths, 250);
assert.equal(generated.registry.meta.inventory.pathAudit.currentDeltaAudit.state, 'pending');
