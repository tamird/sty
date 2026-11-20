// Adapted from tamird/gvisor 525e2ecb17b15d2022481fc391271c25a44bbc4b:
// update-status.py CHECKS/FIELDS, feedback, current_check_attempts, mergeability_fields,
// normalize; work_states.py effective_approval/with_review_decision. No outreach or import policy.
import { openSync, closeSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';

export const PROVIDER_SOURCE = 'https://github.com/tamird/gvisor/blob/525e2ecb17b15d2022481fc391271c25a44bbc4b/update-status.py';
export const BATCH_SIZE = 8;
export const REQUEST_LIMIT = 16;

const OID = /^[a-f0-9]{40}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const dated = value => typeof value === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const publicURL = value => value?.startsWith('https://') ? value : null;
const identity = item => `${item.repo}#${item.number}`;

export const PR_FIELDS = `
number title url state isDraft headRefName headRefOid headRef { name target { oid } }
baseRefOid baseRef { name target { oid } } updatedAt createdAt mergedAt closedAt mergeCommit { oid }
headRepository { nameWithOwner owner { login } } repository { nameWithOwner isPrivate }
author { login } reviewDecision mergeable mergeStateStatus
headHistory:timelineItems(last:1,itemTypes:[HEAD_REF_FORCE_PUSHED_EVENT]) {
  nodes { ... on HeadRefForcePushedEvent { createdAt beforeCommit { oid } afterCommit { oid } } }
}
labels(first:100) { nodes { name } pageInfo { hasNextPage } }
comments(last:100) { pageInfo { hasPreviousPage } nodes {
  id url body createdAt updatedAt author { login __typename }
} }
reviews(last:100) { pageInfo { hasPreviousPage } nodes {
  id url body state submittedAt updatedAt authorAssociation author { login __typename } commit { oid }
} }
reviewDismissals:timelineItems(last:100,itemTypes:[REVIEW_DISMISSED_EVENT]) {
  pageInfo { hasPreviousPage }
  nodes { ... on ReviewDismissedEvent { id createdAt previousReviewState review { id } } }
}
reviewRequests(first:100) { pageInfo { hasNextPage } nodes { asCodeOwner requestedReviewer {
  __typename ... on User { login } ... on Team { name slug }
} } }
reviewThreads(first:100) { totalCount pageInfo { hasNextPage } nodes {
  id isResolved isOutdated path line
  comments(last:100) { pageInfo { hasPreviousPage } nodes {
    id url body createdAt updatedAt author { login __typename }
  } }
} }
commits(last:1) { nodes { commit { oid committedDate statusCheckRollup {
  state contexts(first:100) { totalCount pageInfo { hasNextPage } nodes { __typename
    ... on CheckRun { id name status conclusion detailsUrl checkSuite {
      app { id name slug } workflowRun { runNumber runAttempt workflow { id name } }
    } }
    ... on StatusContext { id context state targetUrl description }
  } }
} } } }
`;

export function registeredPRs(registry) {
  const rows = registry.nodes.filter(node => node.type === 'pr').map(({ repo, number }) => ({ repo, number }));
  requireValue(rows.every(row => REPO.test(row.repo) && Number.isSafeInteger(row.number) && row.number > 0), 'Invalid registered PR identity');
  requireValue(new Set(rows.map(identity)).size === rows.length, 'Duplicate registered PR identity');
  requireValue(rows.every(row => registry.meta.repositories[row.repo] === 'none'), 'Collector supports explicit direct-review repositories only');
  return rows.sort((a, b) => a.repo.localeCompare(b.repo) || a.number - b.number);
}

export function queryPRs(rows, verify = false) {
  const fields = verify ? 'number repository { nameWithOwner isPrivate } headRefOid headRef { name target { oid } } baseRef { target { oid } }' : PR_FIELDS;
  return 'query { ' + rows.map(({ repo, number }, index) => {
    requireValue(REPO.test(repo) && Number.isSafeInteger(number) && number > 0, 'Invalid query identity');
    const [owner, name] = repo.split('/');
    return `p${index}:repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name)}) { pullRequest(number:${number}) { ${fields} } }`;
  }).join('\n') + ' }';
}

function connection(value, pageFlag, counted = false) {
  requireValue(value && Array.isArray(value.nodes) && value.nodes.every(Boolean)
    && typeof value.pageInfo?.[pageFlag] === 'boolean', 'Missing provider connection or pagination');
  if (counted) requireValue(Number.isSafeInteger(value.totalCount) && value.totalCount >= value.nodes.length
    && (value.pageInfo[pageFlag] || value.totalCount === value.nodes.length), 'Inconsistent provider connection count');
  return !value.pageInfo[pageFlag];
}

export function currentCheckAttempts(contexts) {
  const ranks = new Map();
  const identifiers = contexts.map(check => {
    const key = [check.appId, check.workflowId, check.name];
    const rank = [check.runNumber, check.runAttempt];
    if (check.kind !== 'check-run' || !key.every(value => typeof value === 'string' && value)
      || !rank.every(value => Number.isSafeInteger(value) && value > 0)) return null;
    const id = JSON.stringify(key), previous = ranks.get(id);
    if (!previous || rank[0] > previous[0] || rank[0] === previous[0] && rank[1] > previous[1]) ranks.set(id, rank);
    return { id, rank };
  });
  const current = [], superseded = [];
  contexts.forEach((check, index) => {
    const value = identifiers[index], latest = value && ranks.get(value.id);
    const older = value && (value.rank[0] < latest[0] || value.rank[0] === latest[0] && value.rank[1] < latest[1]);
    (older ? superseded : current).push(check);
  });
  return { current, superseded };
}

function normalizeChecks(commit) {
  requireValue(Object.hasOwn(commit, 'statusCheckRollup'), 'Missing exact-head check rollup');
  const rollup = commit.statusCheckRollup;
  if (rollup === null) return { state: null, total: 0, reportedTotal: 0, complete: true, contexts: [], supersededContexts: [] };
  requireValue(typeof rollup.state === 'string' && rollup.state, 'Missing provider check aggregate');
  const complete = connection(rollup.contexts, 'hasNextPage', true);
  const contexts = rollup.contexts.nodes.map(item => {
    requireValue(typeof item.id === 'string' && item.id, 'Missing provider check identity');
    requireValue(typeof (item.name ?? item.context) === 'string' && (item.name ?? item.context), 'Missing provider check name');
    if (item.__typename === 'CheckRun') {
      requireValue(typeof item.status === 'string' && item.status, 'Missing provider check state');
      const app = item.checkSuite?.app, run = item.checkSuite?.workflowRun, workflow = run?.workflow;
      const check = { id: item.id, name: item.name, state: (item.status === 'COMPLETED' ? item.conclusion : item.status) || 'UNKNOWN',
        url: publicURL(item.detailsUrl), kind: 'check-run', app: app?.name ?? null, appSlug: app?.slug ?? null,
        appId: app?.id ?? null, workflow: workflow?.name ?? null, workflowId: workflow?.id ?? null,
        runNumber: run?.runNumber ?? null, runAttempt: run?.runAttempt ?? null };
      check.purpose = check.appSlug === 'github-actions' && check.workflow === 'Auto Assign' && check.name === 'assign'
        ? 'reviewer-assignment' : 'validation';
      return check;
    }
    requireValue(item.__typename === 'StatusContext', 'Unknown provider check type');
    requireValue(typeof item.state === 'string' && item.state, 'Missing provider status state');
    return { id: item.id, name: item.context, state: item.state, url: publicURL(item.targetUrl),
      description: item.description, app: null, kind: 'status', purpose: 'validation' };
  });
  const { current, superseded } = currentCheckAttempts(contexts);
  return { state: rollup.state, total: rollup.contexts.totalCount - superseded.length,
    reportedTotal: rollup.contexts.totalCount, complete, contexts: current, supersededContexts: superseded };
}

function effectiveApproval(pr) {
  if (pr.githubReviewDecision !== 'APPROVED' || !pr.reviewsComplete || !pr.reviewRequestsComplete || !pr.headHistoryComplete) return null;
  const cutoffs = [pr.headCommittedAt, pr.headIntroducedAt].filter(value => value !== null);
  if (!cutoffs.length || !cutoffs.every(dated)) return null;
  const latest = new Map();
  for (const item of pr.feedback.items) {
    if (item.kind !== 'review' || !item.author?.login || !dated(item.submittedAt)
      || !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(item.state)) continue;
    if (!latest.has(item.author.login) || Date.parse(item.submittedAt) > Date.parse(latest.get(item.author.login).submittedAt)) latest.set(item.author.login, item);
  }
  const requested = new Set(pr.reviewRequests.map(item => item.login).filter(Boolean));
  return [...latest.values()].filter(item => item.state === 'APPROVED' && item.commit?.oid === pr.head
    && item.author.__typename === 'User' && item.author.login !== pr.authorLogin
    && !requested.has(item.author.login)
    && Date.parse(item.submittedAt) >= Math.max(...cutoffs.map(Date.parse)))
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0] ?? null;
}

export function normalizePullRequest(raw, expected, checkedAt) {
  requireValue(dated(checkedAt), 'Invalid provider observation time');
  requireValue(raw?.repository?.nameWithOwner === expected.repo && raw.repository.isPrivate === false && raw.number === expected.number
    && raw.url === `https://github.com/${expected.repo}/pull/${expected.number}`, 'Provider PR identity changed');
  requireValue(OID.test(raw.headRefOid) && OID.test(raw.baseRefOid), 'Missing provider revision');
  const commits = raw.commits?.nodes;
  requireValue(Array.isArray(commits) && commits.length === 1 && commits[0]?.commit?.oid === raw.headRefOid, 'PR head changed during retrieval');
  const commit = commits[0].commit;
  requireValue(dated(commit.committedDate) && dated(raw.createdAt) && dated(raw.updatedAt), 'Missing provider dates');
  requireValue(['OPEN', 'CLOSED', 'MERGED'].includes(raw.state) && typeof raw.isDraft === 'boolean'
    && ['MERGEABLE', 'CONFLICTING', 'UNKNOWN'].includes(raw.mergeable), 'Missing provider PR state');
  if (raw.headRef !== null) requireValue(raw.headRef?.name === raw.headRefName && OID.test(raw.headRef.target?.oid), 'Invalid provider source ref');
  if (raw.baseRef !== null) requireValue(OID.test(raw.baseRef?.target?.oid), 'Invalid provider base ref');
  requireValue(Array.isArray(raw.headHistory?.nodes), 'Missing source head introduction history');
  const labelsComplete = connection(raw.labels, 'hasNextPage');
  const commentsComplete = connection(raw.comments, 'hasPreviousPage');
  const reviewsComplete = connection(raw.reviews, 'hasPreviousPage');
  const reviewRequestsComplete = connection(raw.reviewRequests, 'hasNextPage');
  const threadsComplete = connection(raw.reviewThreads, 'hasNextPage', true);
  const dismissalsComplete = connection(raw.reviewDismissals, 'hasPreviousPage');
  let feedbackComplete = commentsComplete && reviewsComplete && threadsComplete;
  const feedback = [...raw.comments.nodes.map(item => ({ kind: 'comment', ...item })),
    ...raw.reviews.nodes.map(item => ({ kind: 'review', ...item }))];
  for (const thread of raw.reviewThreads.nodes) {
    feedbackComplete = connection(thread.comments, 'hasPreviousPage') && feedbackComplete;
    requireValue(typeof thread.isResolved === 'boolean' && typeof thread.isOutdated === 'boolean', 'Missing review thread state');
    feedback.push(...thread.comments.nodes.map(item => ({ kind: 'inline', threadId: thread.id, isResolved: thread.isResolved,
      isOutdated: thread.isOutdated, path: thread.path, line: thread.line, ...item })));
  }
  const introductions = raw.headHistory.nodes.filter(event => event.afterCommit?.oid === raw.headRefOid);
  requireValue(introductions.every(event => dated(event.createdAt)), 'Invalid source head introduction time');
  const pr = {
    repo: expected.repo, number: expected.number, title: raw.title, url: raw.url,
    status: raw.state === 'OPEN' && raw.isDraft ? 'draft' : raw.state.toLowerCase(),
    ref: raw.headRefName, head: raw.headRefOid, branchHead: raw.headRef?.target.oid ?? null,
    base: raw.state === 'OPEN' ? raw.baseRef?.target.oid ?? null : raw.baseRefOid,
    mergeable: raw.mergeable, mergeState: raw.mergeStateStatus, mergeabilityCheckedAt: checkedAt,
    headCommittedAt: commit.committedDate, headHistoryComplete: true,
    headIntroducedAt: introductions.map(event => event.createdAt).sort().at(-1) ?? null,
    headRebasedFrom: introductions[0]?.beforeCommit?.oid ?? null,
    headOwner: raw.headRepository?.owner.login ?? null, headRepo: raw.headRepository?.nameWithOwner ?? null,
    authorLogin: raw.author?.login ?? null, createdAt: raw.createdAt, updatedAt: raw.updatedAt,
    mergedAt: raw.mergedAt, closedAt: raw.closedAt, mergeCommit: raw.mergeCommit?.oid ?? null,
    githubReviewDecision: raw.reviewDecision, reviewsComplete, commentsComplete, reviewRequestsComplete,
    reviewDismissals: { complete: dismissalsComplete, items: raw.reviewDismissals.nodes },
    reviewRequests: raw.reviewRequests.nodes.map(item => item.requestedReviewer).filter(Boolean),
    codeOwnerRequests: raw.reviewRequests.nodes.filter(item => item.asCodeOwner && item.requestedReviewer?.login).map(item => item.requestedReviewer.login),
    labels: raw.labels.nodes.map(item => item.name), labelsComplete,
    threads: { total: raw.reviewThreads.totalCount, unresolved: raw.reviewThreads.nodes.filter(item => !item.isResolved).length, complete: threadsComplete },
    feedback: { complete: feedbackComplete, items: feedback }, checks: normalizeChecks(commit),
    importPolicy: 'none', imports: [], importsComplete: true, checkedAt,
  };
  const approval = effectiveApproval(pr);
  return { ...pr, reviewDecision: pr.githubReviewDecision === 'APPROVED' && !approval ? 'REVIEW_REQUIRED' : pr.githubReviewDecision,
    approvedHead: approval ? pr.head : null, approvedAt: approval?.submittedAt ?? null };
}

export function validateObservations(observations, registry) {
  requireValue(observations?.schema === 1 && observations.repo === registry.meta.repo && observations.owner === registry.meta.owner
    && Array.isArray(observations.prs), 'Invalid saved GitHub observations');
  requireValue(observations.checkedAt === null ? observations.prs.length === 0 : dated(observations.checkedAt), 'Invalid saved observation date');
  const registered = new Set(registeredPRs(registry).map(identity)), seen = new Set();
  for (const pr of observations.prs) {
    const key = identity(pr);
    requireValue(registered.has(key) && !seen.has(key) && pr.url === `https://github.com/${pr.repo}/pull/${pr.number}`
      && OID.test(pr.head) && dated(pr.checkedAt) && Date.parse(pr.checkedAt) <= Date.parse(observations.checkedAt), 'Invalid saved PR observation identity');
    requireValue(pr.importPolicy === 'none' && Array.isArray(pr.imports) && pr.imports.length === 0, 'Invalid saved direct-review policy');
    seen.add(key);
  }
  return observations;
}

export async function collectObservations(registry, graphql, now = () => new Date().toISOString()) {
  const rows = registeredPRs(registry), batches = [];
  for (let start = 0; start < rows.length; start += BATCH_SIZE) batches.push(rows.slice(start, start + BATCH_SIZE));
  requireValue(batches.length * 2 <= REQUEST_LIMIT, `Registered PR capture exceeds ${REQUEST_LIMIT} requests`);
  const prs = [], capturedRefs = new Map();
  for (const batch of batches) {
    const data = await graphql(queryPRs(batch));
    const checkedAt = now();
    batch.forEach((expected, index) => {
      const raw = data[`p${index}`]?.pullRequest;
      prs.push(normalizePullRequest(raw, expected, checkedAt));
      capturedRefs.set(identity(expected), { branch: raw.headRef?.target.oid ?? null, base: raw.baseRef?.target.oid ?? null });
    });
  }
  // Confirm source and base refs after the bounded capture, without reusing a different
  // revision's check/review result if the source moved while another batch was read.
  for (const batch of batches) {
    const data = await graphql(queryPRs(batch, true));
    batch.forEach((expected, index) => {
      const raw = data[`p${index}`]?.pullRequest, pr = prs.find(item => identity(item) === identity(expected));
      const captured = capturedRefs.get(identity(expected));
      requireValue(raw?.repository?.nameWithOwner === expected.repo && raw.repository.isPrivate === false && raw.number === expected.number
        && raw.headRefOid === pr.head && (raw.headRef?.target.oid ?? null) === captured.branch
        && (raw.baseRef?.target.oid ?? null) === captured.base, 'PR refs changed during capture; previous observations preserved');
    });
  }
  return validateObservations({ schema: 1, repo: registry.meta.repo, owner: registry.meta.owner,
    source: PROVIDER_SOURCE, checkedAt: now(), prs }, registry);
}

export function saveObservations(target, observations) {
  const temporary = `${target}.${process.pid}.tmp`;
  const descriptor = openSync(temporary, 'wx');
  try {
    try {
      writeFileSync(descriptor, JSON.stringify(observations, null, 2) + '\n');
    } finally {
      closeSync(descriptor);
    }
    renameSync(temporary, target);
  } finally {
    try { unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
