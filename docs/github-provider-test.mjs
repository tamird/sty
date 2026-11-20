import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectObservations, currentCheckAttempts, normalizePullRequest, registeredPRs, REQUEST_LIMIT, BATCH_SIZE,
  saveObservations, validateObservations } from './github-provider.mjs';

const HEAD = '1'.repeat(40), BASE = '2'.repeat(40), NEXT = '3'.repeat(40);
const COMMITTED = '2026-11-19T10:00:00Z', CHECKED = '2026-11-20T03:00:00Z';
const observedIdentity = { repo: 'example/first', number: 7 };
const forward = nodes => ({ nodes, pageInfo: { hasNextPage: false } });
const backward = nodes => ({ nodes, pageInfo: { hasPreviousPage: false } });

function rawPR({ repo = observedIdentity.repo, number = observedIdentity.number } = {}) {
  return { number, repository: { nameWithOwner: repo, isPrivate: false }, title: 'Typed helpers',
    url: `https://github.com/${repo}/pull/${number}`, state: 'OPEN', isDraft: false,
    headRefName: 'types', headRefOid: HEAD, headRef: { name: 'types', target: { oid: HEAD } },
    baseRefOid: BASE, baseRef: { name: 'main', target: { oid: BASE } },
    headRepository: { nameWithOwner: 'tamird/first', owner: { login: 'tamird' } }, author: { login: 'tamird' },
    updatedAt: COMMITTED, createdAt: COMMITTED, mergedAt: null, closedAt: null, mergeCommit: null,
    reviewDecision: 'REVIEW_REQUIRED', mergeable: 'MERGEABLE', mergeStateStatus: 'CLEAN',
    headHistory: { nodes: [] }, labels: forward([]), comments: backward([]), reviews: backward([]),
    reviewDismissals: backward([]), reviewRequests: forward([]),
    reviewThreads: { ...forward([]), totalCount: 0 },
    commits: { nodes: [{ commit: { oid: HEAD, committedDate: COMMITTED, statusCheckRollup: null } }] } };
}

function check(id, conclusion = 'SUCCESS', runNumber = 1, runAttempt = 1) {
  return { __typename: 'CheckRun', id, name: 'test', status: 'COMPLETED', conclusion,
    detailsUrl: `https://github.com/example/first/actions/runs/${runNumber}/job/${id}`,
    checkSuite: { app: { id: 'app', slug: 'github-actions', name: 'GitHub Actions' },
      workflowRun: { runNumber, runAttempt, workflow: { id: 'workflow', name: 'CI' } } } };
}

function withChecks(raw, nodes, { state = 'SUCCESS', partial = false, total = nodes.length } = {}) {
  raw.commits.nodes[0].commit.statusCheckRollup = {
    state, contexts: { nodes, totalCount: total, pageInfo: { hasNextPage: partial } } };
  return raw;
}

function approval(raw, changes = {}) {
  raw.reviewDecision = 'APPROVED';
  raw.reviews.nodes.push({ id: 'review', url: raw.url + '#pullrequestreview-1', body: '', state: 'APPROVED',
    submittedAt: '2026-11-19T12:00:00Z', updatedAt: '2026-11-19T12:00:00Z',
    authorAssociation: 'MEMBER', author: { login: 'maintainer', __typename: 'User' }, commit: { oid: HEAD }, ...changes });
  return raw;
}

function dataRegistry() {
  return { meta: { repo: 'astral-sh/ruff', owner: 'tamird', updatedAt: COMMITTED,
    repositories: { 'astral-sh/ruff': 'none', 'example/first': 'none', 'example/second': 'none' } },
    nodes: ['example/first', 'example/second'].map(repo => ({ id: `pr:${repo}:7`, type: 'pr', repo, number: 7,
      title: 'Curated title', url: `https://github.com/${repo}/pull/7`, head: HEAD, status: 'open', group: 'community',
      summary: 'Curated source context', followup: { owner: 'Agent', sourceHead: HEAD, nextAction: 'Finish qualification' } })),
    edges: [], investigations: [], groups: [{ id: 'community', label: 'Community' }] };
}

export async function checkProviderIntegration(tracker, registry, snapshot) {
  // A genuine null rollup and an incomplete all-green list have different meanings;
  // neither can make a revision ready to merge.
  const absent = normalizePullRequest(rawPR(), observedIdentity, CHECKED);
  assert.equal(tracker.checkInfo(absent).text, 'No published checks');
  assert.equal(tracker.checksPassed(absent), false);
  const truncated = normalizePullRequest(withChecks(rawPR(), [check('success')], { partial: true, total: 2 }), observedIdentity, CHECKED);
  assert.equal(tracker.checkInfo(truncated).tone, 'unknown');
  assert.equal(tracker.checksPassed(truncated), false);
  assert.equal(truncated.checks.complete, false);

  const missingRollup = rawPR();
  delete missingRollup.commits.nodes[0].commit.statusCheckRollup;
  assert.throws(() => normalizePullRequest(missingRollup, observedIdentity, CHECKED), /Missing exact-head check rollup/);
  const moved = rawPR();
  moved.commits.nodes[0].commit.oid = NEXT;
  assert.throws(() => normalizePullRequest(moved, observedIdentity, CHECKED), /head changed/);
  const privatePR = rawPR();
  privatePR.repository.isPrivate = true;
  assert.throws(() => normalizePullRequest(privatePR, observedIdentity, CHECKED), /identity changed/);

  // Same-named matrix jobs at one run/attempt survive. A newer identified attempt
  // supersedes the older failure while retaining GitHub's original aggregate.
  const attempts = normalizePullRequest(withChecks(rawPR(), [check('old', 'FAILURE', 1), check('one', 'SUCCESS', 2), check('two', 'SUCCESS', 2)],
    { state: 'FAILURE' }), observedIdentity, CHECKED);
  assert.deepEqual(attempts.checks.contexts.map(item => item.id), ['one', 'two']);
  assert.deepEqual(attempts.checks.supersededContexts.map(item => item.id), ['old']);
  assert.equal(attempts.checks.state, 'FAILURE');
  assert.equal(tracker.checksPassed(attempts), false);
  const unidentified = check('unidentified', 'FAILURE', 1);
  unidentified.checkSuite.workflowRun.workflow = null;
  const ambiguous = normalizePullRequest(withChecks(rawPR(), [unidentified, check('current', 'SUCCESS', 2)], { state: 'FAILURE' }), observedIdentity, CHECKED);
  assert.equal(ambiguous.checks.supersededContexts.length, 0);
  assert.equal(tracker.checkInfo(ambiguous).tone, 'bad');
  assert.deepEqual(currentCheckAttempts(ambiguous.checks.contexts).current.map(item => item.id), ['unidentified', 'current']);

  const approved = normalizePullRequest(approval(rawPR()), observedIdentity, CHECKED);
  assert.equal(tracker.effectiveReviewDecision(approved), 'APPROVED');
  const contributorApproval = normalizePullRequest(approval(rawPR(), { authorAssociation: 'CONTRIBUTOR' }), observedIdentity, CHECKED);
  assert.equal(tracker.effectiveReviewDecision(contributorApproval), 'APPROVED');
  for (const raw of [approval(rawPR(), { commit: { oid: NEXT } }),
    approval(rawPR(), { author: { login: 'tamird', __typename: 'User' } }),
    approval(rawPR(), { author: { login: 'review-bot', __typename: 'Bot' } })]) {
    assert.equal(tracker.effectiveReviewDecision(normalizePullRequest(raw, observedIdentity, CHECKED)), 'REVIEW_REQUIRED');
  }
  const pushed = approval(rawPR());
  pushed.headHistory.nodes.push({ createdAt: '2026-11-19T13:00:00Z', beforeCommit: { oid: NEXT }, afterCommit: { oid: HEAD } });
  assert.equal(tracker.effectiveReviewDecision(normalizePullRequest(pushed, observedIdentity, CHECKED)), 'REVIEW_REQUIRED');
  const incompleteReviews = approval(rawPR());
  incompleteReviews.reviews.pageInfo.hasPreviousPage = true;
  assert.equal(tracker.effectiveReviewDecision(normalizePullRequest(incompleteReviews, observedIdentity, CHECKED)), 'REVIEW_REQUIRED');

  // Use the production join, not a parallel test-only implementation. Repository
  // identity disambiguates PR numbers, and curated context remains attached.
  const smallRegistry = dataRegistry();
  const failed = normalizePullRequest(withChecks(rawPR(), [check('failure', 'FAILURE')], { state: 'FAILURE' }), observedIdentity, CHECKED);
  const smallSnapshot = { schema: 1, repo: smallRegistry.meta.repo, owner: 'tamird', registryDate: COMMITTED,
    checkedAt: CHECKED, repositories: smallRegistry.meta.repositories, prs: [failed], issues: {} };
  tracker.validateSnapshot(smallSnapshot, smallRegistry);
  const joined = tracker.load(smallRegistry, smallSnapshot);
  const first = joined.find(node => node.repo === 'example/first');
  const second = joined.find(node => node.repo === 'example/second');
  assert.equal(first.group, 'community');
  assert.equal(first.summary, 'Curated source context');
  assert.equal(first.followup.nextAction, 'Finish qualification');
  assert.equal(first.github.head, HEAD);
  assert.equal(first.github.checks.contexts[0].url, failed.checks.contexts[0].url);
  assert.equal(second.github, undefined);
  assert.ok(tracker.attentionReasons(first, 'tamird').some(reason => reason.id === 'author-public-checks'));

  const branchMoved = approval(rawPR());
  branchMoved.headRef.target.oid = NEXT;
  const mismatched = normalizePullRequest(branchMoved, observedIdentity, CHECKED);
  const mismatchNode = tracker.load(smallRegistry, { ...smallSnapshot, prs: [mismatched] })
    .find(node => node.repo === observedIdentity.repo);
  assert.equal(mismatchNode.github.head, HEAD);
  assert.equal(mismatchNode.github.branchHead, NEXT);
  const mismatchActions = tracker.attentionReasons(mismatchNode, 'tamird');
  assert.ok(mismatchActions.some(reason => reason.id === 'agent-refresh'));
  assert.ok(!mismatchActions.some(reason => reason.id === 'maintainer-merge'));

  const threadRaw = rawPR();
  const human = { id: 'human', url: threadRaw.url + '#discussion_r1', body: 'Please type this return',
    createdAt: COMMITTED, updatedAt: COMMITTED, author: { login: 'maintainer', __typename: 'User' } };
  threadRaw.reviewThreads = { ...forward([{ id: 'thread', isResolved: false, isOutdated: false, path: 'defs.bzl', line: 1,
    comments: backward([human, { ...human, id: 'reply', author: { login: 'tamird', __typename: 'User' }, body: 'Updated' }]) }]), totalCount: 1 };
  const threaded = normalizePullRequest(threadRaw, observedIdentity, CHECKED);
  assert.equal(threaded.threads.unresolved, 1, 'An author reply does not resolve a provider thread');
  threadRaw.reviewThreads.nodes[0].isResolved = true;
  assert.equal(normalizePullRequest(threadRaw, observedIdentity, CHECKED).threads.unresolved, 0);

  const rechecked = tracker.recheck(approved, { head: NEXT, headRepo: approved.headRepo, ref: approved.ref, base: BASE,
    state: 'UNKNOWN', status: 'open', checkedAt: '2026-11-20T04:00:00Z' });
  assert.equal(rechecked.checks, null);
  assert.equal(rechecked.reviewDecision, null);
  assert.equal(rechecked.revisionChanged, true);
  const recheckedNode = tracker.load(smallRegistry, { ...smallSnapshot, prs: [rechecked] }).find(node => node.repo === observedIdentity.repo);
  assert.ok(tracker.attentionReasons(recheckedNode, 'tamird').some(reason => reason.id === 'agent-refresh'));

  // A capture is finite and cannot return mixed-head metadata after a source push.
  const oneRegistry = { ...smallRegistry, nodes: smallRegistry.nodes.slice(0, 1) };
  let requests = 0;
  const capture = await collectObservations(oneRegistry, async query => {
    requests++;
    assert.ok(query.startsWith('query { '));
    return { p0: { pullRequest: rawPR() } };
  }, () => CHECKED);
  assert.equal(requests, 2);
  const merged = rawPR();
  merged.state = 'MERGED';
  merged.mergedAt = '2026-11-19T14:00:00Z';
  merged.mergeCommit = { oid: NEXT };
  merged.baseRef.target.oid = NEXT;
  const mergedCapture = await collectObservations(oneRegistry,
    async () => ({ p0: { pullRequest: merged } }), () => CHECKED);
  assert.equal(mergedCapture.prs[0].base, BASE, 'Merged PR history keeps its original base; verification checks the separately observed live ref');
  assert.equal(capture.prs[0].checkedAt, CHECKED);
  validateObservations(capture, oneRegistry);
  requests = 0;
  await assert.rejects(collectObservations(oneRegistry, async () => {
    const raw = rawPR();
    if (++requests === 2) raw.headRefOid = NEXT;
    return { p0: { pullRequest: raw } };
  }, () => CHECKED), /refs changed/);
  const tooMany = { ...oneRegistry, nodes: Array.from({ length: REQUEST_LIMIT / 2 * BATCH_SIZE + 1 }, (_, index) =>
    ({ type: 'pr', repo: observedIdentity.repo, number: index + 1 })) };
  await assert.rejects(collectObservations(tooMany, async () => { throw new Error('must not query'); }), /exceeds/);
  assert.equal(registeredPRs(smallRegistry).length, 2);

  const directory = mkdtempSync(join(process.env.TEST_TMPDIR, 'github-observations-'));
  try {
    const target = join(directory, 'observations.json');
    const temporary = `${target}.${process.pid}.tmp`;
    writeFileSync(target, 'previous observations');
    writeFileSync(temporary, 'another operation');
    assert.throws(() => saveObservations(target, capture), { code: 'EEXIST' });
    assert.equal(readFileSync(target, 'utf8'), 'previous observations');
    assert.equal(readFileSync(temporary, 'utf8'), 'another operation');
    unlinkSync(temporary);
    saveObservations(target, capture);
    assert.deepEqual(JSON.parse(readFileSync(target, 'utf8')), capture);
    assert.equal(existsSync(temporary), false);
  } finally {
    rmSync(directory, { recursive: true });
  }

  // Restore the production fixture for the rest of the canonical work-map test.
  tracker.load(registry, snapshot);
}
