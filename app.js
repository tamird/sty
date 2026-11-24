"use strict";

const $ = (id) => document.getElementById(id);
const SVG = "http://www.w3.org/2000/svg";
const CACHE_KEY = "sty-work-map-attributes-v1";
const UI_KEY = "sty-work-map-view-v1";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const VIEWS = ["dag", "table", "investigations"];
const SORT_KEYS = ["number", "title", "impact", "direct", "age", "review", "checks", "group"];
const STATE_LABELS = { "author-feedback": "Agent: review follow-up", "contributor-review": "Contributor review", "maintainer-review": "Maintainer review", "proposed-update": "Prepared proposals", "changes-requested": "Changes requested",
  "awaiting-import": "Awaiting public export", importing: "Import PR open", "waiting-merge": "Waiting for merge", failing: "Failing checks",
  "checks-pending": "Checks pending", "waiting-release": "Waiting for an upstream release", conflicts: "Conflicts", draft: "Draft", imported: "Imported", merged: "Merged", closed: "Closed" };
const FILTER_STATES = ["author-feedback", "contributor-review", "maintainer-review", "proposed-update", "awaiting-import", "importing", "waiting-merge", "waiting-release", "failing", "changes-requested", "checks-pending", "conflicts", "draft"];
const FAILURE_STATES = new Set(["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED", "STALE"]);
let stateFilters = new Set(), reasonFilters = new Set();
let tableGrouping = false, visibleTableGroups = [];
const STALE_AGE = 2 * 60 * 60 * 1000;
const CARD = { width: 216, height: 70, column: 264, row: 84 };
const READABLE_SCALE = .9;
let registry, model, selected = null, focus = null, view = "table";
let sortKey = "impact", sortDirection = -1;
let camera = { x: 20, y: 20, scale: 1 }, bounds = { width: 900, height: 600, positions: new Map() };
let refreshing = false, lastAttempt = 0, refreshTimer, moved = false;
let liveSnapshot = null, conflictRequest = false, lastConflictAttempt = 0;
const conflictResults = new Map();
let lastNavigationURL = null, searchEditing = false, initializing = true;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeURL(value) {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; }
  catch { return null; }
}
function citationURL(value) {
  return safeURL(value) || "#";
}

function link(text, url, className) {
  const node = element("a", className, text);
  node.href = citationURL(url);
  node.target = "_blank";
  node.rel = "noopener noreferrer";
  return node;
}
function button(text, action, className) {
  const node = element("button", className, text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}
const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
function date(value) {
  const when = new Date(value);
  return Number.isNaN(when.getTime()) ? when.toString() : dateFormat.format(when);
}
function prRepo(pr, data = registry) { return pr.repo || data.meta.repo; }
function prIdentity(pr, data = registry) {
  const repo = prRepo(pr, data);
  return repo === data.meta.repo ? `pr:${pr.number}` : `pr:${repo}:${pr.number}`;
}
function repositoryPolicies(data) { return data.meta.repositories || { [data.meta.repo]: "copybara" }; }
function usesImports(pr) { return pr.importPolicy !== "none"; }
function registryNodes(data) {
  const nodes = [...data.nodes, ...(data.investigations || []).filter(item => item.group).map(item => ({ ...item,
    type: "investigation", url: `https://tamird.github.io/sty/?view=investigations#${encodeURIComponent(item.id)}` }))];
  const issues = new Set(nodes.filter(node => node.type === "issue").map(node => node.url));
  for (const card of [...data.nodes, ...(data.investigations || [])]) {
    for (const receipt of card.settledReviews || []) {
      if (receipt.kind !== "issue" || !["approved", "posted"].includes(receipt.outcome) || issues.has(receipt.postedURL)) continue;
      const match = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/issues\/([1-9]\d*)$/.exec(receipt.postedURL);
      if (!match) continue;
      const [, repo, number] = match;
      nodes.push({ id: `issue:${repo}:${number}`, type: "issue", repo, number: Number(number),
        title: receipt.title || `${repo}#${number}`, group: card.group || "new",
        status: "Tracked", url: receipt.postedURL, summary: receipt.summary });
      issues.add(receipt.postedURL);
    }
  }
  return nodes;
}
function label(node) {
  if (node.type === "pr") return `${node.repo && node.repo !== registry?.meta?.repo ? node.repo.split("/")[1] + " " : ""}#${node.number}`;
  if (node.type === "investigation") return "INVESTIGATION";
  if (node.type === "branch") return "BRANCH";
  if (node.type === "commit") return "UPSTREAM";
  return node.number ? `ISSUE #${node.number}` : "CAPACITY";
}
function status(node) {
  if (node.type === "issue" && node.githubState) {
    if (humanAction(node)) return `Issue ${node.githubState} · human submission pending`;
    const reason = node.githubStateReason?.toLowerCase().replaceAll("_", " ");
    return `Issue ${node.githubState}${reason ? ` · ${reason}` : ""}${node.unavailable ? " · refresh unavailable" : ""}`;
  }
  return ({ branch: "Working branch", "deployment-pending": "Deployment pending", unavailable: "Unavailable" })[node.status] || node.status;
}
function maintainerReview(pr, item) {
  const login = item.author?.login?.toLowerCase();
  return item.author?.__typename === "User" && !!login && login !== (pr.authorLogin || pr.headOwner || "").toLowerCase()
    && pr.maintainerReviewers?.includes(login) === true;
}
function effectiveReviewDecision(pr) {
  if (pr?.reviewDecision !== "APPROVED") return pr?.reviewDecision;
  // Reassociation or editing a review does not make its submission fresh.
  // Older cached snapshots without this proof stay readable, but not ready.
  const timestamp = value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
  const cutoffs = [pr.headCommittedAt, pr.headIntroducedAt].filter(value => value != null).map(timestamp);
  const submitted = timestamp(pr.approvedAt);
  return pr.headHistoryComplete === true && pr.approvedHead === pr.head && cutoffs.length && cutoffs.every(Number.isFinite)
    && Number.isFinite(submitted) && submitted >= Math.max(...cutoffs)
    && ((pr.repo || "google/gvisor") !== "google/gvisor" || currentHeadApproval(pr, pr.approvedAt)) ? "APPROVED" : "REVIEW_REQUIRED";
}
function currentHeadApproval(pr, approvedAt) {
  if (!pr.reviewsComplete || !pr.reviewRequestsComplete || !pr.headHistoryComplete) return false;
  const timestamp = value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
  const cutoffs = [pr.headCommittedAt, pr.headIntroducedAt].filter(value => value != null).map(timestamp);
  if (!cutoffs.length || !cutoffs.every(Number.isFinite)) return false;
  const latest = new Map();
  for (const item of pr.feedback?.items || []) {
    const author = item.author?.login;
    if (item.kind !== "review" || !author || !item.submittedAt || !["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(item.state)) continue;
    if (!latest.has(author) || item.submittedAt > latest.get(author).submittedAt) latest.set(author, item);
  }
  return [...latest.values()].some(item => item.author?.__typename === "User"
    && item.author.login !== (pr.authorLogin || pr.headOwner)
    && ((pr.repo || "google/gvisor") === "google/gvisor" ? maintainerReview(pr, item)
      : ["MEMBER", "OWNER", "COLLABORATOR"].includes(item.authorAssociation))
    && (!approvedAt || item.submittedAt === approvedAt && !pr.reviewRequests?.some(r => r.login === item.author.login))
    && item.state === "APPROVED" && item.commit?.oid === pr.head
    && timestamp(item.submittedAt) >= Math.max(...cutoffs));
}
function approvedPatch(node) {
  const pr = node?.github, proof = node?.approvedPatch;
  if (!pr || !proof || (pr.repo || node.repo) !== "google/gvisor" || pr.revisionChanged || proof.head !== pr.head
      || proof.head === proof.approvedHead || !["stable-patch-id", "reviewed-context-only"].includes(proof.method)
      || ![proof.head, proof.approvedHead, proof.oldPatchId, proof.newPatchId].every(value => /^[a-f0-9]{40}$/.test(value))
      || proof.method === "stable-patch-id" && proof.oldPatchId !== proof.newPatchId
      || (pr.githubReviewDecision || pr.reviewDecision) === "CHANGES_REQUESTED"
      || pr.reviewsComplete !== true || pr.reviewRequestsComplete !== true || pr.feedback?.complete !== true
      || pr.threads?.complete !== true || pr.threads.unresolved !== 0) return null;
  const timestamp = value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
  const verified = timestamp(proof.verifiedAt), submitted = timestamp(proof.submittedAt);
  if (!Number.isFinite(verified) || !Number.isFinite(submitted) || verified < submitted) return null;
  const approval = pr.feedback.items.find(item => item.kind === "review" && item.id === proof.reviewId);
  if (!approval || !maintainerReview(pr, approval) || approval.state !== "APPROVED" || ![proof.approvedHead, proof.head].includes(approval.commit?.oid)
      || approval.submittedAt !== proof.submittedAt
      || approval.author?.login !== proof.reviewer || pr.reviewRequests.some(item => item.login === proof.reviewer)) return null;
  for (const item of pr.feedback.items) {
    if (item.author?.login === pr.headOwner) continue;
    const at = timestamp(item.submittedAt || item.createdAt), updated = timestamp(item.updatedAt || item.submittedAt || item.createdAt);
    if (!Number.isFinite(at) || !Number.isFinite(updated)) return null;
    if (item.kind === "review" && item.state === "APPROVED" && item.id !== proof.reviewId
        && at > verified && item.commit?.oid === pr.head && !(item.body || "").trim()) continue;
    if (Math.max(at, updated) > verified || item.kind === "review"
        && ["CHANGES_REQUESTED", "DISMISSED"].includes(item.state) && at >= submitted) return null;
  }
  return proof;
}
function landedPatch(node) {
  const pr = node?.github, proof = node?.landedPatch;
  return ["open", "draft"].includes(pr?.status) && !pr.revisionChanged && proof?.head === pr.head
    && (!pr.branchHead || pr.branchHead === pr.head) && proof.method === "merge-tree-identical"
    && [proof.head, proof.upstreamHead, proof.upstreamTree, proof.replayedTree].every(value => /^[a-f0-9]{40}$/.test(value))
    && proof.upstreamTree === proof.replayedTree && /(?:Z|[+-]\d{2}:\d{2})$/.test(proof.verifiedAt) && Number.isFinite(Date.parse(proof.verifiedAt))
    && proof.evidence?.length && proof.evidence.every(safeURL) ? proof : null;
}
function rebaseNeedsComparison(node) {
  const pr = node?.github;
  return pr?.status === "open" && pr.githubReviewDecision === "APPROVED"
    && effectiveReviewDecision(pr) === "REVIEW_REQUIRED" && !approvedPatch(node) && !reviewedExport(node) && !pr.revisionChanged
    && !(node.reapproval?.head === pr.head && node.reapproval.kind === "content-amendment")
    && pr.imports?.some(item => item.sourceHead !== pr.head)
    && pr.feedback?.items?.some(item => item.kind === "review" && item.state === "APPROVED"
      && maintainerReview(pr, item) && item.commit?.oid === pr.head && Date.parse(item.submittedAt) < Date.parse(pr.headIntroducedAt));
}
function reviewInfo(pr, node) {
  if (releaseWait(node)) return { text: pr.releaseVersion === node.releaseWait.checkedVersion ? "Waiting on upstream" : "Check upstream release", tone: "pending", glyph: "○" };
  if (reviewedExport(node)) return { text: "GitHub approved · current source exported", tone: "good", glyph: "✓" };
  if (rebaseNeedsComparison(node)) return { text: "Check rebased patch", tone: "pending", glyph: "○" };
  if (effectiveReviewDecision(pr) !== "APPROVED" && approvedPatch(node))
    return { text: "Approved patch · rebased", tone: "good", glyph: "✓" };

  return ({ APPROVED: { text: "Approved", tone: "good", glyph: "✓" },
    CHANGES_REQUESTED: { text: "Changes requested", tone: "bad", glyph: "!" },
    REVIEW_REQUIRED: { text: "Maintainer review", tone: "pending", glyph: "○" } })[effectiveReviewDecision(pr)]
    || { text: "Not reported", tone: "unknown", glyph: "?" };
}
function completeChecks(pr) {
  const checks = pr?.checks;
  return Boolean(checks?.complete && Array.isArray(checks.contexts) && checks.contexts.length === checks.total
    && (checks.total > 0 || checks.state === null && checks.reportedTotal === 0));
}
function isPrivateBuildkiteCheck(pr, check) {
  return pr.repo === "google/gvisor" && check.kind === "status" && check.name === "buildkite/internal"
    && (!check.url || /^https:\/\/buildkite\.com\/gvisor\/internal\/builds\/\d+$/.test(check.url));
}
function isImportStatus(check) { return check.kind === "status" && ["import/copybara", "feedback/copybara"].includes(check.name); }
function isAdvisoryCheck(pr, check) { return pr?.repo === "google/gvisor" && check.kind === "status" && check.name === "buildkite/first-pass"; }
function isApprovalGate(pr, check) {
  return pr?.repo === "buildbuddy-io/buildbuddy" && check.kind === "status" && check.state === "ERROR"
    && check.description === "Check requires approving review"
    && ["https://app.buildbuddy.io", "https://app.buildbuddy.io/", "https://app.buildbuddy.dev", "https://app.buildbuddy.dev/"].includes(check.url);
}
function canceledValidationCheck(check) {
  if (check.kind === "check-run" && check.state === "CANCELLED") return true;
  const build = /^Build #(\d+) cancel(?:l)?ed by \S.*$/.exec(check.description || "");
  return check.kind === "status" && check.state === "FAILURE" && build
    && check.name.startsWith("buildkite/")
    && check.url === `https://buildkite.com/gvisor/${check.name.slice("buildkite/".length)}/builds/${build[1]}`;
}
function validationChecks(pr) { return (pr?.checks?.contexts || []).filter(check => check.purpose !== "reviewer-assignment" && !isImportStatus(check) && !isApprovalGate(pr, check) && !isAdvisoryCheck(pr, check)); }
function failedValidationChecks(pr) { return validationChecks(pr).filter(check => FAILURE_STATES.has(check.state) && !canceledValidationCheck(check)); }
function codeCheckStates(pr) {
  const result = new Set(validationChecks(pr).filter(check => !canceledValidationCheck(check)).map(check => check.state));
  const aggregate = pr?.checks?.state;
  const administrative = (pr?.checks?.contexts || []).filter(check => check.purpose === "reviewer-assignment" || isImportStatus(check) || isApprovalGate(pr, check) || isAdvisoryCheck(pr, check));
  const explainedChecks = [...administrative, ...validationChecks(pr).filter(canceledValidationCheck), ...(pr?.checks?.supersededContexts || [])];
  const pending = new Set(["PENDING", "QUEUED", "IN_PROGRESS", "WAITING", "REQUESTED"]);
  const explained = completeChecks(pr) && (FAILURE_STATES.has(aggregate) && explainedChecks.some(check => FAILURE_STATES.has(check.state))
    || pending.has(aggregate) && explainedChecks.some(check => pending.has(check.state)));
  if (aggregate && !explained) result.add(aggregate);
  return result;
}
function checkInfo(pr) {
  const checks = pr?.checks;
  if (checks?.total === 0 && completeChecks(pr)) return { text: "No published checks", tone: "unknown", glyph: "—",
    detail: "GitHub returned this revision with no published check runs or status contexts." };
  if (!checks || !checks.total) return { text: "Unavailable", tone: "unknown", glyph: "?", detail: "No visible check rollup for this head; no test result is implied." };
  const states = codeCheckStates(pr), substantive = validationChecks(pr);
  const canceled = substantive.filter(canceledValidationCheck);
  const advisory = checks.contexts.filter(check => isAdvisoryCheck(pr, check));
  const approvalGates = checks.contexts.filter(check => isApprovalGate(pr, check));
  const failed = [...states].some(state => FAILURE_STATES.has(state));
  const pending = [...states].some(state => ["PENDING", "QUEUED", "IN_PROGRESS", "WAITING", "REQUESTED"].includes(state));
  const passed = !canceled.length && !approvalGates.length && completeChecks(pr) && substantive.length > 0
    && (!advisory.length || substantive.some(check => check.state === "SUCCESS"))
    && [...states].every(state => ["SUCCESS", "SKIPPED", "NEUTRAL"].includes(state));
  const assignmentFailures = checks.contexts.filter(check => check.purpose === "reviewer-assignment" && FAILURE_STATES.has(check.state));
  const importProblems = checks.contexts.filter(check => isImportStatus(check) && (FAILURE_STATES.has(check.state) || ["PENDING", "QUEUED", "IN_PROGRESS", "WAITING", "REQUESTED"].includes(check.state)));
  const serviceIssues = [assignmentFailures.length && "assignment", importProblems.length && "import"].filter(Boolean);
  const result = failed ? { text: "Failure", tone: "bad", glyph: "!" } : canceled.length ? { text: "Canceled", tone: "pending", glyph: "○" } : pending ? { text: "Pending", tone: "pending", glyph: "○" }
    : approvalGates.length ? { text: "Approval required", tone: "pending", glyph: "○" }
      : passed ? { text: serviceIssues.length ? `Passed · ${serviceIssues.join(" / ")} issue` : "Success", tone: serviceIssues.length ? "pending" : "good", glyph: serviceIssues.length ? "!" : "✓" }
      : { text: advisory.length && !substantive.length ? "Advisory" : "Unknown", tone: "unknown", glyph: "?" };
  return { ...result, passed, detail: `${substantive.length} current validation check/status contexts${checks.complete ? "" : "; context list incomplete"}. ${canceled.length ? "A validation run was canceled. Its job details are available below. " : ""}${checks.supersededContexts?.length ? `${checks.supersededContexts.length} superseded workflow attempts remain below as history. ` : ""}${assignmentFailures.length ? "Reviewer assignment failed; its raw result remains below and is not a contributor-source failure. " : ""}${importProblems.length ? "Copybara import status needs attention; its raw result remains below and does not establish a public source-test failure. " : ""}${approvalGates.length ? "BuildBuddy requires approving review before these checks run; their raw ERROR statuses remain below. " : ""}${advisory.length ? "First Pass is advisory; its result is not qualification evidence. " : ""}GitHub's aggregate is ${checks.state}. Checks/statuses are not test-case counts.` };
}

function checksPassed(pr) {
  const checks = pr?.checks, contexts = checks?.contexts || [];
  const passed = check => ["SUCCESS", "SKIPPED", "NEUTRAL"].includes(check.state);
  const advisory = contexts.filter(check => isAdvisoryCheck(pr, check));
  const pending = new Set(["PENDING", "QUEUED", "IN_PROGRESS", "WAITING", "REQUESTED"]);
  const explained = advisory.some(check => FAILURE_STATES.has(checks.state) && FAILURE_STATES.has(check.state)
    || pending.has(checks.state) && pending.has(check.state));
  return Boolean(completeChecks(pr) && validationChecks(pr).length
    && (!advisory.length || validationChecks(pr).some(check => check.state === "SUCCESS"))
    && (checks.state === "SUCCESS" || explained)
    && contexts.filter(check => !isAdvisoryCheck(pr, check)).every(passed));
}

const DECISION_REASONS = [
  { id: "review-changes", owner: "user", title: "Review our changes" },
  { id: "post-review", owner: "user", title: "Approve outgoing PR reviews" },
  { id: "post-reply", owner: "user", title: "Approve replies, comments, and issues" },
];
const ATTENTION_REASONS = [
  { id: "agent-review-outreach", owner: "agent", title: "Find or contact a reviewer" },
  { id: "agent-issue-reply", owner: "agent", title: "Follow up on an issue we filed" },
  { id: "agent-review-reply", owner: "agent", title: "Follow up on a review we gave" },
  { id: "agent-requested-review", owner: "agent", title: "Incoming PR review requests" },
  { id: "agent-feedback-sweep", owner: "agent", title: "Audit earlier work against contributor guidance" },
  { id: "agent-import-comparison", owner: "agent", title: "Compare source with merged export" },
  { id: "author-conflicts", owner: "agent", title: "Merge conflicts" },
  { id: "agent-import-conflict", owner: "agent", title: "Investigate Copybara export conflict" },
  { id: "author-ci-remedy", owner: "agent", title: "Merged CI fix needs action" },
  { id: "author-public-checks", owner: "agent", title: "Public source checks failing" },
  { id: "maintainer-import-checks", owner: "agent", title: "Public import checks failing" },
  { id: "author-feedback", owner: "agent", title: "Review feedback to address" },
  { id: "agent-branch-work", owner: "agent", title: "Branch implementation and validation" },
  { id: "agent-default-branch-check", owner: "agent", title: "Default-branch CI investigations" },
  { id: "agent-ci-flake", owner: "agent", title: "CI flake investigations" },
  { id: "agent-release-check", owner: "agent", title: "Check an upstream release" },
  { id: "agent-release-opportunity", owner: "agent", title: "Inspect a newer BCR release", secondary: true },
  { id: "upstream-release", owner: "agent", title: "Waiting for an upstream release" },
  { id: "agent-rebase-check", owner: "agent", title: "Compare rebased patch" },
  { id: "agent-recorded-followup", owner: "agent", title: "Recorded next action" },
  { id: "agent-refresh", owner: "agent", title: "Public status refresh needed" },
  ...DECISION_REASONS,
  { id: "human-submission", owner: "user", title: "Human-only submissions" },
  { id: "maintainer-import-refresh", owner: "maintainer", title: "Refresh earlier export" },
  { id: "maintainer-reapproval", owner: "maintainer", title: "Reapprove current source PR" },
  { id: "maintainer-ci-retry", owner: "maintainer", title: "CI configuration or retry" },
  { id: "maintainer-ci-canceled", owner: "maintainer", title: "CI canceled" },
  { id: "maintainer-ci-infrastructure", owner: "maintainer", title: "CI infrastructure retry" },
  { id: "maintainer-reimport", owner: "maintainer", title: "Closed import needs another attempt" },
  { id: "maintainer-import-landed", owner: "maintainer", title: "Reconcile merged export" },
  { id: "maintainer-import-previous", owner: "maintainer", title: "Waiting for earlier export to merge" },
  { id: "maintainer-import-failed", owner: "maintainer", title: "Import failed" },
  { id: "maintainer-internal-feedback", owner: "maintainer", title: "Import checks failing" },
  { id: "maintainer-triaged", owner: "maintainer", title: "Awaiting maintainer follow-up" },
  { id: "maintainer-response", owner: "maintainer", title: "Review follow-up" },
  { id: "maintainer-review", owner: "maintainer", title: "Maintainer review" },
  { id: "maintainer-import-label", owner: "maintainer", title: "Needs import label" },
  { id: "maintainer-import", owner: "maintainer", title: "Ready for import" },
  { id: "maintainer-merge", owner: "maintainer", title: "Waiting for merge" },
  { id: "maintainer-assignment", owner: "maintainer", title: "Reviewer assignment" },
  { id: "maintainer-unknown", owner: "maintainer", title: "Public export pending or draft" },
  { id: "landed-source-open", owner: "other", title: "Landed; source PR still open" },
];
const OTHER_ATTENTION_GROUPS = [
  { id: "draft", owner: "other", title: "Draft PRs" },
  { id: "resolved", owner: "other", title: "History · no current action" },
  { id: "other", owner: "other", title: "Other work" },
];
const ATTENTION_OWNERS = { agent: "Agent work", user: "Needs your attention", maintainer: "Needs maintainer attention", other: "Other tracked work" };
const QUEUE_FILTERS = Object.keys(ATTENTION_OWNERS).map(owner => "queue-" + owner);
const LEGACY_HANDOFF_GROUPS = { "import-failed": "maintainer-import-failed", "import-checks": "maintainer-import-checks", "internal-status": "maintainer-unknown", review: "maintainer-review", import: "maintainer-import", merge: "maintainer-merge" };
let handoffCopyVersion = 0;
function handoffTimestamp(value) {
  return Number.isFinite(Date.parse(value)) ? `${new Date(value).toISOString().slice(0, 16).replace("T", " ")} UTC` : null;
}
function reviewAttention(pr, owner) {
  const items = Array.isArray(pr.feedback?.items) ? pr.feedback.items : [];
  const complete = pr.reviewsComplete === true && pr.threads?.complete === true && pr.feedback?.complete === true && Array.isArray(pr.feedback.items);
  const threads = new Map();
  for (const item of items) if (item.kind === "inline") {
    if (!threads.has(item.threadId)) threads.set(item.threadId, []);
    threads.get(item.threadId).push(item);
  }
  const unanswered = [], decision = effectiveReviewDecision(pr);
  const advisoryApprovers = new Set();
  if (complete && pr.repo === "google/gvisor" && decision === "REVIEW_REQUIRED" && Array.isArray(pr.maintainerReviewers)) {
    for (const item of items) if (item.kind === "review" && item.state === "APPROVED" && item.author?.__typename === "User" && !maintainerReview(pr, item))
      advisoryApprovers.add(item.author.login);
  }
  let response = false, unknown = !complete;
  for (const comments of threads.values()) {
    comments.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    const latest = comments.at(-1);
    if (latest.isResolved) continue;
    // A newer head or an outdated location does not answer a finding.
    if (latest.author?.login === owner) {
      // An answered suggestion from an advisory approver may stay unresolved
      // on GitHub. Only a maintainer can supply the outstanding approval.
      const reviewers = comments.filter(item => item.author?.login !== owner);
      if (!reviewers.length || reviewers.some(item => !advisoryApprovers.has(item.author?.login))) response = true;
    } else if (latest.author?.login) unanswered.push(latest);
    else unknown = true;
  }
  if (decision === "CHANGES_REQUESTED" && !unanswered.length && !response) {
    const requests = items.filter(item => item.kind === "review" && item.state === "CHANGES_REQUESTED" && item.author?.login !== owner);
    response = Boolean(threads.size && pr.threads.unresolved === 0
      || requests.length && requests.every(item => item.commit?.oid && item.commit.oid !== pr.head));
    // A review-level hold does not identify an author code change. Its text is
    // available in details; do not infer intent from free-form wording.
    return { unanswered, response, unknown: unknown || !response, incomplete: !complete };
  }
  return { unanswered, response, unknown, incomplete: !complete };
}
function blockedImportRetry(node, imported) {
  const recovery = node.ciRecovery, pr = node.github;
  if (recovery?.kind !== "dependency-download-retry-denied" || !pr || pr.revisionChanged || pr.status !== "open" || recovery.sourceHead !== pr.head
      || !imported.matchesSourceHead || imported.sourceHead !== pr.head || !["open", "draft"].includes(imported.status)
      || recovery.importHead !== imported.head || recovery.importNumber !== imported.number || !completeChecks(imported)) return null;
  const expected = [{ id: recovery.checkId, name: recovery.checkName, kind: "check-run" },
    ...recovery.statuses.map(item => ({ ...item, kind: "status" }))];
  for (const signal of expected) {
    const matching = imported.checks.contexts.filter(check => check.kind === signal.kind && check.name === signal.name);
    // A missing identity or another same-name check may supersede this failure.
    if (matching.length !== 1 || matching[0].id !== signal.id || !FAILURE_STATES.has(matching[0].state)) return null;
    if (signal.kind === "check-run" && (matching[0].url !== recovery.jobURL || matching[0].appSlug !== "github-actions")) return null;
  }
  return { ids: new Set(expected.map(item => item.id)), jobURL: recovery.jobURL,
    detail: `Import #${imported.number}: ${recovery.checkName} failed while downloading a dependency. The agent’s retry request returned HTTP 403. A maintainer needs to retry the workflow or check Actions access.` };
}
function sourceAuthenticationRecovery(node) {
  const recovery = node.ciRecovery, pr = node.github;
  if (recovery?.kind !== "source-check-authentication" || !pr || pr.revisionChanged || pr.status !== "open"
      || recovery.sourceHead !== pr.head || !completeChecks(pr)) return null;
  const names = new Set(recovery.checks.map(item => item.name));
  const matching = pr.checks.contexts.filter(check => check.kind === "check-run" && names.has(check.name));
  if (matching.length !== recovery.checks.length) return null;
  for (const signal of recovery.checks) {
    const check = matching.find(item => item.id === signal.id);
    if (!check || check.name !== signal.name || !FAILURE_STATES.has(check.state)
        || check.url !== signal.jobURL || check.appSlug !== "github-actions") return null;
  }
  return { ids: new Set(recovery.checks.map(item => item.id)),
    detail: `${[...names].join("; ")}: the inspected Actions logs report a missing API key. A maintainer needs to correct CI authentication. The failed check results remain visible.` };
}
function requestedRebase(pr, owner) {
  if (!pr?.rebaseRequest || pr.revisionChanged || pr.authorLogin !== owner || pr.rebaseRequest.head !== pr.head) return null;
  return pr.feedback?.items?.find(item => item.id === pr.rebaseRequest.id);
}
function actionableComment(node) {
  const record = node.followup?.actionableComment, pr = node.github;
  if (!record || !pr || pr.status !== "open" || pr.revisionChanged
      || record.head !== pr.head || pr.feedback?.complete !== true) return null;
  const kind = record.kind ?? "comment";
  return pr.feedback.items.find(item => item.kind === kind && item.id === record.commentId && item.url === record.url
    && (kind === "comment" || kind === "review" && ["COMMENTED", "CHANGES_REQUESTED", "APPROVED"].includes(item.state)
      && item.body?.trim())) || null;
}
function releaseWait(node) {
  const wait = node?.releaseWait, pr = node?.github;
  if (!wait || wait.blocking === false || pr?.status !== "open" || pr.head !== wait.head || pr.revisionChanged
      || pr.branchHead && pr.branchHead !== pr.head || !pr.feedback?.complete || !pr.reviewsComplete
      || !pr.threads?.complete || pr.threads.unresolved || actionableComment(node)) return null;
  // A new review or reply can change what was agreed. Do not suppress it.
  if (pr.feedback.items.some(item => Date.parse(item.updatedAt || item.submittedAt || item.createdAt) > Date.parse(wait.confirmedAt))) return null;
  return wait;
}
function sourceFixRecovery(node, nodes = model?.nodes || []) {
  const recovery = node.ciRecovery, pr = node.github;
  if (recovery?.kind !== "shared-source-fix" || !pr || pr.status !== "open" || pr.revisionChanged
      || recovery.sourceHead !== pr.head || node.head && node.head !== pr.head) return null;
  for (const signal of recovery.checks) {
    const checked = signal.number === pr.number ? pr : pr.imports.find(item => item.number === signal.number
      && item.matchesSourceHead && item.sourceHead === pr.head && item.status === "open");
    if (!checked || checked.head !== signal.head || !completeChecks(checked)) return null;
    const matching = checked.checks.contexts.filter(check => check.kind === "check-run" && check.name === signal.name);
    if (matching.length !== 1 || matching[0].id !== signal.id || matching[0].url !== signal.jobURL
        || matching[0].appSlug !== "github-actions" || !FAILURE_STATES.has(matching[0].state)) return null;
  }
  const remedy = nodes.find(item => item.id === recovery.remedy)?.github;
  if (!remedy || remedy.repo !== prRepo(pr) || remedy.revisionChanged) return null;
  if (remedy.status === "open") return { state: "waiting", remedy: recovery.remedy };
  if (remedy.status !== "merged") return null;
  if (!remedy.mergeCommit || remedy.mergeCommit !== recovery.fixCommit)
    return { state: "inspect", remedy: recovery.remedy, mergedAt: remedy.mergedAt, sourceHead: pr.head,
      detail: `CI remedy #${remedy.number} merged. Verify its actual merge commit and whether ${pr.head.slice(0, 9)} contains it, then determine whether this source needs a rebase. The old wait is no longer sufficient.` };
  if (recovery.sourceContainsFix !== false || pr.head === remedy.mergeCommit) return null;
  return { state: "ready", remedy: recovery.remedy, mergedAt: remedy.mergedAt, sourceHead: pr.head,
    detail: `CI remedy #${remedy.number} merged as ${recovery.fixCommit.slice(0, 9)}. Verified ancestry shows ${pr.head.slice(0, 9)} lacks it; rebase this source branch and verify its new checks. Existing failures and review holds remain visible.` };
}
const TRIAGED_REASONS = new Set(["author-feedback", "maintainer-import-checks", "author-conflicts", "maintainer-review"]);
function evidenceJSON(value) {
  // Object key order is not evidence; array order is retained from the snapshot.
  if (Array.isArray(value)) return `[${value.map(evidenceJSON).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${evidenceJSON(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function attentionDispositionEvidence(node, reason, replacementId, nodes = model?.nodes || []) {
  const pr = node.github;
  if (!TRIAGED_REASONS.has(reason) || !pr || pr.status !== "open" || pr.revisionChanged
      || !pr.head || node.head && node.head !== pr.head || pr.reviewsComplete !== true
      || pr.threads?.complete !== true || pr.feedback?.complete !== true || !Array.isArray(pr.feedback.items)
      || actionableComment(node)) return null;
  const evidence = { sourceHead: pr.head, reviewDecision: pr.reviewDecision,
    approvedHead: pr.approvedHead ?? null, approvedAt: pr.approvedAt ?? null,
    headCommittedAt: pr.headCommittedAt ?? null, headIntroducedAt: pr.headIntroducedAt ?? null,
    headHistoryComplete: pr.headHistoryComplete ?? false, threads: pr.threads, feedback: pr.feedback };
  if (reason === "maintainer-import-checks" || reason === "author-conflicts") {
    if (pr.importsComplete !== true || !Array.isArray(pr.imports)) return null;
    const current = importLineage(node);
    if (reason === "maintainer-import-checks" && (!completeChecks(pr) || current.some(item => !completeChecks(item)))) return null;
    evidence.imports = current.map(item => ({ number: item.number, head: item.head, sourceHead: item.sourceHead,
      status: item.status, mergeable: item.mergeable, ...(reason === "maintainer-import-checks" ? { checks: item.checks } : {}) }));
    if (reason === "maintainer-import-checks") evidence.checks = pr.checks;
    else evidence.mergeable = pr.mergeable;
  }
  if (replacementId !== undefined) {
    const replacement = nodes.find(item => item.id === replacementId)?.github;
    if (!["author-conflicts", "maintainer-review"].includes(reason) || !replacement || replacement.revisionChanged
        || prRepo(replacement) !== prRepo(pr) || replacement.status !== "open" || !replacement.head) return null;
    evidence.replacement = { id: replacementId, head: replacement.head, status: replacement.status };
    if (reason === "maintainer-review") {
      const record = node.followup?.attentionDispositions?.find(item => item.reason === reason);
      if (replacementId === node.id || !pr.authorLogin || !pr.reviewRequestsComplete || !Array.isArray(pr.reviewRequests)
          || pr.branchHead && pr.branchHead !== pr.head
          || replacement.branchHead && replacement.branchHead !== replacement.head
          || !replacement.feedback?.complete || !Array.isArray(replacement.feedback.items) || !replacement.reviewsComplete) return null;
      const endorsement = replacement.feedback.items.find(item => item.kind === "review"
        && ["COMMENTED", "APPROVED"].includes(item.state) && item.author?.__typename === "User"
        && item.author.login === pr.authorLogin && item.commit?.oid === replacement.head
        && item.body?.trim() && record?.evidence.includes(item.url));
      if (!endorsement) return null;
      evidence.reviewRequests = [...pr.reviewRequests].sort((a, b) => evidenceJSON(a).localeCompare(evidenceJSON(b)));
      evidence.replacement.endorsement = endorsement;
      evidence.replacement.feedback = replacement.feedback.items.map(item => [item.id, item.updatedAt]);
    }
  }
  return evidence;
}
function attentionDisposition(node, reason) {
  const record = node.followup?.attentionDispositions?.find(item => item.reason === reason);
  // Old snapshots record some suggestions for a later batch. Approval never
  // transfers an open PR’s review work to a separate change.
  if (!record?.binding || record.action === "batch-cleanup" || !record.title || !record.nextAction || !record.evidence?.length) return null;
  const current = attentionDispositionEvidence(node, reason, record.replacement);
  return current && evidenceJSON(current) === evidenceJSON(record.binding) ? record : null;
}
function reviewedAmendment(node) {
  const pr = node.github, proof = node.reapproval;
  return proof && (pr.repo || node.repo) === "google/gvisor" && !pr.revisionChanged
    && proof.kind === "content-amendment" && proof.method === "reviewed-source-diff"
    && proof.head === pr.head && proof.head !== proof.approvedHead
    && [proof.head, proof.approvedHead].every(value => typeof value === "string" && /^[a-f0-9]{40}$/.test(value))
    && typeof proof.diffSha256 === "string" && /^[a-f0-9]{64}$/.test(proof.diffSha256)
    && typeof proof.summary === "string" && proof.summary.trim()
    && typeof proof.evidence === "string" && proof.evidence.startsWith("https://github.com/") ? proof : null;
}
function amendmentApprovers(pr, proof) {
  if (!proof || !pr.reviewsComplete || !pr.reviewDismissals?.complete) return [];
  const latest = new Map();
  for (const item of pr.feedback?.items || []) {
    const author = item.author?.login;
    if (item.kind !== "review" || !author || item.author.__typename !== "User"
        || author === (pr.authorLogin || pr.headOwner)
        || !maintainerReview(pr, item)
        || !["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(item.state)) continue;
    if (!item.submittedAt) return [];
    if (!latest.has(author) || item.submittedAt > latest.get(author).submittedAt) latest.set(author, item);
  }
  const dismissed = new Map((pr.reviewDismissals.items || []).map(item => [item.review?.id, item.previousReviewState]));
  return [...latest.values()].filter(item => item.commit?.oid === proof.approvedHead
    && (item.state === "APPROVED" || item.state === "DISMISSED" && dismissed.get(item.id) === "APPROVED"))
    .map(item => item.author.login).sort();
}
function certifiedEarlierExport(patch) {
  const proof = patch?.earlierExport;
  return proof && Number.isSafeInteger(proof.number) && proof.number > 0
    && proof.comparedHead === patch.approvedHead && proof.newPatchId === patch.oldPatchId
    && [proof.sourceHead, proof.oldPatchId].every(value => typeof value === "string" && /^[a-f0-9]{40}$/.test(value))
    && ![patch.head, patch.approvedHead].includes(proof.sourceHead)
    && ["stable-patch-id", "reviewed-context-only"].includes(proof.method)
    && (proof.method !== "stable-patch-id" || proof.oldPatchId === proof.newPatchId)
    && typeof proof.verifiedAt === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(proof.verifiedAt)
    && Date.parse(proof.verifiedAt) <= Date.parse(patch.verifiedAt) ? proof : null;
}
function importLineage(node, includeAmendment = false) {
  const pr = node.github, current = pr.imports.filter(item => item.matchesSourceHead && item.sourceHead === pr.head);
  const patch = approvedPatch(node);
  const amendment = includeAmendment && reviewedAmendment(node);
  if (amendment && !patch) return current.length ? current : pr.imports.filter(item => item.sourceHead === amendment.approvedHead);
  if (current.some(item => item.status !== "closed") || !patch) return current;
  const earlier = pr.imports.filter(item => item.sourceHead === patch.approvedHead);
  if (current.length) {
    const merged = earlier.filter(item => item.status === "merged");
    return merged.length ? merged : current;
  }
  if (earlier.length || !pr.importsComplete) return earlier;
  const proof = certifiedEarlierExport(patch);
  return pr.imports.filter(item => proof && item.number === proof.number && item.sourceHead === proof.sourceHead);
}
function publicImportDisposition(node, legacySnapshot = false) {
  const pr = node.github, record = pr.publicImportDisposition, patch = approvedPatch(node);
  if (!record) return null; // Older paired snapshots use the same direct lineage below.
  // Older snapshots did not classify content amendments. Keep those readable
  // without inventing a newly collected disposition in the browser.
  const amendment = Object.hasOwn(record.binding, "amendment") && !patch ? reviewedAmendment(node) : null;
  const currentApproval = currentHeadApproval(pr);
  const binding = { sourceHead: pr.head, approvedHead: patch?.approvedHead ?? null, currentApproval,
    complete: pr.importsComplete === true, labels: [...(pr.labels || [])].sort(), labelsComplete: pr.labelsComplete === true,
    labelHistory: pr.labelHistory ?? null, imports: importLineage(node, !!amendment).map(item => ({
      number: item.number, head: item.head, sourceHead: item.sourceHead, status: item.status,
      mergeable: item.mergeable ?? null, conflicting: !!conflictRecord(item),
    })), eligible: usesImports(pr) && pr.status === "open" && !pr.revisionChanged
      && (!pr.branchHead || pr.branchHead === pr.head) && pr.mergeable === "MERGEABLE"
      && !landedPatch(node) && (effectiveReviewDecision(pr) === "APPROVED" || !!patch
        || (currentApproval || !pr.imports.some(item => item.matchesSourceHead && item.sourceHead === pr.head)
          && amendmentApprovers(pr, amendment).length > 0)
          && (pr.githubReviewDecision ?? pr.reviewDecision) !== "CHANGES_REQUESTED") };
  if (amendment) binding.amendment = amendment;
  if (evidenceJSON(record.binding) === evidenceJSON(binding)) return record;
  // Old snapshots could attribute approval to a GitHub collaborator. Validate
  // their other fields, then render from the underlying PR observations.
  if (legacySnapshot && (pr.repo || node.repo) === "google/gvisor"
      && pr.feedback?.items?.some(item => item.kind === "review" && item.state === "APPROVED" && !maintainerReview(pr, item))
      && (record.binding.currentApproval && !binding.currentApproval || record.binding.eligible && !binding.eligible)
      && (!binding.currentApproval || record.binding.currentApproval) && (!binding.eligible || record.binding.eligible)
      && evidenceJSON({...record.binding, currentApproval: binding.currentApproval, eligible: binding.eligible}) === evidenceJSON(binding))
    return record;
  return null;
}
function exportPatchDiffers(node, imports) {
  const comparison = node.importPatchComparison;
  return comparison?.source?.head === node.github.head && imports.some(item =>
    ["open", "draft"].includes(item.status) && item.head === comparison.export?.head)
    && !(comparison.comparison?.normalized_delta_identical === true && comparison.comparison?.modes_identical === true);
}
function reviewedExport(node) {
  const pr = node?.github, receipt = pr?.publicImportDisposition?.reviewedExport;
  if (!receipt || pr.status !== "open" || !usesImports(pr) || pr.githubReviewDecision !== "APPROVED" || pr.revisionChanged
      || !pr.reviewsComplete || !pr.reviewRequestsComplete || !pr.headHistoryComplete
      || pr.branchHead && pr.branchHead !== pr.head) return false;
  const record = publicImportDisposition(node);
  if (!record || record.scope !== "exact" || !["open", "conflicting"].includes(record.state) || record.trigger.state !== "present"
      || !record.binding.complete || !record.binding.labelsComplete || !pr.feedback?.complete || !pr.reviewDismissals?.complete) return false;
  const review = pr.feedback.items.find(item => item.id === receipt.reviewId);
  if (exportPatchDiffers(node, record.binding.imports)) return false;
  return review?.kind === "review" && maintainerReview(pr, review) && review.state === "APPROVED" && review.commit?.oid === pr.head
    && !pr.reviewRequests?.some(item => item.login === review.author?.login)
    && !pr.feedback.items.some(item => item.kind === "review" && item.author?.login === review.author?.login
      && ["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(item.state) && item.submittedAt > review.submittedAt)
    && !pr.reviewDismissals.items.some(item => item.review?.id === review.id)
    && record.binding.imports.some(item => item.number === receipt.number && item.head === receipt.head
      && item.sourceHead === pr.head && item.status === "open");
}
function unresolvedImportChecks(imports) {
  const active = imports.filter(item => ["open", "draft"].includes(item.status));
  // Closing the only export does not resolve a public CI failure. An active
  // or merged replacement supersedes the closed attempt's checks.
  return active.length || imports.some(item => item.status === "merged") ? active : imports;
}
function attentionReasons(node, owner) {
  const reasons = [], add = (id, detail, title) => {
    const disposition = attentionDisposition(node, id === "agent-import-conflict" ? "author-conflicts" : id);
    if (disposition) {
      if (disposition.action === "prefer-alternative") return;
      const dispositionId = disposition.action === "ci-infrastructure-retry" ? "maintainer-ci-infrastructure" : "maintainer-triaged";
      const existing = reasons.find(item => item.id === dispositionId);
      const triage = `${disposition.title}. ${disposition.nextAction}`;
      if (existing) { if (!existing.detail.includes(triage)) existing.detail += ` ${triage}`; }
      else reasons.push({ ...ATTENTION_REASONS.find(item => item.id === dispositionId), detail: triage });
    } else if (!reasons.some(item => item.id === id)) reasons.push({ ...ATTENTION_REASONS.find(item => item.id === id), ...(title ? { title } : {}), detail });
  };
  if (node.followup?.owner === "Agent" && /^[a-f0-9]{40}$/.test(node.followup.sourceHead) && node.followup.sourceHead === node.head && !historical(node)
      && (!node.github || node.github.head === node.followup.sourceHead) && node.followup.nextAction)
    add("agent-recorded-followup", node.followup.nextAction);
  if (node.type === "investigation" && node.task === true && node.owner === "Agent" && node.status === "active"
      && typeof node.nextStep === "string" && node.nextStep.trim())
    add("agent-recorded-followup", node.nextStep);
  const issueWork = node.issueFeedback?.filter(row => !row.claimed);
  if (issueWork?.length) add("agent-issue-reply", issueWork.map(row =>
    `@${row.author} · ${row.action}`).join(" "));
  if (node.reviewFollowups?.length) add("agent-review-reply", node.reviewFollowups.map(item =>
    `${item.owner || "Agent"} · @${item.author}: ${item.action || "Read the reply and follow up on the current revision."}`).join(" "));
  if (node.incomingReviewRequests?.length) {
    const people = [...new Set(node.incomingReviewRequests.map(item => item.author && `@${item.author}`).filter(Boolean))];
    add("agent-requested-review", people.length ? `${people.join(", ")} requested a review.` : "GitHub lists an open review request.");
  }
  for (const decision of pendingDecisions(node)) {
    if (contributorDecisionNeedsRefresh(node, decision)) {
      const base = decision.baseHead || decision.head;
      add("agent-refresh", `The ${decision.kind} was prepared against ${base.slice(0, 9)}, but the published head is ${node.github.head.slice(0, 9)}. Check the new source before requesting a contributor decision.`);
    } else if (states(node)["contributor-review"]) {
      add(decisionReason(decision), decision.summary || decision.title || "Ready for your review.");
    }
  }
  if (humanAction(node)) add("human-submission", humanAction(node).summary);
  if (node.type === "investigation" && node.status === "active" && !contributorDecision(node) && !humanAction(node)) {
    if (node.defaultBranchCheck) {
      if (["FAILURE", "ERROR", "SUCCESS"].includes(liveSnapshot?.defaultBranchChecks?.[node.id]?.state))
        add("agent-default-branch-check", investigationNextStep(node));
    } else if (node.group === "ci-flakes") add("agent-ci-flake", node.nextStep);
  }
  if (contributorChanges(node)) add("author-feedback", "The contributor requested changes to this branch revision.");
  const outreach = currentOutreach(node);
  if (outreach?.status === "due") add("agent-review-outreach", `${outreach.kind === "import-status" ? "Import status" : "Review"} request due for @${outreach.reviewer}.`);
  else if (outreach?.status === "verify-mergeability") add("agent-review-outreach", "Check mergeability before sending the due review request.");
  else if (outreach?.status === "needs-reviewer") add("agent-review-outreach", "Find another active reviewer with relevant experience.");
  const sweep = liveSnapshot?.projectFeedbackReview;
  if (node.id === "investigation:project-feedback" && node.status === "active" && sweep?.dailyReviewDue === true
      && sweep.lastReviewed && sweep.lastReviewed === node.lastReviewedAt)
    add("agent-feedback-sweep", "Review new proposals and recently landed changes against current project guidance.");
  if (node.type === "branch" && node.status === "Agent work" && node.repo?.split("/")[0] === owner
      && /^[a-f0-9]{40}$/.test(node.head) && node.followup?.sourceHead === node.head
      && typeof node.followup.owner === "string" && node.followup.owner.trim()
      && typeof node.followup.nextAction === "string" && node.followup.nextAction.trim())
    add("agent-branch-work", `${node.followup.owner}: ${node.followup.nextAction}`);
  const pr = node.github;
  const inspection = pr?.terminalImportHandoff;
  if (node.type === "pr" && pr?.headOwner === owner && ["open", "draft"].includes(pr.status)
      && inspection?.action === "inspect-terminal-import" && inspection.sourceHead === pr.head
      && inspection.repo === "google/gvisor" && inspection.number === pr.number && inspection.url === pr.url
      && !pr.revisionChanged && (!pr.branchHead || pr.branchHead === pr.head) && pr.importsComplete
      && !landedPatch(node) && !importLineage(node).some(item => item.status !== "closed")
      && inspection.imports?.length && inspection.imports.every(merged => pr.imports.some(item => item.status === "merged"
        && item.number === merged.number && item.head === merged.head && item.sourceHead === merged.sourceHead)))
    add("agent-import-comparison", inspection.nextAction);
  if (node.type !== "pr" || pr?.headOwner !== owner || pr.status !== "open") return reasons;
  if (pr.branchHead && pr.branchHead !== pr.head) {
    add("agent-refresh", `The snapshot observed source branch ${pr.branchHead.slice(0, 9)}, but GitHub's PR reports ${pr.head.slice(0, 9)}. Displayed reviews, checks and mergeability cover the older PR head; the branch's current mergeability is unknown.`);
    return reasons;
  }
  const landed = landedPatch(node);
  const importDisposition = publicImportDisposition(node);
  const exportedConflict = importDisposition?.mergeableExport;
  const rebase = requestedRebase(pr, owner);
  if (!landed && pr.head && conflictRecord(pr)) {
    const integrated = exportedConflict && !pr.revisionChanged && pr.branchHead === pr.head && pr.feedback?.complete
      && !exportPatchDiffers(node, importDisposition.binding.imports)
      && effectiveReviewDecision(pr) === "APPROVED" && pr.base === exportedConflict.base
      && pr.imports.some(item => item.number === exportedConflict.number && item.head === exportedConflict.head
        && !item.revisionChanged && item.branchHead === item.head && item.base === pr.base);
    if (!integrated || rebase) add("author-conflicts", mergeDescription(pr));
  }
  if (pr.revisionChanged || !pr.head) {
    add("agent-refresh", "Current source revision or its review/check evidence needs a public snapshot refresh.");
    return reasons;
  }
  const alternative = node.followup?.attentionDispositions?.find(item => item.action === "prefer-alternative");
  if (alternative && !landed && !attentionDisposition(node, alternative.reason))
    add("agent-refresh", "Reassess the author’s preference for the alternative PR. The review evidence or one of the two revisions has changed or is unavailable.");
  const contexts = pr.checks?.contexts || [];
  const sourceFix = sourceFixRecovery(node);
  if (!landed && ["inspect", "ready"].includes(sourceFix?.state)) add("author-ci-remedy", sourceFix.detail);
  const copybara = name => contexts.find(check => check.kind === "status" && check.name === name);
  const importStatus = copybara("import/copybara"), feedbackStatus = copybara("feedback/copybara");
  const sourceRecovery = sourceAuthenticationRecovery(node);
  const publicFailures = failedValidationChecks(pr).filter(check => !isPrivateBuildkiteCheck(pr, check));
  const authorFailures = publicFailures.filter(check => !sourceRecovery?.ids.has(check.id));
  if (!landed && authorFailures.length) add("author-public-checks", authorFailures.map(check => `${check.name}: ${check.state}`).join("; "));
  const reviewHold = activeReviewHold(node, pr);
  const approvalGates = contexts.filter(check => isApprovalGate(pr, check));
  if (!landed && !reviewHold && approvalGates.length && !attentionDisposition(node, "author-conflicts")?.replacement) add("maintainer-review", `${approvalGates.map(check => check.name).join("; ")}: Check requires approving review. These checks have not run.`);
  const review = reviewAttention(pr, owner), decision = effectiveReviewDecision(pr);
  const acceptedPatch = approvedPatch(node), approved = decision === "APPROVED" || acceptedPatch;
  const exported = reviewedExport(node);
  const comment = actionableComment(node), feedback = [];
  const newWaitComment = node.releaseWait?.head === pr.head && pr.feedback?.items?.findLast(item => (item.kind === "comment" || item.kind === "review" && item.state !== "APPROVED" && item.body?.trim())
    && item.author?.login !== owner && Date.parse(item.updatedAt || item.createdAt) > Date.parse(node.releaseWait.confirmedAt));
  if (!landed && rebase) feedback.push(`@${rebase.author.login} asked for a rebase: ${rebase.url}.`);
  if (review.unanswered.length) feedback.push("Review the unanswered threads: " + review.unanswered.map(item => safeURL(item.url) || "thread in PR details").join(", ") + ".");
  if (comment) feedback.push(`${node.followup.owner} is assigned to address this top-level ${comment.kind}: ${comment.url}. GitHub's review decision is unchanged.`);
  if (newWaitComment) feedback.push(`Triage the comment posted after the release hold was agreed: ${newWaitComment.url}. Reconfirm the hold if it still applies.`);
  if (feedback.length) add("author-feedback", feedback.join(" "));
  if (landed) {
    add("landed-source-open", `The exact source patch is already present on upstream ${landed.upstreamHead.slice(0, 12)}: replaying it left tree ${landed.upstreamTree.slice(0, 12)} unchanged. No import, approval or merge action is needed. The source PR remains open on GitHub.`);
    return ATTENTION_REASONS.flatMap(definition => reasons.filter(reason => reason.id === definition.id));
  }
  if (rebaseNeedsComparison(node)) add("agent-rebase-check", "Approval predates the rebase. Compare the reviewed patch with the current head before requesting another review.");
  if (importStatus && FAILURE_STATES.has(importStatus.state)) add("maintainer-import-failed", `import/copybara: ${importStatus.state}. Internal error details are not public.`);
  if (contexts.some(check => check.purpose === "reviewer-assignment" && FAILURE_STATES.has(check.state)))
    add("maintainer-assignment", "Reviewer assignment failed; this is separate from source validation.");
  const current = pr.imports.filter(item => item.matchesSourceHead && item.sourceHead === pr.head);
  const lineage = importLineage(node, !!importDisposition?.binding.amendment);
  const active = lineage.filter(item => ["open", "draft"].includes(item.status));
  // Only old snapshots need the direct fallback. New snapshots share this
  // recovery decision with the periodic planner, including source readiness.
  const importEligible = approved && usesImports(pr) && pr.mergeable === "MERGEABLE";
  const importAction = importDisposition ? importDisposition.action : !importEligible ? null
    : active.some(conflictRecord) ? current.length ? "author-conflicts" : "maintainer-import-refresh"
    : !active.length && pr.importsComplete && lineage.length
      ? lineage.some(item => item.status === "merged") ? "maintainer-import-landed" : "maintainer-reimport" : null;
  if (importAction === "maintainer-reapproval") {
    const exports = (acceptedPatch ? active : lineage).map(item => `Copybara PR #${item.number} (${item.url}) ${acceptedPatch ? "still exports" : `is ${item.status} and names`} ${item.sourceHead.slice(0, 9)}: ${checkInfo(item).text.toLowerCase()} public checks (${item.checks.total} reported)${conflictRecord(item) ? "; merge conflicts" : ""}`);
    const approval = acceptedPatch ? `The prior approval was submitted ${acceptedPatch.submittedAt}. Equivalent source patches and an open older export do not replace current-head approval.`
      : `The reviewed amendment changes the source approved at ${node.reapproval.approvedHead.slice(0, 9)}. That approval does not cover this amendment${lineage.length ? ", and the older export does not contain it" : ""}.`;
    add("maintainer-reapproval", `Ask the approving maintainer to reapprove current source ${pr.head.slice(0, 9)} (${pr.url}), published ${pr.headIntroducedAt}. ${approval} ${exports.join(". ")}${exports.length ? ". " : ""}Reapproval of this source PR lets Copybara regenerate the import; the periodic alarm uses the existing per-PR cooldown and business hours.`);
  }
  const restoreLabel = importAction === "maintainer-import-label";
  const awaitingReapprovedExport = !restoreLabel && importDisposition?.binding.eligible && ["equivalent", "amended"].includes(importDisposition.scope)
    && importDisposition.binding.currentApproval && (active.length || importDisposition.scope === "amended" && lineage.length);
  if (awaitingReapprovedExport)
    add("maintainer-unknown", `Current source ${pr.head.slice(0, 9)} has a fresh approval. Copybara still shows the earlier export ${lineage.map(item => "#" + item.number).join(", ")}; wait for its replacement. The earlier export is not a request for manual conflict repair.`, "Reapproved; waiting for Copybara");
  for (const item of active) {
    if (!conflictRecord(item)) continue;
    if (current.includes(item))
      add("agent-import-conflict", `Check Copybara export #${item.number} against its base. ${mergeDescription(item)}`);
    else if (importAction === "maintainer-import-refresh")
      add("maintainer-import-refresh", `Refresh the earlier export #${item.number}. ${mergeDescription(item)}`);
  }
  // After reapproval, a failed check on the previous export stays in that
  // export's details. Source checks and checks on a replacement still apply.
  const checkImports = awaitingReapprovedExport && importDisposition.binding.complete && importDisposition.trigger?.state === "present"
    ? lineage.filter(item => item.sourceHead === pr.head) : lineage;
  const failed = unresolvedImportChecks(checkImports).filter(item => checkInfo(item).tone === "bad");
  const recoveries = new Map(failed.map(item => [item.number, blockedImportRetry(node, item)]));
  const retryDetails = sourceRecovery ? [sourceRecovery.detail] : [];
  retryDetails.push(...[...recoveries.values()].filter(Boolean).map(item => item.detail));
  const cancellationDetails = [];
  for (const item of [pr, ...active]) {
    for (const check of validationChecks(item).filter(canceledValidationCheck)) {
      const message = check.kind === "check-run" ? `${check.name} was canceled` : check.description;
      cancellationDetails.push(`${item === pr ? "Source" : "Import"} #${item.number}: ${message}. Review the cancellation at ${check.url} before scheduling another run.`);
    }
  }
  if (retryDetails.length) add("maintainer-ci-retry", retryDetails.join(" "), sourceRecovery && retryDetails.length === 1 ? "Maintainer CI configuration" : undefined);
  if (cancellationDetails.length) add("maintainer-ci-canceled", cancellationDetails.join(" "));
  const publicImportFailures = failed.flatMap(item => failedValidationChecks(item)
    .filter(check => !isPrivateBuildkiteCheck(item, check) && !recoveries.get(item.number)?.ids.has(check.id))
    .map(check => `Import #${item.number}: ${check.name}: ${check.state} (${safeURL(check.url) || "direct link not recorded"})`));
  for (const item of failed) if (!completeChecks(item) || !failedValidationChecks(item).length)
    publicImportFailures.push(`Import #${item.number}: failure evidence is incomplete; refresh and investigate its public check records`);
  const internalImportFailures = active.flatMap(item => (item.checks?.contexts || [])
    .filter(check => isImportStatus(check) && FAILURE_STATES.has(check.state))
    .map(check => `Import #${item.number}: ${check.name}: ${check.state}`));
  if (feedbackStatus && FAILURE_STATES.has(feedbackStatus.state)) internalImportFailures.unshift(`Source feedback/copybara: ${feedbackStatus.state}`);
  const importDiagnosis = failed.length && attentionDisposition(node, "maintainer-import-checks");
  const privateChecks = [pr, ...(importDiagnosis ? [] : failed)].flatMap(item => failedValidationChecks(item)
    .filter(check => isPrivateBuildkiteCheck(item, check))
    .map(check => `${item === pr ? "Source" : "Import"} #${item.number}: ${check.name}: ${check.state}`));
  if (publicImportFailures.length || importDiagnosis)
    add("maintainer-import-checks", `${[...publicImportFailures, ...internalImportFailures].join(". ")}. Investigate the import’s CI logs.`);
  if (privateChecks.length)
    add("maintainer-internal-feedback", `${[...privateChecks, ...internalImportFailures].join(". ")}. The internal Buildkite pipeline requires project access to diagnose.`);
  else if (!publicImportFailures.length && internalImportFailures.length)
    add("maintainer-internal-feedback", `${internalImportFailures.join(". ")}. Internal checks failed; public validation results remain separate. ${[pr, ...active].some(item => (item.checks?.contexts || []).some(check => isImportStatus(check) && FAILURE_STATES.has(check.state) && check.url)) ? "Inspect the reported service link." : "No public log URL was reported; internal diagnostics are needed."}`);
  if (pr.mergeable === "UNKNOWN" || active.some(item => item.mergeable === "UNKNOWN"))
    add("agent-refresh", "GitHub has not computed current mergeability for the source or a matching import. Refresh its public evidence; any previously observed same-head conflict remains actionable.");
  if (review.incomplete || importDisposition?.binding.amendment && !pr.importsComplete || [pr, ...active].some(item => !completeChecks(item)
      || checkInfo(item).tone === "unknown" && validationChecks(item).length > 0)
      || approved && (usesImports(pr) && !pr.importsComplete || pr.labelsComplete !== true))
    add("agent-refresh", "Current public review, checks, labels or import-link evidence is incomplete. The agent needs to refresh or investigate it; known actions remain listed.");
  if (checkInfo(pr).tone === "bad" && !failedValidationChecks(pr).length && !importStatus && !feedbackStatus)
    add("agent-refresh", "GitHub reports a source check failure without its failing context. Investigate the public check records.");
  const wait = releaseWait(node);
  if (wait) {
    const version = pr.releaseVersion;
    if (version === wait.checkedVersion)
      add("upstream-release", `${version} does not include the required fix. ${wait.nextAction} No maintainer reply is due.`);
    else add("agent-release-check", `${version ? `Upstream now lists ${version}.` : "The latest upstream release could not be verified."} ${wait.nextAction}`);
    return ATTENTION_REASONS.flatMap(definition => reasons.filter(reason => reason.id === definition.id));
  }
  if (restoreLabel && (Object.hasOwn(importDisposition, "authorBlock") ? importDisposition.authorBlock === null
    : pr.threads?.complete && !pr.threads.unresolved && !comment))
    add("maintainer-import-label", importDisposition.description, "Restore ready to pull");
  // Closing the only export is independent of its retained CI failure. Keep
  // both actions visible; skipping another approval request is not all-clear.
  if (importAction === "maintainer-reimport")
    add("maintainer-reimport", `Import ${lineage.map(item => "#" + item.number).join(", ")} closed without merging. No matching public export is open. ${importDisposition?.trigger?.state === "missing"
      ? `The ready to pull label was removed at ${importDisposition.trigger.removedAt}${importDisposition.trigger.actor ? ` by ${importDisposition.trigger.actor}` : ""}. A qualified approving maintainer needs to restore that label to restart import; the periodic alarm checks this independently of patch approval.`
      : "A maintainer needs to recover the import; the closure's cause is not established."} Retained CI evidence remains separate.`);
  if (importDisposition?.binding.eligible && importDisposition.scope !== "amended" && importDisposition.state === "closed" && importDisposition.trigger?.state === "present")
    add("maintainer-unknown", "The ready to pull label is present again. Waiting for Copybara to create a replacement export; no label-restoration reminder is due.", "Relabeled; waiting for replacement export");
  if (importAction === "maintainer-import-landed")
    add("maintainer-import-landed", `Import ${lineage.filter(item => item.status === "merged").map(item => "#" + item.number).join(", ")} merged${acceptedPatch && !current.length ? " with the verified equivalent pre-rebase patch" : ""}; the source PR remains open. Verify the landed change and reconcile the source PR; another import or fresh approval is not indicated.`);
  const followupBlocked = reasons.some(item => item.owner === "agent" || ["maintainer-triaged", "maintainer-ci-infrastructure", "maintainer-import-refresh", "maintainer-reapproval"].includes(item.id));
  if (reviewHold) add("maintainer-unknown", reviewHold.reason, "Maintainer requested a hold");
  if (!reviewHold && review.unknown && !review.incomplete && !followupBlocked)
    add("maintainer-response", "A reviewer decision remains unresolved without an identified author change.");
  if (!reviewHold && review.response && !newWaitComment)
    add("maintainer-response", "An author reply, resolved threads or an older review-level decision calls for reviewer follow-up. This does not assert the fix is accepted.");
  if (!reviewHold && !approved && !exported && !restoreLabel && !followupBlocked && !review.response && !review.unknown)
    add("maintainer-review", "Approval of the current published revision is not established.");
  if ((approved || exported) && !followupBlocked && !retryDetails.length && !cancellationDetails.length && !awaitingReapprovedExport && !restoreLabel) {
    const open = active.filter(item => item.status === "open");
    if (!usesImports(pr)) {
      if (pr.mergeable === "MERGEABLE" && checksPassed(pr))
        add("maintainer-merge", "Current-head approval and complete green checks are recorded. Maintainers control merging; the site never merges automatically.");
    }
    else if (open.length && importDisposition?.scope !== "amended") {
      const facts = open.map(item => `Import #${item.number}: ${checkInfo(item).text.toLowerCase()} checks${item.mergeable === "UNKNOWN" ? "; mergeability unknown" : item.mergeable === "CONFLICTING" ? "; conflicts" : ""}`);
      add(current.length ? "maintainer-merge" : "maintainer-import-previous", `${facts.join(". ")}.${current.length ? "" : " The export contains the equivalent approved patch before the rebase; these checks belong to that earlier head. No fresh approval is needed."} Remaining internal gates are not established.`);
    } else if (active.length) add("maintainer-unknown", "The matching public import is a draft.", "Matching import is a draft");
    else if (!lineage.length && importStatus?.state === "SUCCESS") add("maintainer-unknown", "Copybara reports a successful internal import, but no matching public export PR was found in the complete lookup. Internal checks are reported separately; public export is still pending.", "Waiting for public export");
    else if (!lineage.length && importStatus && !FAILURE_STATES.has(importStatus.state)) add("maintainer-unknown", `import/copybara: ${importStatus.state}; no matching public import link. Ask for the import's progress.`, "Import pending; no public PR");
    else if (!lineage.length && !importStatus && !feedbackStatus) {
      if (!pr.labels.includes("ready to pull")) add("maintainer-import-label", `${acceptedPatch ? "Approval of the unchanged patch" : "Current-head approval"} is recorded, but the ready to pull label is absent. A maintainer needs to mark the PR for import; an internal CL may already exist.`);
      else add("maintainer-import", `${acceptedPatch ? "Approval of the unchanged patch" : "Current-head approval"} and the ready to pull label are recorded; no matching public import was found. An internal CL may already exist.`);
    }
  }
  const opportunity = node.releaseWait;
  if (!landed && opportunity?.blocking === false && pr.status === "open" && opportunity.head === pr.head
      && (!pr.branchHead || pr.branchHead === pr.head) && pr.releaseVersion && pr.releaseVersion !== opportunity.checkedVersion) {
    add("agent-release-opportunity", `BCR lists ${opportunity.module} ${pr.releaseVersion}. ${opportunity.nextAction}`);
  }
  return ATTENTION_REASONS.flatMap(definition => reasons.filter(reason => reason.id === definition.id));
}
// A decision the contributor can make takes precedence over a simultaneous
// code fix or maintainer request. Individual reason filters still match both.
function primaryAttention(reasons) {
  return reasons.find(reason => reason.owner === "user") || reasons.find(reason => reason.owner === "agent" && !reason.secondary)
    || reasons.find(reason => reason.owner === "maintainer") || reasons[0];
}
function attentionGroups(nodes, owner, grouped = true, filters = reasonFilters) {
  const entries = nodes.map(node => {
    const reasons = attentionReasons(node, owner);
    const selectedReason = reasons.find(reason => filters.has(reason.id));
    const primary = selectedReason || primaryAttention(reasons);
    const linkReason = grouped || filters.has("queue-user") ? primary : selectedReason;
    const copyURL = linkReason?.owner === "user" ? contributorDecisionURL(node, linkReason.id)
      : node.type === "pr" && node.github?.headOwner === owner ? safeURL(node.url) : null;
    return { node, reasons, primary, copyURL };
  });
  if (!grouped) return [{ id: "visible", owner: "other", title: "Visible items", entries }];
  const groups = [...ATTENTION_REASONS, ...OTHER_ATTENTION_GROUPS].map(group => ({ ...group, entries: [] }));
  for (const entry of entries) {
    const id = entry.primary?.id || (historical(entry.node) ? "resolved" : entry.node.github?.status === "draft" ? "draft" : "other");
    groups.find(group => group.id === id).entries.push(entry);
  }
  return groups.filter(group => group.entries.length);
}
function attentionText(groups, checkedAt) {
  const shown = groups.filter(group => group.entries.some(entry => entry.copyURL));
  const intro = shown.length && shown.every(group => group.owner === "user") ? "Contributor decisions and human actions awaiting attention."
    : shown.length && shown.every(group => group.owner === "maintainer") ? "Could you help with these PRs?" : "PRs grouped by the next action.";
  const sections = shown.map(group => `${group.owner === "other" ? group.title : `${ATTENTION_OWNERS[group.owner]}: ${group.title}`}\n${group.entries.filter(entry => entry.copyURL).map(entry => entry.copyURL).join("\n")}`);
  return [intro, `Public GitHub snapshot: ${handoffTimestamp(checkedAt) || "unavailable"}. Internal status may not be visible.`, ...sections].join("\n\n");
}
function invalidateHandoffCopy() {
  $("handoff-manual").hidden = true; $("handoff-copy-text").value = ""; $("handoff-copy-status").textContent = "";
  $("handoff-copy-all").textContent = "Copy visible";
  return ++handoffCopyVersion;
}
async function copyHandoff(text, description, control) {
  const version = invalidateHandoffCopy();
  try {
    await navigator.clipboard.writeText(text);
    if (version !== handoffCopyVersion) return;
    $("handoff-copy-status").textContent = `${description} copied.`;
    if (control) control.textContent = "Copied ✓";
  } catch {
    if (version !== handoffCopyVersion) return;
    const input = $("handoff-copy-text"); $("handoff-manual").hidden = false; input.value = text; input.focus(); input.select();
    $("handoff-copy-status").textContent = "Clipboard unavailable. The plain text below is selected for manual copying.";
  }
}

function badge(info, title) {
  const node = element("span", `attribute-badge ${info.tone}`, info.text);
  if (title) node.title = title;
  return node;
}
function attributeTitle(node) {
  const pr = node.github;
  if (!pr) return "PR attributes have not been fetched.";
  return `Review: ${reviewInfo(pr, node).text}\nPR checks: ${checkInfo(pr).text} · ${checkInfo(pr).detail}\nLabels: ${pr.labels.join(", ") || "none"}\n${usesImports(pr) ? `${pr.imports.length} verified import PR(s)${pr.importsComplete ? "" : "; lookup incomplete"}` : "Direct repository review; no Copybara import"}\nSnapshot ${date(pr.checkedAt)} · source ${pr.head.slice(0, 9)}`;
}
function importCell(node) {
  const cell = element("td", "import-cell"), pr = node.github;
  if (!pr) { cell.textContent = node.type === "pr" ? "Not fetched" : "—"; return cell; }
  if (!usesImports(pr)) { cell.textContent = "Not applicable"; return cell; }
  const labels = pr.labels.filter((name) => /import|ready to pull/i.test(name));
  for (const name of labels) cell.append(badge({ text: name, tone: "label" }, "Actual GitHub label; not an approval or a test result."));
  if (pr.imports.length === 1) {
    const imported = pr.imports[0], info = checkInfo(imported);
    cell.append(link(`#${imported.number}`, imported.url, "import-link"), badge(info, `Import PR checks on ${imported.head.slice(0, 9)}: ${info.detail}`));
    if (!imported.matchesSourceHead) cell.append(badge({ text: "older source", tone: "pending" }, `Import refers to ${imported.sourceHead.slice(0, 9)}, not current ${pr.head.slice(0, 9)}.`));
  } else if (pr.imports.length) cell.append(button(`${pr.imports.length} verified imports`, () => select(node.id), "imports-choice"));
  else cell.append(element("span", "attribute-unknown", pr.importsComplete ? "No linked PR found" : "Link lookup incomplete"));
  cell.title = `Snapshot ${date(pr.checkedAt)}. Links require Copybara's explicit source-PR/revision footer. Internal CL status alone is not an import PR.`;
  return cell;
}
function appendChecks(container, pr, heading) {
  const section = element("details", "check-details"), info = checkInfo(pr), summary = element("summary");
  section.dataset.pr = prIdentity(pr);
  summary.append(document.createTextNode(`${heading} · `), badge(info)); section.append(summary);
  section.append(element("p", "detail-meta", info.detail));
  if (pr.checks?.contexts.some(check => isAdvisoryCheck(pr, check))) {
    const note = element("p", "detail-meta", "First Pass is advisory while maintainers set it up. ");
    note.append(link("Maintainer guidance", "https://github.com/google/gvisor/issues/16791#issuecomment-6585124255"));
    section.append(note);
  }
  for (const check of [...(pr.checks?.contexts || []), ...(pr.checks?.supersededContexts || [])]) {
    const row = element("div", "check-row");
    const historical = pr.checks.supersededContexts?.includes(check);
    row.append(check.url ? link(check.name, check.url) : element("span", "", check.name), element("span", "check-state", `${check.state.toLowerCase().replaceAll("_", " ")}${historical ? " · superseded attempt" : isAdvisoryCheck(pr, check) ? " · advisory" : check.purpose === "reviewer-assignment" ? " · reviewer assignment" : isImportStatus(check) ? " · import status" : isApprovalGate(pr, check) ? " · approval required; not run" : ""}`));
    if (check.description) row.title = check.description;
    if (!check.url) row.title = "No public log URL reported. The status is reported by GitHub; logs were not inspected.";
    section.append(row);
  }
  container.append(section);
}
function conflictRecord(pr) {
  const previous = pr.mergeabilityObservation;
  if (pr.mergeable === "CONFLICTING") {
    const observedAt = pr.conflictCheckedAt || pr.mergeabilityCheckedAt || pr.checkedAt;
    return { scope: pr.head, since: observedAt, observedAt, basis: "observed", qualifier: null };
  }
  if (pr.mergeable === "UNKNOWN" && previous?.state === "CONFLICTING" && previous.head === pr.head)
    return { scope: pr.head, since: previous.checkedAt, observedAt: previous.checkedAt, basis: "observed", qualifier: "Last observed conflict; GitHub is recomputing current mergeability" };
  return null;
}
function mergeDescription(pr) {
  const previous = pr.mergeabilityObservation;
  const current = pr.mergeable === "CONFLICTING" ? "Merge conflicts" : pr.mergeable === "MERGEABLE" ? "No reported merge conflict" : "GitHub is recomputing mergeability";
  const observed = previous ? ` Last observed ${previous.state === "CONFLICTING" ? "conflict" : "no conflict"} at ${date(previous.checkedAt)}, head ${previous.head.slice(0, 9)}, base ${previous.base?.slice(0, 9) || "not recorded"}.${previous.head !== pr.head ? " That observation belongs to an older head." : ""}` : " No previous concrete result is recorded.";
  const branch = pr.branchHead && pr.branchHead !== pr.head
    ? `The observed source branch ${pr.branchHead.slice(0, 9)} differs from the PR head; its mergeability is unknown. PR head: ` : "";
  return branch + current + (pr.mergeable === "UNKNOWN" ? observed : ` · checked ${date(pr.conflictCheckedAt || pr.mergeabilityCheckedAt || pr.checkedAt)} · head ${pr.head.slice(0, 9)} · base ${pr.base?.slice(0, 9) || "not recorded"}`);
}
function withConflictResult(pr) {
  const result = conflictResults.get(prIdentity(pr));
  if (!result) return pr;
  if (Date.parse(result.checkedAt) <= Date.parse(pr.mergeabilityCheckedAt || pr.checkedAt)) {
    const observed = result.observation;
    return pr.mergeable === "UNKNOWN" && observed?.head === pr.head &&
      Date.parse(observed.checkedAt) > (pr.mergeabilityObservation ? Date.parse(pr.mergeabilityObservation.checkedAt) : -Infinity)
      ? { ...pr, mergeabilityObservation: observed } : pr;
  }
  const changed = result.head !== pr.head;
  const current = { ...pr, head: result.head, headRepo: result.headRepo ?? null, ref: result.ref, base: result.base, status: result.status,
    // A PR reread cannot clear a recorded mismatch on that same source ref.
    branchHead: !changed && result.ref === pr.ref && result.headRepo === pr.headRepo && pr.branchHead !== pr.head ? pr.branchHead ?? null : null,
    mergeable: result.state, conflictCheckedAt: result.checkedAt, revisionChanged: changed, statusChanged: result.status !== pr.status };
  if (changed) Object.assign(current, { reviewDecision: null, approvedHead: null, githubReviewDecision: null,
    reviewsComplete: false, reviewRequestsComplete: false, checks: null, labels: [], labelsComplete: false,
    importsComplete: false, imports: pr.imports.map(item => ({ ...item, matchesSourceHead: false })) });
  current.mergeabilityObservation = result.observation || pr.mergeabilityObservation;
  return current;
}
async function refreshConflict(number, repo = registry.meta.repo) {
  const identity = prIdentity({ number, repo });
  if (conflictRequest || Date.now() - lastConflictAttempt < 10000) return;
  conflictRequest = true; lastConflictAttempt = Date.now(); drawDetails();
  let message;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/pulls/${number}`, {
      cache: "no-cache", credentials: "omit", headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? "GitHub rate limit or access restriction; try later or open the PR" : `GitHub returned ${response.status}`);
    const data = await response.json(), headRepo = data.head?.repo?.full_name ?? null;
    if (data.number !== number || data.html_url !== `https://github.com/${repo}/pull/${number}` ||
        !/^[a-f0-9]{40}$/.test(data.head?.sha) || !/^[a-f0-9]{40}$/.test(data.base?.sha) ||
        typeof data.head.ref !== "string" || !data.head.ref ||
        headRepo !== null && (typeof headRepo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(headRepo)) ||
        ![true, false, null].includes(data.mergeable) || !["open", "closed"].includes(data.state) || typeof data.merged !== "boolean")
      throw new Error("GitHub returned an unexpected PR identity or mergeability result");
    // This REST response identifies the PR's recorded base, but does not
    // observe the current destination branch tip.
    const result = { head: data.head.sha, headRepo, ref: data.head.ref, base: null, state: data.mergeable === true ? "MERGEABLE" : data.mergeable === false ? "CONFLICTING" : "UNKNOWN",
      status: data.merged ? "merged" : data.state === "closed" ? "closed" : data.draft ? "draft" : "open", checkedAt: new Date().toISOString() };
    // A newer unknown response must not erase a concrete result obtained in this tab.
    const old = conflictResults.get(identity);
    result.observation = result.state === "UNKNOWN" ? old?.observation
      : { state: result.state, head: result.head, base: result.base, checkedAt: result.checkedAt };
    conflictResults.set(identity, result);
    applyLive(liveSnapshot);
    message = `Conflicts checked directly on GitHub at ${date(result.checkedAt)}. Reviews and checks still use the published snapshot.`;
  } catch (error) { message = `Conflict refresh unavailable: ${error.message}. Last displayed evidence is retained.`; }
  finally {
    conflictRequest = false; drawDetails();
    const output = document.querySelector(`[data-conflict-message="${identity}"]`);
    if (output) output.textContent = message;
  }
}

function appendCrossReferences(section, pr) {
  const references = pr.crossReferences;
  if (!references) return;
  if (references.items.length) {
    const details = element("details", "review-history");
    details.append(element("summary", "", `Cross-referenced public PRs (${references.items.length})`),
      element("p", "detail-meta", "References are evidence to inspect; they do not establish a dependency, replacement or approval."));
    for (const event of references.items) {
      const source = event.source;
      details.append(link(`${source.repository.nameWithOwner}#${source.number} · ${source.title} ↗`, source.url),
        element("p", "detail-meta", `${source.author?.login || "Unknown author"} · referenced ${date(event.createdAt)} · observed head ${source.headRefOid.slice(0, 9)}`),
        element("p", "detail-description", source.body));
    }
    section.append(details);
  }
  if (!references.complete) section.append(element("p", "detail-meta", "Cross-reference inventory incomplete; only the latest 100 timeline references were checked."));
}

function appendAttributes(container, node) {
  if (node.type !== "pr") return;
  const section = element("section", "detail-section pr-attributes"), pr = node.github;
  section.append(element("h3", "", "PR attributes"));
  if (!pr) { section.append(element("p", "detail-description", "No published GitHub attributes for this PR yet. Reloading uses the latest published snapshot.")); container.append(section); return; }
  section.append(badge(reviewInfo(pr, node), "Fresh-head approval and verified approval of an unchanged rebased patch are distinct. Labels and comments do not grant approval."));
  const patch = approvedPatch(node);
  if (patch) section.append(element("p", "detail-meta", `Unchanged patch approved by ${patch.reviewer} at ${date(patch.submittedAt)} on ${patch.approvedHead.slice(0, 9)}; mechanical equivalence to ${patch.head.slice(0, 9)} verified ${date(patch.verifiedAt)}. This is not a new review submission.`));
  const landed = landedPatch(node);
  if (landed) {
    section.append(element("p", "detail-meta", `Landed; source PR still open. Exact patch replay left upstream ${landed.upstreamHead.slice(0, 12)} unchanged, verified ${date(landed.verifiedAt)}. No maintainer action is needed.`));
    for (const url of landed.evidence) section.append(link("Landing evidence ↗", url));
  }
  const requests = pr.reviewRequests || [];
  if (requests.length) section.append(element("p", "detail-meta", `Review requested from: ${requests.map(item => item.login || item.name || item.slug).join(", ")}`));
  if (pr.reviewRequestsComplete === false) section.append(element("p", "detail-meta", "Review-request inventory incomplete."));
  const approvals = (pr.feedback?.items || []).filter(item => item.kind === "review" && item.state === "APPROVED");
  if (approvals.length) {
    const history = element("details", "review-history"); history.append(element("summary", "", "Approval history"));
    for (const item of approvals) {
      const head = item.commit?.oid;
      history.append(link(`${item.author?.login || "Unknown reviewer"} · submitted ${item.submittedAt ? date(item.submittedAt) : "time not recorded"} · GitHub-recorded commit ${head?.slice(0, 9) || "not recorded"}`, item.url), element("br"));
    }
    history.append(element("p", "detail-meta", "GitHub can reassociate an older review with a rebased commit. Fresh-head approval requires a submission after this head was introduced; later reviews, dismissals and review requests still apply."));
    section.append(history);
  }
  const threads = pr.threads;
  section.append(element("p", "detail-meta", threads.complete ? `${threads.unresolved} unresolved review threads` : `Thread count incomplete: ${threads.unresolved} unresolved among ${Math.min(100, threads.total)} of ${threads.total} threads.`));
  section.append(element("p", "detail-meta conflict-description", mergeDescription(pr)));
  if (pr.revisionChanged) section.append(element("p", "detail-meta", "GitHub has a newer source head than the published snapshot. Review, checks and import eligibility are unavailable for this revision until the next collection."));
  const refreshButton = button("Check conflicts on GitHub", () => refreshConflict(pr.number, prRepo(pr)));
  refreshButton.disabled = conflictRequest;
  refreshButton.dataset.conflictRefresh = prIdentity(pr);
  const refreshMessage = element("p", "detail-meta"); refreshMessage.dataset.conflictMessage = prIdentity(pr); refreshMessage.setAttribute("role", "status");
  section.append(refreshButton, refreshMessage);
  const labels = element("div", "label-list");
  for (const name of pr.labels) labels.append(badge({ text: name, tone: "label" }));
  if (!pr.labels.length) labels.append(element("span", "attribute-unknown", "No labels reported"));
  if (!pr.labelsComplete) labels.append(element("span", "attribute-unknown", "Label list incomplete"));
  section.append(labels, element("p", "detail-meta", `Snapshot ${date(pr.checkedAt)} · activity ${date(pr.updatedAt)}`), link(`Source head ${pr.head.slice(0, 9)} ↗`, `https://github.com/${node.repo}/commit/${pr.head}`, "detail-meta"));
  appendChecks(section, pr, "Original PR checks");
  appendCrossReferences(section, pr);
  if (!usesImports(pr)) { container.append(section); return; }
  section.append(element("h4", "", "Verified import PRs"));
  for (const imported of pr.imports) {
    const block = element("div", "import-detail");
    const recovery = blockedImportRetry(node, imported);
    if (recovery) block.append(element("p", "detail-meta", `Maintainer CI retry needed. ${recovery.detail}`), link("Failed import job ↗", recovery.jobURL));
    block.append(link(`#${imported.number} · ${imported.status} ↗`, imported.url), element("p", "detail-meta", imported.matchesSourceHead
      ? `Copybara footer matches source ${imported.sourceHead.slice(0, 9)}.`
      : `Older source: ${imported.sourceHead.slice(0, 9)}; current PR is ${pr.head.slice(0, 9)}. These checks do not validate the current source.`));
    block.append(element("p", "detail-meta", mergeDescription(imported)));
    block.append(element("p", "detail-meta", `Import head ${imported.head.slice(0, 9)} · snapshot ${date(imported.checkedAt)}`));
    appendChecks(block, imported, "Import PR checks"); section.append(block);
  }
  if (!pr.imports.length) section.append(element("p", "detail-description", pr.importsComplete ? "No linked import PR found. An internal Copybara CL or import status is not a verified public import PR." : "Import relationship lookup is incomplete; no link is assumed."));
  if (!pr.importsComplete && pr.imports.length) section.append(element("p", "detail-meta", "Only the latest 100 cross-references were checked; older imports may exist."));
  container.append(section);
}
function resolved(node) { return node.type === "pr" && ["merged", "closed"].includes(node.status) || node.type === "investigation" && node.status === "concluded"; }
function providerClosed(node) {
  return node.type === "pr" && ["merged", "closed"].includes(node.github?.status || node.status)
    || node.type === "issue" && node.githubState === "closed";
}
function historical(node) {
  // A past delivery never hides a new decision or a live public PR. Curated
  // branch history is explicit: freeform status text can also describe work
  // that is still blocked, waiting for review or being validated.
  if (contributorDecision(node) || contributorChanges(node) || humanAction(node) || node.issueFeedback?.length || node.status === "Agent work") return false;
  if (node.type === "pr" || node.type === "issue" && ["open", "closed"].includes(node.githubState)) return providerClosed(node);
  return node.inactive === true || ["resolved", "merged", "closed", "concluded", "withdrawn", "retired", "superseded"].includes(node.status?.toLowerCase());
}
function visibleHistory(node) {
  return !historical(node) || $("show-resolved").checked || node.id === selected || node.id === focus;
}
function nodeMap() { return new Map(model.nodes.map((node) => [node.id, node])); }
function investigationMap() { return new Map((registry.investigations || []).map(item => [item.id, item])); }
function selectionMap() { return view === "investigations" ? investigationMap() : new Map([...nodeMap(), ...(view === "table" && tableGrouping ? [...ATTENTION_REASONS, ...OTHER_ATTENTION_GROUPS].map(group => [`attention-${group.id}`, group]) : [])]); }
function activeDependencyEdges() {
  const active = new Set(model.nodes.filter((node) => !historical(node) && !providerClosed(node)).map((node) => node.id));
  return model.edges.filter((edge) => ["depends_on", "blocked_by"].includes(edge.type) && active.has(edge.from) && active.has(edge.to));
}
// Reach depends on the snapshot's active blockers, even when a search shows
// historical neighbors. Reuse it across the graph layout and table sorts.
let reachIndex;
function impact(id) {
  if (reachIndex?.model !== model) {
    const dependents = new Map();
    for (const edge of activeDependencyEdges()) {
      if (!dependents.has(edge.from)) dependents.set(edge.from, new Set());
      dependents.get(edge.from).add(edge.to);
    }
    reachIndex = { model, dependents, nodes: nodeMap(), results: new Map() };
  }
  const { dependents, nodes, results } = reachIndex;
  if (!results.has(id)) {
    const direct = dependents.get(id) || [], seen = new Set([id]);
    for (const current of seen) for (const other of dependents.get(current) || []) seen.add(other);
    seen.delete(id);
    const reached = [...seen].map(other => nodes.get(other)?.type);
    results.set(id, { direct: [...direct].filter(other => nodes.get(other)?.type === "pr").length,
      prs: reached.filter(type => type === "pr").length, branches: reached.filter(type => type === "branch").length });
  }
  return results.get(id);
}
function displayDependencyEdges() {
  const selectedHistory = [selected, focus].some(id => { const node = nodeMap().get(id); return node && historical(node); });
  return $("show-resolved").checked || selectedHistory
    ? model.edges.filter(edge => ["depends_on", "blocked_by"].includes(edge.type)) : activeDependencyEdges();
}
function components(edges = displayDependencyEdges()) {
  const remaining = new Set(edges.flatMap((edge) => [edge.from, edge.to])), result = [];
  const nodes = nodeMap();
  while (remaining.size) {
    const first = remaining.values().next().value, members = [first]; remaining.delete(first);
    for (const id of members) for (const edge of edges) {
      const other = edge.from === id ? edge.to : edge.to === id ? edge.from : null;
      if (remaining.has(other)) { remaining.delete(other); members.push(other); }
    }
    const leaders = members.map((id) => nodes.get(id)).sort((a, b) => impact(b.id).prs - impact(a.id).prs || a.title.localeCompare(b.title));
    const root = leaders[0];
    const sink = members.find((id) => !edges.some((edge) => edge.from === id));
    result.push({ ids: new Set(members), id: root.id, score: impact(root.id).prs,
      title: impact(root.id).prs ? `${label(root)} · ${root.title}` : (nodes.get(sink) || root).title });
  }
  return result.sort((a, b) => b.score - a.score || b.ids.size - a.ids.size);
}
function matchesBase(node) {
  const search = $("search").value.trim().toLowerCase(), group = $("group-filter").value;
  return (!group || node.group === group) && (!search || `${label(node)} ${node.title} ${node.number || ""} ${node.ref || ""} ${node.summary || ""}`.toLowerCase().includes(search));
}
function states(node) { return node.workStates || {}; }
function matches(node) {
  if (!matchesBase(node) || (model.statesAvailable && stateFilters.size && ![...stateFilters].some(state => states(node)[state]))) return false;
  if (!reasonFilters.size) return true;
  const reasons = attentionReasons(node, registry.meta.owner);
  return reasonFilters.has("queue-" + (primaryAttention(reasons)?.owner || "other")) || reasons.some(reason => reasonFilters.has(reason.id));
}
function filtered() { return $("search").value.trim() || $("group-filter").value || (model.statesAvailable && stateFilters.size) || reasonFilters.size; }
function age(record) {
  if (record.basis === "unknown") return "age unknown";
  const minutes = Math.max(0, Math.floor((Date.parse(record.observedAt || model.checkedAt) - Date.parse(record.since)) / 60000));
  const duration = minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
  return `${record.basis === "observed" ? "obs " : ""}${duration}`;
}
function failureSources(node) {
  const pr = node.github;
  if (!pr) return [];
  return [pr, ...unresolvedImportChecks(importLineage(node))]
    .filter(item => [...codeCheckStates(item)].some(state => FAILURE_STATES.has(state)))
    .map(item => ({ ...item, failureLabel: item === pr ? "PR checks failing" : `Import #${item.number} failing` }));
}
function contributorChanges(node) {
  const decision = node.contributorChangesRequested;
  return node.type === "branch" && decision?.head === node.head ? decision : null;
}
// Code approval is for a commit. Reviews and replies can contain different
// messages about the same commit, so their text is part of the decision too.
function alreadyReviewed(node, decision) {
  return node.settledReviews?.some(item => item.kind === decision.kind && item.head === decision.head
    && (!["review", "reply", "issue"].includes(item.kind) || item.body === decision.body)
    && (item.kind !== "issue" || item.url === decision.url && item.title === decision.title));
}
function commitLinkMatches(repo, head, url) {
  const prefix = `https://github.com/${repo}/commit/`;
  return typeof head === "string" && (url === prefix + head || url === prefix + head.slice(0, 9));
}
function trackerMaintenance(node) {
  return node.type === "branch" && node.repo === "tamird/sty" &&
    (node.id?.startsWith("branch:work-map-") || /^(tracker\/|review\/work-map-)/.test(node.ref || ""));
}
function pendingDecisions(node) {
  if (trackerMaintenance(node)) return [];
  const decisions = node.contributorReview ? [node.contributorReview] : [];
  return decisions.concat(node.additionalReviews || []).filter(decision => decision?.status === "pending" && !alreadyReviewed(node, decision) && (node.type === "branch" && decision.head === node.head
    || node.type === "pr" && decision.kind === "amendment" && !providerClosed(node) && decision.head !== node.github?.head
    || node.type === "investigation" && node.status === "active" && ["issue", "proposal"].includes(decision.kind)
    || ["pr", "issue"].includes(node.type) && ["reply", "issue"].includes(decision.kind)
    || node.type === "pr" && decision.kind === "review" && !providerClosed(node)));
}
function decisionReason(decision) {
  if (decision.kind === "review") return "post-review";
  if (["reply", "issue"].includes(decision.kind)) return "post-reply";
  return "review-changes";
}
function visibleDecisions(node) {
  const filtering = DECISION_REASONS.some(reason => reasonFilters.has(reason.id));
  return pendingDecisions(node).filter(decision => !filtering || reasonFilters.has(
    contributorDecisionNeedsRefresh(node, decision) ? "agent-refresh" : decisionReason(decision)));
}
function contributorDecision(node) {
  const pending = pendingDecisions(node);
  return pending.find(decision => !contributorDecisionNeedsRefresh(node, decision)) || pending[0] || null;
}
function contributorDecisionHeadChanged(node, decision = contributorDecision(node)) {
  const head = decision?.kind === "amendment" ? decision.baseHead : decision?.head;
  return Boolean(node.github?.head && head && head !== node.github.head);
}
function contributorDecisionNeedsRefresh(node, decision = contributorDecision(node)) {
  return ["amendment", "review"].includes(decision?.kind) && contributorDecisionHeadChanged(node, decision);
}
function validateHumanAction(node, retiredExecution = false) {
  const action = node.humanAction;
  if (action !== undefined && (!action || action.status !== "pending"
      || !/^[a-f0-9]{40}$/.test(action.head) || action.head !== node.head
      || ![action.title, action.summary, action.body].every(value => typeof value === "string" && value.trim())
      || !safeURL(action.url) || !(retiredExecution || action.kind === "submission" && safeURL(action.policyURL))
      || node.contributorReview !== undefined))
    throw new Error("Invalid human-only action");
}
function humanAction(node) {
  const action = node.humanAction;
  return action?.status === "pending" && action.kind === "submission" && action.head === node.head ? action : null;
}
function submissionLink(action, className) {
  const title = new URL(action.url).pathname.includes("/compare/") ? "Open prefilled pull request" : "Open submission context";
  return link(title + " ↗", action.url, className);
}
function contributorDecisionURL(node, reason) {
  const url = new URL(location.href);
  url.search = `?view=table&reason=${reason}`;
  url.hash = encodeURIComponent(node.id);
  return url.href;
}
function stateLabel(node, state) {
  if (state === "contributor-review") {
    const decisions = visibleDecisions(node).filter(decision => !contributorDecisionNeedsRefresh(node, decision));
    return decisions.length > 1 ? `${decisions.length} separate review decisions` : decisions[0]?.title || STATE_LABELS[state];
  }
  if (state === "changes-requested" && contributorChanges(node)) return "Contributor changes requested";
  if (state === "failing") return failureSources(node).map(item => item.failureLabel).join("; ") || STATE_LABELS[state];
  return STATE_LABELS[state];
}
function stateTitle(state, record) {
  if (record.basis === "unknown") return `${STATE_LABELS[state]} · Revision not recorded; state age unknown.`;
  return `${STATE_LABELS[state]} · ${record.basis === "observed" ? "Observed since" : "Transition recorded"} ${date(record.since)}. ${record.basis === "observed" ? "First observation in the retained interval; the state may have begun earlier. Continuity between snapshots is unknown." : "GitHub transition timestamp."} State observed ${date(record.observedAt || model.checkedAt)}.`;
}
function appendStates(parent, node, detail = false) {
  for (const [state, record] of Object.entries(states(node))) {
    const qualifier = state === "failing" || (state === "importing" && !detail) ? "" : record.qualifier;
    const text = `${stateLabel(node, state)} ${age(record)}${qualifier ? " · " + qualifier : ""}`;
    const failures = state === "failing" ? failureSources(node) : [];
    const decision = state === "contributor-review" ? visibleDecisions(node).find(item => !contributorDecisionNeedsRefresh(node, item)) : state === "changes-requested" ? contributorChanges(node) : null;
    const url = failures[0]?.url || (state === "author-feedback" && record.url) || (state === "contributor-review" && decision && decisionReason(decision) !== "review-changes"
      ? contributorDecisionURL(node, decisionReason(decision)) : decision?.url);
    const item = url ? link(text, url, `work-state ${state}`) : element("span", `work-state ${state}`, text);
    item.title = stateTitle(state, record) + (record.qualifier ? " " + record.qualifier : "");
    if (detail && record.basis !== "unknown") item.append(element("small", "state-origin", `${record.basis === "observed" ? "Observed since" : "Since"} ${date(record.since)}`));
    parent.append(item);
    if (detail) for (const source of failures) {
      const row = element("div", "state-failure-links");
      row.append(link(source.failureLabel, source.url), document.createTextNode(": "));
      for (const check of failedValidationChecks(source)) {
        row.append(check.url ? link(check.name, check.url) : element("span", "", `${check.name} (no public log URL)`), document.createTextNode("; "));
      }
      parent.append(row);
    }
  }
}
function drawStateFilters() {
  // Initial snapshot loading precedes creation of the attention controls.
  if (initializing) return;
  const counts = new Map(ATTENTION_REASONS.map(reason => [reason.id, 0]));
  const totals = Object.fromEntries(Object.keys(ATTENTION_OWNERS).map(owner => [owner, 0]));
  const candidates = model.nodes.filter(node => matchesBase(node) && visibleHistory(node));
  for (const node of candidates) {
    const reasons = attentionReasons(node, registry.meta.owner);
    totals[primaryAttention(reasons)?.owner || "other"]++;
    for (const reason of reasons) counts.set(reason.id, counts.get(reason.id) + 1);
  }
  for (const control of $("state-filters").querySelectorAll("input[data-reason]")) {
    control.checked = reasonFilters.has(control.dataset.reason);
    control.nextElementSibling.textContent = `${ATTENTION_REASONS.find(reason => reason.id === control.dataset.reason).title} ${counts.get(control.dataset.reason)}`;
  }
  $("all-reasons").textContent = `All ${candidates.length}`;
  $("all-reasons").setAttribute("aria-pressed", !reasonFilters.size && !stateFilters.size);
  for (const [owner, count] of Object.entries(totals)) {
    $(`attention-${owner}-summary`).textContent = `${ATTENTION_OWNERS[owner]} · ${count}`;
  }
  $("queue-counts-note").hidden = Boolean(model.statesAvailable);
  $("legacy-state-filter").hidden = !stateFilters.size;
  $("legacy-state-filter").textContent = stateFilters.size ? `Shared legacy state filter: ${[...stateFilters].map(key => STATE_LABELS[key]).join(", ")}. Reset to clear.` : "";
}

function stateAge(node) {
  const records = Object.entries(states(node)).filter(([state, record]) => record.basis !== "unknown" && (!stateFilters.size || stateFilters.has(state)));
  return records.length ? Math.max(...records.map(([, record]) => Date.parse(record.observedAt || model.checkedAt) - Date.parse(record.since))) : -1;
}
const URL_FIELDS = ["view", "state", "reason", "group-by", "sort", "order", "q", "group", "history", "resolved", "focus", "investigation-status"];
function selectedFromURL() {
  try { return decodeURIComponent(location.hash.slice(1)) || null; } catch { return null; }
}
function currentViewURL(selection = selected) {
  const url = new URL(location.href); url.search = "";
  url.searchParams.set("view", view);
  if ($("show-resolved").checked) url.searchParams.set("history", "1");
  if (view === "investigations") {
    if ($("investigation-search").value) url.searchParams.set("q", $("investigation-search").value);
    if ($("investigation-filter").value) url.searchParams.set("investigation-status", $("investigation-filter").value);
  } else {
    for (const state of FILTER_STATES) if (stateFilters.has(state)) url.searchParams.append("state", state);
    for (const reason of ATTENTION_REASONS) if (reasonFilters.has(reason.id)) url.searchParams.append("reason", reason.id);
    for (const queue of QUEUE_FILTERS) if (reasonFilters.has(queue)) url.searchParams.append("reason", queue);
    if (view === "table") {
      if (tableGrouping) url.searchParams.set("group-by", "attention");
      if (sortKey !== "impact") url.searchParams.set("sort", sortKey);
      if (sortDirection === 1) url.searchParams.set("order", "asc");
    }
    if ($("search").value) url.searchParams.set("q", $("search").value);
    if ($("group-filter").value) url.searchParams.set("group", $("group-filter").value);
    if (focus) url.searchParams.set("focus", focus);
  }
  url.hash = selection ? encodeURIComponent(selection) : "";
  return url.pathname + url.search + url.hash;
}
function readViewURL() {
  const params = new URL(location.href).searchParams;
  return { explicit: URL_FIELDS.some(key => params.has(key)),
    view: params.get("view") === "handoff" ? "table" : VIEWS.includes(params.get("view")) ? params.get("view") : "table",
    tableGrouping: params.get("view") === "handoff" || params.get("group-by") === "attention",
    reasonFilters: params.getAll("reason"), sortKey: params.get("sort") || "impact", sortDirection: params.get("order") === "asc" ? 1 : -1,
    stateFilters: params.getAll("state"), search: params.get("q") || "", group: params.get("group") || "",
    investigationStatus: params.get("investigation-status") || "",
    history: params.get("history") === "1" || params.get("resolved") === "1" ||
      !params.has("history") && params.get("view") === "investigations" && params.get("investigation-status") === "concluded", selected: selectedFromURL(), focus: params.get("focus") || null };
}
function applyView(saved) {
  view = saved.view === "handoff" ? "table" : VIEWS.includes(saved.view) ? saved.view : "table";
  tableGrouping = saved.view === "handoff" || saved.tableGrouping === true;
  // Older links and saved views used one filter for all contributor decisions.
  const reasons = (Array.isArray(saved.reasonFilters) ? saved.reasonFilters : []).flatMap(id => id === "author-proposal" ? DECISION_REASONS.map(reason => reason.id) : [id]);
  reasonFilters = new Set(reasons.filter(id => QUEUE_FILTERS.includes(id) || ATTENTION_REASONS.some(reason => reason.id === id)));
  sortKey = SORT_KEYS.includes(saved.sortKey) ? saved.sortKey : "impact"; sortDirection = saved.sortDirection === 1 ? 1 : -1;
  if (saved.selected?.startsWith("handoff-")) saved = { ...saved, selected: `attention-${LEGACY_HANDOFF_GROUPS[saved.selected.slice(8)] || saved.selected.slice(8)}` };
  const validID = id => typeof id === "string" && /^[^\s]{1,240}$/.test(id) ? id : null;
  const ids = nodeMap();
  $("show-resolved").checked = saved.history === true || saved.history === undefined &&
    (saved.resolved === true || view === "investigations" && saved.investigationStatus === "concluded");
  // URLs affect their displayed area. Saved preferences can retain both areas
  // without letting hidden PR filters change an investigation's results.
  if (view !== "investigations" || typeof saved.workSearch === "string") {
    stateFilters = new Set((Array.isArray(saved.stateFilters) ? saved.stateFilters : []).flatMap(state =>
      state === "review" ? ["contributor-review", "maintainer-review"] : [state]).filter(state => FILTER_STATES.includes(state)));
    $("search").value = typeof saved.workSearch === "string" ? saved.workSearch : typeof saved.search === "string" ? saved.search : "";
    $("group-filter").value = [...$("group-filter").options].some(option => option.value === saved.group) ? saved.group : "";
    focus = ids.has(validID(saved.focus)) ? saved.focus : null;
  }
  if (view === "investigations" || typeof saved.investigationSearch === "string") {
    $("investigation-search").value = typeof saved.investigationSearch === "string" ? saved.investigationSearch : typeof saved.search === "string" ? saved.search : "";
    $("investigation-filter").value = ["active", "concluded"].includes(saved.investigationStatus) ? saved.investigationStatus : "";
  }
  selected = selectionMap().has(validID(saved.selected)) ? saved.selected : null;
  if (view === "investigations" && selected && !investigationMatches(investigationMap().get(selected))) selected = null;
}
function syncViewURL(navigation) {
  if (initializing) return;
  const next = currentViewURL();
  if (next !== location.pathname + location.search + location.hash) history[navigation === "push" ? "pushState" : "replaceState"](null, "", next);
  lastNavigationURL = location.href;
}
function saveView() {
  if (initializing) return;
  try { localStorage.setItem(UI_KEY, JSON.stringify({ url: currentViewURL(), view, tableGrouping, reasonFilters: [...reasonFilters], stateFilters: [...stateFilters], selected, focus, camera, sortKey, sortDirection,
    search: view === "investigations" ? $("investigation-search").value : $("search").value,
    workSearch: $("search").value, investigationSearch: $("investigation-search").value, investigationStatus: $("investigation-filter").value,
    group: $("group-filter").value, history: $("show-resolved").checked })); } catch { /* Storage is optional. */ }
}
function restoreView() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(UI_KEY)); } catch { /* Invalid preferences are ignored. */ }
  const url = readViewURL();
  if (saved) applyView(saved);
  if (url.explicit) applyView(url);
  else if (!(saved && (!url.selected || url.selected === saved.selected)))
    applyView({ ...url, focus: url.selected });
  // Recipient preferences cannot override an explicit shared view. A reload
  // of this same view may still restore its local pan and zoom.
  const sameView = saved && (url.explicit ? saved.url === currentViewURL() : !url.selected || url.selected === saved.selected);
  if (!sameView) return false;
  if ([...document.querySelectorAll("[data-sort]")].some(control => control.dataset.sort === saved.sortKey)) sortKey = saved.sortKey;
  sortDirection = saved.sortDirection === 1 ? 1 : -1;
  if (![saved.camera?.x, saved.camera?.y, saved.camera?.scale].every(Number.isFinite) || saved.camera.scale < .12 || saved.camera.scale > 2.5) return false;
  camera = saved.camera; return true;
}
function navigateFromURL() {
  if (location.href !== lastNavigationURL) {
    const url = readViewURL(); applyView(url.explicit ? url : { ...url, focus: url.selected });
    const ids = nodeMap();
    if (!selectionMap().has(selected)) selected = null;
    if (!ids.has(focus)) focus = null;
    searchEditing = false; render(true);
  }
  // Native fragment navigation can emit both popstate and hashchange. Keep
  // focus on its current card even when the first event already rendered it.
  if (view === "investigations" && selected)
    document.getElementById(selected)?.focus({ preventScroll: true });
}
function buildkiteFailureLabel(row) {
  if (row.failedState === "timed_out") return "Timed out";
  if (row.failedState === "expired") return "Expired";
  return row.exitCode == null ? "Failed" : `Exit ${row.exitCode}`;
}

function tableNodes() { return model.nodes.filter((node) => matches(node) && visibleHistory(node)); }
function investigationNextStep(item) {
  if (!item.defaultBranchCheck || item.status !== "active") return item.nextStep;
  const check = liveSnapshot?.defaultBranchChecks?.[item.id];
  if (!check) return "Wait for a status observation on the current default branch.";
  if (check.state === "SUCCESS") return item.defaultBranchCheck.onSuccess;
  if (["PENDING", "EXPECTED", "MISSING"].includes(check.state)) return "Wait for a completed status on this commit.";
  return item.nextStep;
}
function investigationMatches(item) {
  const query = $("investigation-search").value.trim().toLowerCase(), state = $("investigation-filter").value;
  const group = registry.groups?.find(entry => entry.id === item.group);
  const text = [item.title, group?.label || "", item.owner, item.summary, investigationNextStep(item) || "", ...item.findings.map(finding => finding.text),
    ...(item.comparisons || []).flatMap(comparison => [comparison.title, comparison.description, comparison.note, ...comparison.columns, ...comparison.rows.flat()])].join(" ").toLowerCase();
  return visibleHistory(item) && (!state || item.status === state) && (!query || text.includes(query));
}
function investigationEvidence(sources) {
  const evidence = element("div", "investigation-evidence");
  for (const source of sources) evidence.append(link(source.label + " ↗", source.url));
  return evidence;
}
function appendCIFlakeScan(card, scan) {
  if (!scan) {
    card.append(element("p", "comparison-note", "No Buildkite scan is available in this snapshot."));
    return;
  }
  const section = element("details", "investigation-comparison");
  section.append(element("summary", "", `Recovered Buildkite jobs (${scan.observations.length})`));
  section.append(element("p", "comparison-note", `Scan at ${date(scan.checkedAt)}`));
  const coverage = element("ul");
  for (const [name, state] of Object.entries(scan.pipelines)) {
    const line = element("li"); line.append(link(name, `https://buildkite.com/gvisor/${name}/builds`));
    const facts = [];
    if (state.nextBuild > state.firstBuild) facts.push(`sequential scan #${state.firstBuild}–${state.nextBuild - 1}`);
    if (state.recentBuilds?.length) facts.push(`checked ahead ${state.recentBuilds.map(number => "#" + number).join(", ")}`);
    if (state.latest >= state.nextBuild) facts.push(`sequential scan has ${state.latest - state.nextBuild + 1} builds through #${state.latest} remaining`);
    if (state.pending?.length) facts.push(`${state.pending.length} to revisit`);
    if (state.unobservedBuilds?.length) facts.push(`${state.unobservedBuilds.length} unobserved`);
    if (state.missingBuilds?.length) facts.push(`${state.missingBuilds.length} missing`);
    if (state.error) facts.push(state.error);
    line.append(` · ${facts.join(", ") || state.status}`); coverage.append(line);
  }
  section.append(coverage);
  if (scan.observations.length) {
    const table = element("table", "comparison-table"), header = element("tr");
    const caption = element("caption");
    caption.append(element("span", "", "Buildkite linked each failed job to a passing retry on the same commit. A job can contain many tests."));
    for (const text of ["Job", "Build / PR", "Attempts", "Recovered"]) {
      const cell = element("th", "", text); cell.scope = "col"; header.append(cell);
    }
    const head = element("thead"); head.append(header); table.append(caption, head);
    const body = element("tbody");
    const sorted = [...scan.observations].sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt));
    function appendRow(row) {
      const url = `https://buildkite.com/gvisor/${row.pipeline}/builds/${row.build}`;
      const tr = element("tr"), job = element("th", "", row.job); job.scope = "row";
      const build = element("td"); build.append(link(`${row.pipeline} #${row.build}`, url));
      if (row.pr) build.append(" · ", link(`PR #${row.pr}`, `https://github.com/google/gvisor/pull/${row.pr}`));
      const attempts = element("td");
      attempts.append(link(buildkiteFailureLabel(row), `${url}#${row.failedJob}`),
        " → ", link("Passed", `${url}#${row.passedJob}`));
      tr.append(job, build, attempts, element("td", "", date(row.finishedAt))); body.append(tr);
    }
    sorted.slice(0, 25).forEach(appendRow);
    table.append(body); section.append(table);
    if (sorted.length > 25) {
      const older = element("button", "", `Show ${sorted.length - 25} older recoveries`);
      older.type = "button";
      older.addEventListener("click", () => {
        sorted.slice(25).forEach(appendRow);
        older.remove();
      });
      section.append(older);
    }
  }
  card.append(section);
  if (scan.actions) {
    const actions = element("details", "investigation-comparison");
    actions.append(element("summary", "", `Recovered GitHub Actions jobs (${scan.actions.observations.length})`));
    const coverage = [scan.actions.sample || "Rotating sample of PR validation workflows"];
    if (scan.actions.checkedAt) coverage.push(`Last successful read ${date(scan.actions.checkedAt)}.`);
    if (scan.actions.pending?.length) coverage.push(`${scan.actions.pending.length} retried runs awaiting job details.`);
    if (scan.actions.error) coverage.push(scan.actions.error);
    else if (!scan.actions.checkedAt) coverage.push("No workflow sample recorded yet.");
    actions.append(element("p", "comparison-note", coverage.join(" ")));
    if (Number.isSafeInteger(scan.actions.partialRun?.run)) {
      const line = element("p", "comparison-note");
      line.append("The available job page was incomplete for ", link(`run #${scan.actions.partialRun.run}`,
        `https://github.com/google/gvisor/actions/runs/${scan.actions.partialRun.run}`), ".");
      actions.append(line);
    }
    for (const row of scan.actions.observations) {
      const p = element("p", "", `${row.workflow} / ${row.job} · `);
      const base = `https://github.com/google/gvisor/actions/runs/${row.run}/job/`;
      p.append(link("Failed", base + row.failedJob), " → ", link("Passed", base + row.passedJob),
        " · ", link(row.head.slice(0, 9), `https://github.com/google/gvisor/commit/${row.head.slice(0, 9)}`),
        ` · ${date(row.finishedAt)}`);
      if (row.pr) p.append(" · ", link(`PR #${row.pr}`, `https://github.com/google/gvisor/pull/${row.pr}`));
      actions.append(p);
    }
    card.append(actions);
    const reports = scan.actions.reports;
    if (reports) {
      const list = element("details", "investigation-comparison");
      const visibleReports = reports.items.filter(item => item.state === "open" || $("show-resolved").checked);
      list.append(element("summary", "", `Reported in issues and PRs (${visibleReports.length})`));
      list.append(element("p", "comparison-note", reports.sample));
      if (reports.checkedAt) list.append(element("p", "comparison-note", `Search at ${date(reports.checkedAt)}.`));
      if (reports.hasMore) list.append(element("p", "comparison-note", `Sampled the latest ${reports.items.length} of ${reports.total} matches.`));
      if (reports.error) list.append(element("p", "comparison-note", reports.error));
      const items = element("ul");
      for (const item of visibleReports) {
        const row = element("li");
        row.append(link(`#${item.number} ${item.title}`, item.url), ` · ${item.state} ${item.kind === "pr" ? "PR" : "issue"}`);
        items.append(row);
      }
      list.append(items); card.append(list);
    }
  }
}
function drawInvestigations() {
  const list = $("investigation-list"); list.replaceChildren();
  const nodes = nodeMap();
  const items = [...investigationMap().values()].filter(investigationMatches)
    .sort((a, b) => (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  for (const item of items) {
    const card = element("article", `investigation-card${selected === item.id ? " selected" : ""}`); card.id = item.id; card.tabIndex = -1;
    const heading = element("h2"), control = element("a", "investigation-title", item.title);
    control.href = currentViewURL(item.id); control.title = "Link to this investigation";
    control.dataset.investigation = item.id; control.setAttribute("aria-current", selected === item.id ? "true" : "false"); heading.append(control);
    card.append(heading, badge({ text: item.status === "active" ? "Active" : "Concluded", tone: item.status === "active" ? "pending" : "good" }),
      element("span", "investigation-meta", `Owner: ${item.owner} · updated ${date(item.updatedAt)}`), element("p", "investigation-summary", item.summary));
    if (item.comparisons?.length) card.append(element("h3", "", "Verified comparisons"));
    for (const comparison of item.comparisons || []) {
      const section = element("section", "investigation-comparison"), table = element("table", "comparison-table");
      const caption = element("caption");
      caption.append(element("strong", "", comparison.title), element("span", "", comparison.description));
      const header = element("thead"), headings = element("tr");
      for (const column of comparison.columns) { const cell = element("th", "", column); cell.scope = "col"; headings.append(cell); }
      header.append(headings);
      const body = element("tbody");
      for (const values of comparison.rows) {
        const row = element("tr");
        values.forEach((value, index) => { const cell = element(index ? "td" : "th", "", value); if (!index) cell.scope = "row"; row.append(cell); });
        body.append(row);
      }
      table.append(caption, header, body);
      section.append(table, element("p", "comparison-note", comparison.note), investigationEvidence(comparison.evidence));
      card.append(section);
    }
    const node = nodes.get(item.id);
    if (node) {
      appendContributorDecisions(card, node, pendingDecisions(node));
      appendSettledPublications(card, node);
      appendHumanAction(card, node);
    }
    const appendFinding = (parent, finding) => {
      const section = element("section", "investigation-finding"); section.append(element("p", "", finding.text));
      section.append(investigationEvidence(finding.evidence)); parent.append(section);
    };
    const findings = item.findings.filter(finding => !finding.sourceInventory);
    if (findings.length) card.append(element("h3", "", "Findings"));
    for (const finding of findings) appendFinding(card, finding);
    const sourceFindings = item.findings.filter(finding => finding.sourceInventory);
    if (sourceFindings.length) {
      const section = element("details", "investigation-comparison");
      section.append(element("summary", "", `${sourceFindings.length} source review units`));
      for (const finding of sourceFindings) appendFinding(section, finding);
      card.append(section);
    }
    const check = liveSnapshot?.defaultBranchChecks?.[item.id];
    if (check) {
      const line = element("p", "comparison-note");
      line.append(link(check.branch + " " + check.head.slice(0, 9), "https://github.com/" + registry.meta.repo + "/commit/" + check.head), " · ");
      const result = check.context + " · " + (check.state === "MISSING" ? "no status reported" : check.state.toLowerCase());
      line.append(check.url ? link(result, check.url) : result);
      if (check.description) line.append(" · " + check.description);
      card.append(line);
    }
    const nextStep = investigationNextStep(item);
    if (nextStep) card.append(element("h3", "", item.status === "active" ? "Next step" : "Recommendation"), element("p", "", nextStep));
    if (item.evidence.length) {
      card.append(investigationEvidence(item.evidence));
    }
    if (item.id === "investigation:ci-flakes") appendCIFlakeScan(card, liveSnapshot?.ciFlakes);
    list.append(card);
  }
  return items;
}
function graphNodes() {
  const selectedNode = nodeMap().get(selected), historySelection = !$("show-resolved").checked && selectedNode && historical(selectedNode) ? selected : null;
  const target = focus || historySelection, filtering = filtered();
  if (!filtering && !target) return tableNodes();
  const ids = new Set((filtering ? tableNodes() : model.nodes.filter((node) => node.id === target)).map((node) => node.id));
  for (const chain of components()) if ([...chain.ids].some((id) => ids.has(id))) for (const id of chain.ids) ids.add(id);
  return model.nodes.filter((node) => ids.has(node.id));
}
function applyCamera() { $("graph-content").setAttribute("transform", `translate(${camera.x},${camera.y}) scale(${camera.scale})`); saveView(); }
function resetCamera(fit = true, overview = false) {
  if (view !== "dag") return;
  const box = $("graph-stage").getBoundingClientRect();
  const minimum = overview ? .12 : READABLE_SCALE;
  const scale = fit ? Math.max(minimum, Math.min((box.width - 48) / bounds.width, (box.height - 76) / bounds.height, 1.15)) : 1;
  camera = { x: Math.max(24, (box.width - bounds.width * scale) / 2), y: Math.max(24, (box.height - 44 - bounds.height * scale) / 2), scale };
  const target = !overview && bounds.positions.get(focus);
  if (target) {
    camera.x = box.width / 2 - (target.x + CARD.width / 2) * scale;
    camera.y = (box.height - 44) / 2 - (target.y + CARD.height / 2) * scale;
  }
  applyCamera();
}
function moveCamera(origin, from, to, factor) {
  const scale = Math.max(.12, Math.min(2.5, origin.scale * factor)), ratio = scale / origin.scale;
  camera = { x: to.x - (from.x - origin.x) * ratio, y: to.y - (from.y - origin.y) * ratio, scale };
  applyCamera();
}
function zoom(factor, x, y) {
  const box = $("graph-stage").getBoundingClientRect();
  x ??= box.width / 2; y ??= box.height / 2;
  moveCamera(camera, { x, y }, { x, y }, factor);
}
function wrap(text, length = 29, maxLines = 2) {
  const words = text.split(/\s+/), lines = []; let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > length) { lines.push(line); line = word; }
    else line += `${line ? " " : ""}${word}`;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].slice(0, length - 1) + "…"; }
  return lines;
}
function dagLayout(nodes, content) {
  const ids = new Set(nodes.map((node) => node.id)), byId = nodeMap();
  const edges = displayDependencyEdges().filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  const indegree = new Map(nodes.map((node) => [node.id, 0])), depth = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) indegree.set(edge.to, indegree.get(edge.to) + 1);
  const queue = nodes.filter((node) => !indegree.get(node.id)).map((node) => node.id);
  for (const id of queue) for (const edge of edges) if (edge.from === id) {
    depth.set(edge.to, Math.max(depth.get(edge.to), depth.get(id) + 1));
    indegree.set(edge.to, indegree.get(edge.to) - 1);
    if (!indegree.get(edge.to)) queue.push(edge.to);
  }
  if (queue.length !== nodes.length) throw new Error("A recorded dependency cycle cannot be drawn as a DAG. Inspect its relationships in Table.");
  const chains = components(edges), positions = new Map();
  const connected = new Set(chains.flatMap((chain) => [...chain.ids]));
  const isolates = nodes.filter((node) => !connected.has(node.id));
  const grouped = chains.length > 1 || isolates.length > 0;
  const padding = grouped ? 12 : 0, heading = grouped ? 28 : 0;
  const panels = chains.map((chain) => {
    const columns = new Map();
    for (const id of chain.ids) { const level = depth.get(id); if (!columns.has(level)) columns.set(level, []); columns.get(level).push(id); }
    return { chain, columns,
      width: Math.max(...columns.keys()) * CARD.column + CARD.width + 2 * padding,
      height: Math.max(...[...columns.values()].map((column) => column.length)) * CARD.row - (CARD.row - CARD.height) + heading + 2 * padding };
  });
  // Independent items fill the gaps around whole chains. Choose a canvas
  // shape close to the viewport instead of building one long vertical strip.
  isolates.sort((a, b) => a.type.localeCompare(b.type) || (a.number || 0) - (b.number || 0) || a.title.localeCompare(b.title));
  for (const node of isolates) panels.push({ node, width: CARD.width, height: CARD.height });
  const box = $("graph-stage").getBoundingClientRect(), gap = 16;
  const area = panels.reduce((total, panel) => total + (panel.width + gap) * (panel.height + gap), 0);
  const aspect = Math.max(.5, box.width / Math.max(box.height - 44, 1));
  const packingWidth = Math.max((box.width - 48) / READABLE_SCALE, Math.sqrt(area * aspect), 1, ...panels.map((panel) => panel.width));
  const placed = [];
  for (const panel of panels) {
    const candidates = [{ x: 0, y: 0 }, ...placed.flatMap((other) => [
      { x: other.x + other.width + gap, y: other.y }, { x: other.x, y: other.y + other.height + gap },
      { x: 0, y: other.y + other.height + gap }])].sort((a, b) => a.y - b.y || a.x - b.x);
    const spot = candidates.find(({ x, y }) => x + panel.width <= packingWidth && placed.every((other) =>
      x + panel.width + gap <= other.x || other.x + other.width + gap <= x ||
      y + panel.height + gap <= other.y || other.y + other.height + gap <= y));
    Object.assign(panel, spot); placed.push(panel);
    if (panel.node) { positions.set(panel.node.id, spot); continue; }
    if (grouped) {
      const backdrop = svg("g", { "data-chain": panel.chain.id });
      backdrop.append(svg("rect", { class: "chain-panel", x: panel.x, y: panel.y, width: panel.width, height: panel.height, rx: 6 }),
        svg("text", { class: "chain-heading", x: panel.x + padding, y: panel.y + padding + 12 }, wrap(panel.chain.title, Math.floor((panel.width - 2 * padding) / 7), 1)[0]));
      content.append(backdrop);
    }
    const height = panel.height - heading - 2 * padding;
    for (const [level, column] of panel.columns) {
      column.sort((a, b) => impact(b).prs - impact(a).prs || byId.get(a).title.localeCompare(byId.get(b).title));
      const offset = (height - (column.length * CARD.row - (CARD.row - CARD.height))) / 2;
      column.forEach((id, row) => positions.set(id, { x: panel.x + padding + level * CARD.column,
        y: panel.y + padding + heading + offset + row * CARD.row }));
    }
  }
  return { positions, width: Math.max(1, ...placed.map((panel) => panel.x + panel.width)),
    height: Math.max(CARD.height, ...placed.map((panel) => panel.y + panel.height)) };
}
function drawGraph(nodes) {
  const content = $("graph-content"); content.replaceChildren(); $("dag-warning").hidden = true;
  let layout;
  try { layout = dagLayout(nodes, content); }
  catch (error) { $("dag-warning").textContent = error.message; $("dag-warning").hidden = false; return; }
  bounds = layout;
  const { positions } = layout;
  const edges = svg("g", { "aria-hidden": "true" });
  const neighbors = new Map();
  for (const edge of displayDependencyEdges()) {
    const from = positions.get(edge.from), to = positions.get(edge.to); if (!from || !to) continue;
    if (edge.to === selected) neighbors.set(edge.from, "prerequisite");
    if (edge.from === selected) neighbors.set(edge.to, "dependent");
    const x1 = from.x + CARD.width, x2 = to.x, y1 = from.y + CARD.height / 2, y2 = to.y + CARD.height / 2;
    const bend = Math.max((x2 - x1) / 2, 20);
    edges.append(svg("path", { d: `M ${x1},${y1} C ${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`,
      class: `edge ${edge.type}`,
      "data-from": edge.from, "data-to": edge.to }));
  }
  content.append(edges);
  const filtering = filtered();
  for (const node of nodes) {
    const pos = positions.get(node.id);
    const relation = neighbors.get(node.id);
    const group = svg("g", { class: `node ${node.type}${selected === node.id ? " selected" : ""}${relation ? " " + relation : ""}${filtering && !matches(node) ? " context-node" : ""}`,
      transform: `translate(${pos.x},${pos.y})`, role: "group" });
    const card = svg("g", { tabindex: "0", role: "button", "aria-pressed": selected === node.id, "data-node": node.id });
    card.append(svg("rect", { class: "node-shape", width: CARD.width, height: CARD.height, rx: 5 }));
    card.append(svg("text", { class: "node-label", x: 10, y: 15 }, node.type === "branch" ? wrap(status(node), 21, 1)[0] : label(node)));
    const reach = impact(node.id).prs;
    if (reach) card.append(svg("text", { class: "node-reach", x: CARD.width - 33, y: 15, "text-anchor": "end" }, `${reach} downstream`));
    wrap(node.title).forEach((line, index) => card.append(svg("text", { class: "node-title", x: 10, y: 32 + index * 14 }, line)));
    if (node.type === "pr") {
      for (const [x, prefix, info] of [[64, "R", reviewInfo(node.github, node)], [87, "C", checkInfo(node.github)]]) {
        card.append(svg("text", { class: `node-attribute ${info.tone}`, x, y: 15, "aria-hidden": "true" }, `${prefix}${info.glyph}`));
      }
    }
    const entries = Object.entries(states(node));
    const primary = entries.find(([state]) => stateFilters.has(state)) || entries[0];
    const stateLine = primary ? `${stateLabel(node, primary[0])} ${age(primary[1])}${entries.length > 1 ? ` · +${entries.length - 1}` : ""}` : status(node);
    card.append(svg("text", { class: "node-state", x: 10, y: 61 }, wrap(stateLine, 35, 1)[0]));
    const relationLabel = relation === "prerequisite" ? "Prerequisite of the selected task." : relation === "dependent" ? "Depends on the selected task." : "";
    card.setAttribute("aria-label", [`${label(node)}: ${node.title}.`, ...entries.map(([state, record]) => stateTitle(state, record)), relationLabel, "Select details."].filter(Boolean).join(" "));
    card.append(svg("title", {}, `${node.title}\n${status(node)}\n${Object.entries(states(node)).map(([state, record]) => stateTitle(state, record)).join("\n")}${node.type === "pr" ? "\n" + attributeTitle(node) : ""}`));
    card.addEventListener("click", () => { if (!moved) select(node.id); });
    card.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); event.stopPropagation(); select(node.id); } });
    group.append(card);
    const open = svg("a", { href: citationURL(node.url), target: "_blank", rel: "noopener noreferrer", tabindex: "0", class: "node-link", "aria-label": `Open ${label(node)}: ${node.title}` });
    open.append(svg("rect", { class: "node-link-hit", x: CARD.width - 29, y: 1, width: 28, height: 26, rx: 4 }),
      svg("text", { class: "node-outlink", x: CARD.width - 21, y: 18, "aria-hidden": "true" }, "↗"));
    open.addEventListener("click", (event) => { event.stopPropagation(); if (moved && event.detail !== 0) event.preventDefault(); });
    open.addEventListener("keydown", (event) => { if (event.key === "Enter") event.stopPropagation(); });
    group.append(open); content.append(group);
  }
  applyCamera();
}
function drawTable(nodes) {
  const table = $("work-table"), head = table.tHead.rows[0], body = table.tBodies[0]; body.replaceChildren();
  for (const th of head.cells) {
    const key = th.querySelector("button")?.dataset.sort;
    if (key) th.setAttribute("aria-sort", key === sortKey ? (sortDirection === -1 ? "descending" : "ascending") : "none");
  }
  const groups = new Map(model.groups.map((group) => [group.id, group.label]));
  const value = (node) => ({ impact: impact(node.id).prs, direct: impact(node.id).direct, title: node.title,
    age: stateAge(node), status: status(node), review: node.type === "pr" ? reviewInfo(node.github, node).text : "", checks: node.type === "pr" ? checkInfo(node.github).text : "",
    group: groups.get(node.group) || "", number: node.number || 0 })[sortKey];
  nodes.sort((a, b) => (typeof value(a) === "number" ? value(a) - value(b) : String(value(a)).localeCompare(String(value(b)))) * sortDirection || a.title.localeCompare(b.title));
  visibleTableGroups = attentionGroups(nodes, registry.meta.owner, tableGrouping);
  $("handoff-copy-all").disabled = !model.checkedAt || !visibleTableGroups.some(group => group.entries.some(entry => entry.copyURL));
  const copyingDecisions = reasonFilters.has("queue-user") || ATTENTION_REASONS.some(reason => reason.owner === "user" && reasonFilters.has(reason.id));
  $("handoff-snapshot").textContent = `${copyingDecisions ? "Copy visible includes tracker links to the selected decisions." : "Copy visible exports the source PRs shown as plain text."} Snapshot ${handoffTimestamp(model.checkedAt) || "unavailable"}.`;
  for (const group of visibleTableGroups) {
    if (tableGrouping) {
      const headingRow = element("tr", `attention-heading ${group.owner}${selected === `attention-${group.id}` ? " selected" : ""}`);
      headingRow.id = `attention-${group.id}`;
      const cell = element("th"), wrap = element("div", "attention-heading-content"), anchor = element("a", "attention-group-link", `${group.owner === "other" ? group.title : `${ATTENTION_OWNERS[group.owner]} · ${group.title}`} · ${group.entries.length}`);
      cell.colSpan = head.cells.length; cell.scope = "rowgroup"; anchor.href = currentViewURL(headingRow.id);
      const copy = button("Copy group", event => copyHandoff(attentionText([group], model.checkedAt), group.title, event.currentTarget));
      copy.disabled = !group.entries.some(entry => entry.copyURL); wrap.append(anchor, copy); cell.append(wrap); headingRow.append(cell); body.append(headingRow);
    }
    for (const entry of group.entries) {
    const node = entry.node;
    const row = element("tr", selected === node.id ? "selected" : ""); row.dataset.nodeId = node.id;
    const reach = impact(node.id), title = element("td", "work-title"), identity = element("td", `identity ${node.type}`);
    identity.append(link(label(node), node.url));
    const choose = button(node.title, () => select(node.id)); choose.dataset.node = node.id;
    title.append(choose);
    if (node.followup?.nextAction || node.nextStep) title.append(element("span", "next-action", node.followup?.nextAction || node.nextStep));
    const decisions = visibleDecisions(node).filter(decision => !contributorDecisionNeedsRefresh(node, decision));
    for (const decision of decisions.filter(decision => ["review-changes", "proposal"].includes(decisionReason(decision)) || decision.kind === "proposal")) {
      const revision = refinementComparison(node, decision);
      title.append(reviewChangeLink(node, decision, (decision.title || "Review proposed change") + (revision ? ` · ${revision.label}` : "")));
    }
    for (const decision of decisions.filter(item => ["review", "reply", "issue"].includes(item.kind))) {
      title.append(readDraftLink(node, decision, decisions.length === 1 ? "Read draft " + decision.kind : decision.title));
    }
    const action = humanAction(node);
    if (action) title.append(submissionLink(action, "human-action-source"));
    const review = element("td", "review-cell"), checks = element("td", "checks-cell"), state = element("td", "status-cell");
    state.append(element("span", "base-status", status(node))); appendStates(state, node);
    for (const reason of entry.reasons) { const item = element("span", `attention-reason ${reason.owner}`, reason.title); item.title = `${ATTENTION_OWNERS[reason.owner]}. ${reason.detail}`; state.append(item); }
    if (node.type === "pr") {
      review.append(badge(reviewInfo(node.github, node), attributeTitle(node)));
      checks.append(badge(checkInfo(node.github), node.github ? `Original PR head ${node.github.head.slice(0, 9)}. ${checkInfo(node.github).detail}` : "No published check data."));
      if (node.github && conflictRecord(node.github)) state.append(badge({ text: node.github.mergeable === "CONFLICTING" ? "conflicts" : "last observed conflict", tone: "bad" }, mergeDescription(node.github)));
    } else { review.textContent = "—"; checks.textContent = "—"; }
    row.append(identity, title, element("td", "numeric reach-cell", String(reach.prs)), element("td", "numeric", String(reach.direct)),
      state, review, checks, importCell(node), element("td", "group-cell", groups.get(node.group) || ""));
    body.append(row);
    }
  }
}
function rangeDiffCommand(repo, args) {
  const git = ["google/gvisor", "tamird/gvisor"].includes(repo) ? "git -C ~/code/gvisor" : "git";
  return `${git} range-diff ${args}`;
}
function refinementComparison(node, decision = contributorDecision(node)) {
  const amendment = decision?.kind === "amendment";
  let revision = node.refinement;
  if (amendment) {
    const recordedPair = revision?.before.head === decision.baseHead && revision?.after.head === decision.head;
    const publishedHead = node.github?.head || node.head;
    if (publishedHead ? publishedHead !== decision.baseHead : !recordedPair) return null;
    if (!recordedPair) {
      revision = { before: { head: decision.baseHead }, after: { head: decision.head } };
    }
  } else if (!revision || revision.after.head !== node.head ||
      node.github && node.github.head !== revision.after.head) return null;
  const before = revision.before.head.slice(0, 9), after = revision.after.head.slice(0, 9);
  const range = ({ head, base }) => base ? `${base}..${head}` : `${head}^!`;
  const options = !revision.before.base && !revision.after.base ? "--creation-factor=999 " : "";
  return {
    command: rangeDiffCommand(node.repo, `${options}${range(revision.before)} ${range(revision.after)}`),
    label: `${amendment ? "Amendment" : "Revised proposal"} ${before} → ${after}`,
    description: amendment ? `${node.github?.head ? "Published" : "Recorded PR"} revision ${before} → proposed revision ${after}`
                           : `Earlier revision ${before} → current revision ${after}`,
  };
}
function appendRangeDiffCommand(parent, { command, description }) {
  const group = element("div", "range-diff");
  const input = element("input", "range-diff-command");
  input.type = "text"; input.readOnly = true; input.value = command;
  input.setAttribute("aria-label", "Git range-diff command");
  const message = element("span", "detail-meta"); message.setAttribute("role", "status");
  const copy = button("Copy range-diff", async () => {
    try {
      await navigator.clipboard.writeText(command);
      message.textContent = "Copied.";
    } catch {
      input.focus(); input.select();
      message.textContent = "Clipboard unavailable. Select and copy the command above.";
    }
  });
  group.append(element("p", "", description), input, copy, message);
  parent.append(group);
}
function appendRangeDiff(parent, edge, nodes) {
  if (edge.role !== "proposed_update") return;
  const proposal = nodes.get(edge.from), pr = nodes.get(edge.to)?.github;
  const comparison = proposal && refinementComparison(proposal);
  if (comparison) { appendRangeDiffCommand(parent, comparison); return; }
  const oldHead = pr?.head, newHead = proposal?.head;
  if (![oldHead, newHead].every(head => /^[a-f0-9]{40}$/.test(head)) || oldHead === newHead) return;
  appendRangeDiffCommand(parent, {
    command: rangeDiffCommand(nodes.get(edge.to)?.repo || proposal.repo, `${oldHead}...${newHead}`),
    description: `Published ${oldHead.slice(0, 9)} → proposed ${newHead.slice(0, 9)} · snapshot ${date(pr.checkedAt)}`,
  });
}
function appendHumanAction(parent, node) {
  const action = humanAction(node);
  if (!action) return;
  const section = element("section", "detail-section human-action");
  section.append(element("h3", "", action.title), element("p", "", action.summary),
    element("p", "detail-meta", `Prepared commit ${action.head}`),
    readDraftLink(node, action), submissionLink(action),
    link("Read contribution policy ↗", action.policyURL));
  for (const item of node.evidence || []) {
    if (item.label && safeURL(item.url)) section.append(link(item.label + " ↗", item.url, "relation-source"));
  }
  parent.append(section);
}
function appendSettledPublications(parent, node) {
  const labels = { issue: "Issue filed", reply: "Reply posted", review: "Review posted" };
  for (const decision of node.settledReviews || []) {
    if (["proposal", "amendment"].includes(decision.kind) && decision.outcome === "approved" && decision.body)
      parent.append(readDraftLink(node, decision, decision.kind === "proposal"
        ? "Read approved proposal" : "Read approved revision range-diff"));
    if (decision.kind === "amendment" && decision.outcome === "posted" && decision.body)
      parent.append(readDraftLink(node, decision, "Read delivered amendment range-diff"));
    const url = safeURL(decision.postedURL);
    if (Object.hasOwn(labels, decision.kind) && url) {
      const evidence = node.evidence?.find(item => item.url === url);
      const label = labels[decision.kind] + (evidence ? ` · ${evidence.label}` : "");
      parent.append(link(label + " ↗", url, "relation-source"));
    }
  }
}
function outreachPauseNotice(snapshot) {
  if (snapshot?.outreachPostingMode === "rotations") return "Only native GitHub requests to new reviewers are enabled. Automated comments, first requests and import reminders are paused.";
  if (snapshot?.outreachPostingMode === "paused") return "Automated GitHub review requests and reminders are paused. Read-only monitoring continues.";
  if (snapshot?.outreachPostingMode === "unknown") return "The collector could not verify whether GitHub outreach is enabled. Read-only monitoring continues.";
  return "";
}
function activeReviewHold(node, pr) {
  const hold = node.reviewOutreachHold;
  return hold && (!hold.head || hold.head === pr?.head) ? hold : null;
}
function currentOutreach(node) {
  const pr = node.github;
  if (node.type !== "pr" || node.repo !== "google/gvisor" || pr?.status !== "open" || pr.mergeable === "CONFLICTING" || activeReviewHold(node, pr)) return null;
  const row = liveSnapshot?.reviewOutreach?.[pr.number];
  if (row?.head !== pr.head || row?.kind === "import-status" && !currentHeadApproval(pr) && !reviewedExport(node)) return null;
  if (!row || !outreachPauseNotice(liveSnapshot)) return row;
  if (liveSnapshot.outreachPostingMode === "rotations" && row.sourceRotation === true && row.kind !== "import-status"
      && (row.channel === "request" || row.status === "needs-reviewer" || row.status === "native-request-denied")) return row;
  return { ...row, status: "paused" };
}
function appendOutreach(parent, node) {
  const row = currentOutreach(node);
  if (!row || row.status === "incomplete") return;
  const section = element("section", "detail-section");
  const importing = row.kind === "import-status";
  section.append(element("h3", "", importing ? "Approved import follow-up" : "Review outreach"));
  const due = new Date(row.dueAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  if (row.status === "paused") {
    section.append(element("p", "detail-meta", outreachPauseNotice(liveSnapshot)));
  } else if (row.status === "native-request-denied") {
    section.append(element("p", "", `GitHub rejected the native review request for @${row.reviewer} (HTTP ${row.http}). This rotation is held.`));
  } else if (["due", "verify-mergeability"].includes(row.status)) {
    if (row.status === "verify-mergeability") section.append(element("p", "detail-meta", "GitHub is recalculating mergeability. Check the current PR head and base before sending."));
    section.append(element("p", "", `${row.channel === "request" ? "Request a GitHub review from" : "Mention"} @${row.reviewer}. ${row.reason}`), link("Reviewer evidence ↗", row.evidence));
  } else if (row.status === "needs-reviewer") {
    section.append(element("p", "", importing ? "Find another active maintainer who has handled imports." : "A review is due. Identify another active reviewer with relevant experience."));
  } else {
    const last = row.lastReviewers?.length ? `Asked ${row.lastReviewers.map(who => "@" + who).join(", ")}. ` : "";
    section.append(element("p", "", `${last}Next eligible ${importing ? "import status" : "review"} request: ${due}.`));
  }
  if (row.lastContactURL) section.append(link("Last personal request ↗", row.lastContactURL));
  if (row.lastActivityURL && row.lastActivityURL !== row.lastContactURL) section.append(link("Last human activity ↗", row.lastActivityURL));
  parent.append(section);
}
function readDraftLink(node, draft, label = "Read draft") {
  const anchor = element("a", "decision-source", label);
  draftURL(node.id, draft, location.href).then(url => { anchor.href = url.href; });
  return anchor;
}
function reviewChangeLink(node, decision, label) {
  return decision.kind === "amendment" || decision.kind === "proposal" && decision.body && refinementComparison(node, decision)
    ? readDraftLink(node, decision, label || (decision.kind === "amendment" ? "Read amendment range-diff" : "Read revised proposal range-diff"))
    : link(label || "Open proposed change ↗", decision.url, "decision-source");
}
function appendContributorDecisions(parent, node, decisions) {
  let showedComparison = false;
  for (const decision of decisions) {
    const changed = contributorDecisionNeedsRefresh(node, decision);
    if (!states(node)["contributor-review"] && !changed) continue;
    const section = element("section", "detail-section contributor-decision");
    section.append(element("div", "detail-meta", DECISION_REASONS.find(reason => reason.id === decisionReason(decision)).title),
      element("h3", "", changed ? "Check the new PR head" : decision.title || "Decision requested"));
    if (decision.summary) section.append(element("p", "", decision.summary));
    if (decision.head) section.append(element("p", "detail-meta", `Decision covers ${decision.head}`));
    if (changed)
      section.append(element("p", "", `The published head has changed from ${decision.baseHead || decision.head} to ${node.github.head}. Reconcile this recorded decision with the new source before acting.`));
    if (!changed && decisionReason(decision) === "review-changes") {
      const comparison = refinementComparison(node, decision);
      if (comparison) {
        appendRangeDiffCommand(section, comparison);
        showedComparison = true;
      }
    }
    if (decision.body && decision.kind !== "amendment" && !(decision.kind === "proposal" && refinementComparison(node, decision))) section.append(readDraftLink(node, decision));
    if (decision.kind === "issue") {
      const form = decision.url + "?title=" + encodeURIComponent(decision.title) + "&body=" + encodeURIComponent(decision.body);
      section.append(link("Open prefilled issue ↗", form));
    } else if (["review", "reply"].includes(decision.kind)) {
      section.append(link(decision.kind === "review" ? "Open original PR ↗" : "Open original discussion ↗", decision.url));
    } else {
      section.append(reviewChangeLink(node, decision));
      if (decision.kind === "amendment" || decision.kind === "proposal" && decision.body && refinementComparison(node, decision))
        section.append(link(decision.kind === "amendment" ? "Open amended commit ↗" : "Open revised commit ↗", decision.url));
    }
    parent.append(section);
  }
  return showedComparison;
}
function drawDetails() {
  if (view === "investigations") { $("details").replaceChildren(); $("details").hidden = true; return; }
  const details = $("details"), nodes = nodeMap(), node = nodes.get(selected); details.replaceChildren(); details.hidden = !node;
  if (!node) return;
  if (historical(node)) details.append(element("p", "notice", "History: no current action on this record. Linked active work remains separate."));
  const top = element("div", `detail-top ${node.type}`), close = button("×", () => select(null));
  close.setAttribute("aria-label", "Close details"); top.append(link(label(node) + " ↗", node.url), close);
  details.append(top, element("h2", "item-title", node.title), element("span", `status-pill ${node.status}`, status(node)));
  if (node.incomingReviewRequests?.length) {
    const section = element("section", "detail-section");
    section.append(element("h3", "", "Incoming review requests"));
    for (const request of node.incomingReviewRequests) {
      const who = request.author ? `@${request.author}` : "GitHub review request";
      const row = element("p", "detail-meta");
      row.append(link(`${who} · ${date(request.updatedAt)} ↗`, request.sourceURL || request.url));
      section.append(row);
    }
    details.append(section);
  }
  if (node.reviewFollowups?.length) {
    const section = element("section", "detail-section");
    section.append(element("h3", "", "Follow up on our review"));
    for (const row of node.reviewFollowups)
      section.append(link(`@${row.author} · ${date(row.updatedAt)} ↗`, row.url));
    details.append(section);
  }
  const showedComparison = appendContributorDecisions(details, node, visibleDecisions(node));
  appendSettledPublications(details, node);
  appendHumanAction(details, node);
  // Service-owned attributes lead PR details; curated notes remain available
  // separately without obscuring the current head, checks, or conflict refresh.
  appendAttributes(details, node);
  appendOutreach(details, node);
  const evidenceURL = node.followup?.evidence?.[0];
  if (node.type === "branch" && node.status === "Agent work" && evidenceURL && node.followup.sourceHead === node.head) {
    const source = node.links?.find(item => item.url === evidenceURL) || node.evidence?.find(item => item.url === evidenceURL);
    if (source) details.append(link(source.label + " ↗", evidenceURL, "relation-source"));
  }
  for (const record of node.followup?.attentionDispositions || []) {
    if (!attentionDisposition(node, record.reason)) continue;
    const section = element("section", "detail-section");
    section.append(element("h3", "", record.title), element("p", "", record.nextAction));
    for (const url of record.evidence) section.append(link("Evidence ↗", url, "relation-source"));
    details.append(section);
  }
  const refinement = refinementComparison(node);
  if (refinement && !showedComparison) appendRangeDiffCommand(details, refinement);
  const reach = impact(node.id);
  details.append(element("p", "detail-impact", `${reach.prs} downstream open PRs · ${reach.direct} direct`));
  if (node.evidence?.length) {
    const evidence = element("section", "detail-section");
    evidence.append(element("h3", "", "Evidence"));
    for (const item of node.evidence) evidence.append(link(item.label + " ↗", item.url, "evidence-link"));
    details.append(evidence);
  }
  if (node.summary) {
    if (node.type === "pr") {
      const notes = element("details", "curated-notes"); notes.dataset.pr = node.id;
      notes.append(element("summary", "", "Curated notes and history"), element("p", "detail-description", node.summary));
      details.append(notes);
    } else details.append(element("p", "detail-description", node.summary));
  }
  if (node.ref) details.append(element("p", "detail-meta", node.ref));
  if (node.type === "issue" && node.unavailable)
    details.append(element("p", "detail-meta", `${node.unavailable} Last provider observation: ${node.checkedAt ? date(node.checkedAt) : "not recorded"}.`));
  if (node.type === "issue" && node.githubState === "closed" && !contributorDecision(node) && !action && !node.issueFeedback?.length)
    details.append(element("p", "detail-meta", "Closed upstream. No action is needed on this issue."));
  if (node.issueFeedback?.length) {
    const section = element("section", "detail-section");
    section.append(element("h3", "", "Issue comments awaiting follow-up"));
    for (const row of node.issueFeedback) section.append(link(`@${row.author} · ${date(row.updatedAt)} ↗`, row.url));
    details.append(section);
  } else if (node.type === "issue" && node.comments?.length) {
    const latest = node.comments[0];
    details.append(link(`Latest issue comment · ${date(latest.updatedAt)} ↗`, latest.url, "relation-source"));
  }
  const statePanel = element("div", "detail-states"); appendStates(statePanel, node, true); details.append(statePanel);
  const relations = [
    ["Proposed updates", model.edges.filter((edge) => edge.to === node.id && edge.role === "proposed_update"), "from"],
    ["Proposed update for", model.edges.filter((edge) => edge.from === node.id && edge.role === "proposed_update"), "to"],
    ["Requires", model.edges.filter((edge) => edge.to === node.id && ["depends_on", "blocked_by"].includes(edge.type)), "from"],
    ["Needed by", model.edges.filter((edge) => edge.from === node.id && ["depends_on", "blocked_by"].includes(edge.type)), "to"],
    ["Includes", model.edges.filter((edge) => edge.to === node.id && edge.type === "includes" && !edge.role), "from"],
    ["Included in", model.edges.filter((edge) => edge.from === node.id && edge.type === "includes" && !edge.role), "to"],
  ];
  for (const [heading, edges, other] of relations) {
    if (!edges.length) continue;
    const section = element("section", "detail-section"); section.append(element("h3", "", heading));
    for (const edge of edges) {
      const target = nodes.get(edge[other]); if (!target) continue;
      const relation = element("div", "relation");
      const sourceLabel = edge.role === "proposed_update" ? (other === "from" ? "Open proposed update ↗" : "Open live PR ↗") : "↗";
      relation.append(button(`${label(target)} · ${target.title}`, () => select(target.id)), link(sourceLabel, target.url, "relation-source"), element("p", "", edge.reason));
      if (!refinement || node.id !== edge.from) appendRangeDiff(relation, edge, nodes);
      if (historical(target)) relation.append(element("p", "", `History: ${status(target)}`));
      for (const [index, url] of (Array.isArray(edge.evidence) ? edge.evidence : [edge.evidence]).filter(Boolean).entries()) relation.append(link(`Evidence${index ? " " + (index + 1) : ""} ↗`, url, "evidence-link"));
      section.append(relation);
    }
    if (edges[0].role === "proposed_update") details.insertBefore(section, details.querySelector(".detail-impact"));
    else details.append(section);
  }
  const chain = components().find((chain) => chain.ids.has(node.id));
  const focused = view === "dag" && focus && (chain ? chain.ids.has(focus) : focus === node.id) && !filtered();
  const focusButton = button(focused ? (chain ? "Showing this dependency chain" : "Showing this item") :
    (chain ? "Focus dependency chain" : "Focus item in DAG"), () => focusWork(node.id), "focus-button");
  focusButton.id = "focus-work"; focusButton.disabled = Boolean(focused); details.append(focusButton);
  if (!chain) details.append(element("p", "detail-description", "No active dependencies recorded. Integration membership is shown above; it is not a blocking relationship."));
}
function select(id) {
  const previous = document.activeElement?.getAttribute("data-node"); selected = id;
  render(false, "push");
  if (previous) document.querySelector(`${view === "dag" ? "#graph" : "#work-table"} [data-node="${CSS.escape(previous)}"]`)?.focus();
}
function focusWork(id) {
  focus = id; selected = id; $("search").value = ""; $("group-filter").value = ""; stateFilters.clear(); reasonFilters.clear();
  setView("dag");
}
function drawChainSelector() {
  const select = $("chain-filter"); select.replaceChildren();
  const all = element("option", "", "All work"); all.value = ""; select.append(all);
  const chains = components();
  for (const chain of chains) { const option = element("option", "", `${chain.title} (${chain.ids.size})`); option.value = chain.id; select.append(option); }
  const chain = chains.find((chain) => chain.ids.has(focus));
  const isolated = !chain && nodeMap().get(focus);
  if (isolated) { const option = element("option", "", `${label(isolated)} · ${isolated.title}`); option.value = isolated.id; select.append(option); }
  select.value = chain?.id || isolated?.id || "";
  select.disabled = Boolean(filtered());
}
let searchFrame = null;
function searchInput() {
  invalidateHandoffCopy();
  if (view === "investigations" || selected?.startsWith("attention-")) selected = null;
  syncViewURL(searchEditing ? "replace" : "push");
  searchEditing = true;
  // Paint the input first. Multiple keystrokes before the redraw share the
  // latest query; any immediate navigation or filter change renders it itself.
  if (searchFrame === null) searchFrame = requestAnimationFrame(() => {
    searchFrame = requestAnimationFrame(() => {
      searchFrame = null;
      render(view !== "investigations");
    });
  });
}
function render(reposition = false, navigation = "replace") {
  if (searchFrame !== null) {
    cancelAnimationFrame(searchFrame);
    searchFrame = null;
  }
  invalidateHandoffCopy();
  const dag = view === "dag", investigations = view === "investigations";
  $("dag-pane").hidden = !dag; $("table-pane").hidden = view !== "table"; $("investigations-pane").hidden = !investigations;
  for (const choice of VIEWS) $(`${choice}-view`).setAttribute("aria-pressed", view === choice);
  document.body.classList.toggle("investigation-mode", investigations);
  $("search").closest("label").hidden = investigations; $("group-control").hidden = investigations;
  $("work-state-controls").hidden = investigations; $("investigation-search-control").hidden = !investigations; $("investigation-filter-control").hidden = !investigations;
  $("chain-control").hidden = !dag; $("group-by-attention").checked = tableGrouping;
  const nodes = investigations ? drawInvestigations() : dag ? graphNodes() : tableNodes();
  $("visible-count").textContent = investigations ? `${nodes.length} / ${investigationMap().size} investigations` : `${nodes.length} items${dag ? " · prerequisite → dependent" : " · click a title for relationships"}`;
  const historyNote = $("show-resolved").checked ? "Including history" : "Inactive history hidden; direct links remain available";
  const queue = Object.keys(ATTENTION_OWNERS).find(owner => reasonFilters.has("queue-" + owner));
  const scope = investigations ? "Research records" : queue ? ATTENTION_OWNERS[queue] : reasonFilters.size ? "Matching any selected attention reason" : dag && filtered() ? "Matches with dependency context" : "Active work";
  $("filter-note").textContent = `${scope} · ${historyNote}`;
  $("empty").hidden = nodes.length !== 0; $("empty-title").textContent = investigations ? "No matching investigations" : "No matching work";
  drawDetails();
  if (!investigations) drawStateFilters();
  if (dag) { drawGraph(nodes); drawChainSelector(); } else if (view === "table") drawTable(nodes);
  $("inventory").textContent = `${model.nodes.filter(node => node.type === "pr" && !resolved(node)).length} open PRs · ${model.nodes.length} tracked items · ${investigationMap().size} investigations`;
  if (reposition && dag) resetCamera();
  if (reposition && selected && (investigations || view === "table" && tableGrouping)) document.getElementById(selected)?.scrollIntoView({ block: "start" });
  syncViewURL(navigation); saveView();
}

function setFreshness(text, warning = false, live = false) {
  $("freshness-text").textContent = text;
  $("freshness-dot").className = `status-dot${warning ? " warning" : live ? " live" : ""}`;
}
function stateRecords(snapshot, node) {
  const records = { ...(snapshot.workStates?.[node.id] || {}) };
  const decision = contributorDecision(node);
  // Only explicit decisions survive; legacy amendment prose on a live PR is
  // not a decision. Outgoing replies/reviews are independent of GitHub review.
  delete records["contributor-review"];
  if (node.type === "branch") {
    const changes = contributorChanges(node);
    if (!changes || records["changes-requested"]?.scope !== changes.head) delete records["changes-requested"];
  }
  // Keep the published state enum compatible with already-open older clients.
  if (node.type === "branch" && node.status === "Prepared proposal") records["proposed-update"] = {
    scope: node.head, since: null, basis: "unknown", qualifier: "Unpublished revision; observation age is not recorded" };
  if (node.type === "pr" && node.github && node.github.status === "open" && effectiveReviewDecision(node.github) === "REVIEW_REQUIRED" && !approvedPatch(node) && !reviewedExport(node)) {
    records["maintainer-review"] ||= { scope: node.github.head, since: null, basis: "unknown", qualifier: "No effective approval recorded for this head" };
    delete records["awaiting-import"]; delete records["waiting-merge"];
  }
  if (records.review) {
    if (node.type === "pr") records["maintainer-review"] ||= records.review;
    delete records.review;
  }
  if (approvedPatch(node)) delete records["maintainer-review"];
  if (rebaseNeedsComparison(node)) delete records["maintainer-review"];
  if (releaseWait(node)) {
    delete records["maintainer-review"]; delete records["changes-requested"];
    if (node.github.releaseVersion === node.releaseWait.checkedVersion)
      records["waiting-release"] = { scope: node.github.head, since: node.releaseWait.confirmedAt, basis: "observed", qualifier: node.releaseWait.nextAction };
  }
  if (node.github) {
    if (node.github.revisionChanged) {
      for (const key of Object.keys(records)) delete records[key];
    }
    if (node.github.revisionChanged || node.github.statusChanged) {
      const pr = node.github, decision = effectiveReviewDecision(pr);
      // A partial REST response can revoke readiness, but cannot establish it.
      for (const key of ["draft", "closed", "merged", "maintainer-review", "changes-requested", "awaiting-import", "waiting-merge"]) delete records[key];
      const state = pr.status === "draft" ? "draft" : pr.status === "open"
        ? decision === "CHANGES_REQUESTED" ? "changes-requested" : decision !== "APPROVED" && !approvedPatch(node) ? "maintainer-review" : null : null;
      if (state) records[state] = pr.revisionChanged && state === "maintainer-review"
        ? { scope: null, since: null, basis: "unknown", qualifier: "New head; approval has not been collected" }
        : { scope: pr.head, since: pr.conflictCheckedAt, observedAt: pr.conflictCheckedAt, basis: "observed", qualifier: null };
    }
    // Reconcile legacy aggregate-failure records only from complete inventories.
    // Assignment and import service errors remain visible in raw check details.
    const visible = [node.github, ...unresolvedImportChecks(importLineage(node))];
    if (node.github.importsComplete && visible.every(completeChecks)) {
      const failures = failureSources(node);
      if (!failures.length) delete records.failing;
      else if (records.failing) {
        const scope = failures.map(item => `${item.number}:${item.head}`).join(",");
        if (records.failing.scope !== scope) records.failing = { scope, since: snapshot.checkedAt, basis: "observed", qualifier: failures.map(item => item.failureLabel).join("; ") };
      }
      if (!visible.some(item => ["open", "draft"].includes(item.status) && [...codeCheckStates(item)].some(state => ["PENDING", "QUEUED", "IN_PROGRESS", "WAITING", "REQUESTED"].includes(state)))) delete records["checks-pending"];
    }
    const conflict = conflictRecord(node.github);
    if (conflict && ["open", "draft"].includes(node.github.status)) records.conflicts = { ...conflict,
      since: records.conflicts?.scope === conflict.scope ? records.conflicts.since : conflict.since };
    else delete records.conflicts;
    if (node.github.mergeable !== "MERGEABLE" || actionableComment(node) || requestedRebase(node.github, registry.meta.owner)) delete records["waiting-merge"];
    if (node.github.branchHead && node.github.branchHead !== node.github.head) {
      delete records["waiting-merge"]; delete records["awaiting-import"];
    }
    if (["merged", "closed"].includes(node.github.status) && node.github.conflictCheckedAt) {
      for (const key of Object.keys(records)) delete records[key];
      records[node.github.status] = { scope: node.github.head, since: node.github.conflictCheckedAt, observedAt: node.github.conflictCheckedAt, basis: "observed", qualifier: null };
    }
  }
  const landed = landedPatch(node);
  if (landed) {
    for (const key of Object.keys(records)) delete records[key];
    records.imported = { scope: node.github.head, since: landed.verifiedAt, basis: "observed", qualifier: "Landed; source PR still open" };
  }
  // Project observed conversations locally: older clients reject unknown
  // snapshot state keys. An upstream approval and a reply are separate actions.
  const pr = node.github;
  if (pr?.status === "open" && pr.headOwner === registry.meta.owner && !pr.revisionChanged
      && (!pr.branchHead || pr.branchHead === pr.head) && !attentionDisposition(node, "author-feedback")) {
    const threads = reviewAttention(pr, registry.meta.owner).unanswered;
    const assigned = actionableComment(node);
    const rebase = requestedRebase(pr, registry.meta.owner);
    if (threads.length || assigned || rebase) {
      delete records["waiting-merge"];
      records["author-feedback"] = { scope: pr.head, since: null, basis: "unknown",
        qualifier: [threads.length && `${threads.length} unanswered review thread${threads.length === 1 ? "" : "s"}`,
          assigned && "Assigned review follow-up", rebase && "Requested rebase"].filter(Boolean).join("; "), url: safeURL(rebase?.url || threads[0]?.url || assigned?.url) };
    }
  }
  if (decision && !contributorDecisionNeedsRefresh(node)) {
    const scope = decision.head || decision.url, history = snapshot.workStates?.[node.id];
    const previous = history?.["contributor-review"] || (node.type === "branch" ? history?.review : null);
    // Registry publication is the first observation of a new decision; an older
    // provider snapshot must neither hide it nor lend it another candidate's age.
    records["contributor-review"] = previous?.scope === scope && previous.since
      ? { ...previous, observedAt: registry.meta.updatedAt }
      : { scope, since: registry.meta.updatedAt, observedAt: registry.meta.updatedAt, basis: "observed", qualifier: null };
  }
  return records;
}
function attachReviewFollowups(snapshot, nodes, ids) {
  const watches = new Map((snapshot.reviewPRs || []).map(pr => [prIdentity(pr), pr]));
  for (const row of snapshot.reviewWatchHandoff || []) {
    const id = prIdentity(row);
    let node = ids.get(id);
    const pr = node?.github || watches.get(id);
    if (!pr || !["open", "draft"].includes(pr.status) || pr.revisionChanged || pr.head !== row.head
        || (pr.branchHead && pr.branchHead !== pr.head) || !pr.authorLogin || pr.authorLogin === registry.meta.owner) continue;
    if (!node) {
      node = { id, type: "pr", number: pr.number, repo: pr.repo, title: pr.title || `Review of ${pr.repo}#${pr.number}`,
        url: pr.url, head: pr.head, status: pr.status, updatedAt: row.updatedAt, group: "new" };
      nodes.push(node);
      ids.set(id, node);
    }
    (node.reviewFollowups ||= []).push(row);
  }
}
function attachReviewRequests(requests, nodes, ids) {
  for (const request of requests) {
    if (request.repo !== registry.meta.repo) continue;
    const id = prIdentity(request);
    let node = ids.get(id);
    if (!node) {
      node = { id, type: "pr", number: request.number, repo: request.repo, title: request.title,
        url: request.prURL, head: request.head, status: "open", updatedAt: request.updatedAt, group: "new" };
      nodes.push(node);
      ids.set(id, node);
    }
    (node.incomingReviewRequests ||= []).push(request);
  }
}

function mergeProviderPRs(nextRegistry, snapshot, prs = [...snapshot.prs, ...(snapshot.resolved || [])]) {
  const mergedURLs = snapshot.mergedOnly && new Set(snapshot.prs.map(pr => pr.url));
  const nodes = registryNodes(nextRegistry).map(node => {
    if (node.type === "pr" && mergedURLs && mergedURLs.has(node.url)) node = { ...node, status: "merged" };
    return { ...node };
  }), ids = new Map(nodes.map((node) => [node.id, node])), aliases = new Map();
  for (const pr of mergedURLs ? [] : prs) {
    const id = prIdentity(pr, nextRegistry), existing = ids.get(id);
    const branch = pr.ref && pr.headRepo ? nodes.find((node) => node.type === "branch" && node.ref === pr.ref && node.repo === pr.headRepo) : null;
    const node = { ...existing, id, type: "pr", number: pr.number, repo: prRepo(pr, nextRegistry), title: pr.title, url: pr.url,
      status: pr.status, updatedAt: pr.updatedAt, ref: pr.ref || existing?.ref, group: existing?.group || branch?.group || "new",
      github: pr.head ? pr : existing?.github };
    if (branch && ["open", "draft", "merged"].includes(pr.status)) {
      aliases.set(branch.id, id); node.promotedFrom = branch.ref; node.summary ||= branch.summary;
      // A branch's last published revision can also be the starting point of
      // a pending PR amendment. Keep that amendment's full comparison ranges.
      const amendment = pendingDecisions(node).some(decision => decision.kind === "amendment"
        && decision.baseHead === pr.head && node.refinement?.before.head === pr.head
        && node.refinement.after.head === decision.head);
      if (!amendment && node.refinement?.after.head !== pr.head && branch.refinement?.after.head === pr.head) {
        node.refinement = branch.refinement; node.head = pr.head;
      }
    }
    if (existing) Object.assign(existing, node); else { nodes.push(node); ids.set(id, node); }
  }
  return { nodes, ids, aliases };
}

function applyLive(snapshot, nextRegistry = registry) {
  const focusedInvestigation = view === "investigations" ? document.activeElement?.closest(".investigation-card")?.id : null;
  liveSnapshot = snapshot;
  const notice = $("outreach-pause");
  notice.textContent = outreachPauseNotice(snapshot);
  notice.hidden = !notice.textContent;
  const scrollPositions = ["table-pane", "investigations-pane", "details"].map((id) => ({ id, top: $(id).scrollTop, left: $(id).scrollLeft }));
  const openSections = new Set([...$("details").querySelectorAll(".check-details[open], .curated-notes[open]")].map((section) => section.dataset.pr));
  registry = nextRegistry;
  updateRegistryControls();
  const providers = [...snapshot.prs, ...(snapshot.resolved || [])].map(withConflictResult);
  const { nodes, ids, aliases } = mergeProviderPRs(registry, snapshot, providers);
  for (const node of nodes) node.workStates = stateRecords(snapshot, node);
  attachReviewFollowups(snapshot, nodes, ids);
  attachReviewRequests(snapshot.incomingReviewRequests || [], nodes, ids);
  for (const node of nodes) if (snapshot.issues?.[node.id]) Object.assign(node, snapshot.issues[node.id]);
  const edges = registry.edges.map((edge) => ({ ...edge, from: aliases.get(edge.from) || edge.from, to: aliases.get(edge.to) || edge.to }))
    .filter((edge, index, all) => edge.from !== edge.to && all.findIndex((other) => other.from === edge.from && other.to === edge.to && other.type === edge.type) === index);
  model = { ...registry, checkedAt: snapshot.checkedAt, statesAvailable: Boolean(snapshot.workStates), nodes: nodes.filter((node) => !aliases.has(node.id)), edges,
    groups: [...registry.groups, { id: "new", label: "New · not yet grouped" }] };
  if (aliases.has(selected)) selected = aliases.get(selected);
  if (aliases.has(focus)) focus = aliases.get(focus);
  if (selected && !selectionMap().has(selected)) selected = null;
  if (view === "investigations" && selected && !investigationMatches(investigationMap().get(selected))) selected = null;
  if (focus && !model.nodes.some((node) => node.id === focus)) focus = null;
  // Status updates redraw the data, not the user's viewport. Initial render,
  // filters and explicit graph controls own fitting/recentering.
  render();
  for (const section of $("details").querySelectorAll(".check-details, .curated-notes")) section.open = openSections.has(section.dataset.pr);
  for (const { id, top, left } of scrollPositions) $(id).scrollTo(left, top);
  if (focusedInvestigation) document.getElementById(focusedInvestigation)?.focus({ preventScroll: true });
  if (snapshot.mergedOnly) {
    setFreshness(`Work map · ${date(registry.meta.updatedAt)} | Registry and GitHub snapshot revisions differ`, true);
    $("freshness-detail").textContent = "Showing the current registry and previously confirmed GitHub merges. Current reviews and checks are awaiting the next matching snapshot.";
    return;
  }
  const stale = Date.now() - new Date(snapshot.checkedAt).getTime() > STALE_AGE;
  setFreshness(`Work map · ${date(registry.meta.updatedAt)} | Evidence snapshot · ${date(snapshot.checkedAt)}${stale ? " · older than 2 hours" : ""}`, stale);
  $("freshness-detail").textContent = "Curated records and dated GitHub issue receipts are separate from fresh reproductions. Missing check and review data stay unknown. Reload fetches the latest published registry and evidence. A non-draft PR does not establish qualification or approval. Every upstream contribution requires Tamir’s approval after qualification. " + (registry.meta.inventory?.scope || "") + " " + (registry.meta.inventory?.qualification || "");
}
function validIssueDraft(decision) {
  return decision?.kind === "issue" && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/new$/.test(decision.url)
    && [decision.title, decision.summary, decision.body].every(value => typeof value === "string" && value.trim());
}
function validateRegistry(candidate, { allowRetiredExecution = false } = {}) {
  if (!candidate?.meta || !Number.isFinite(Date.parse(candidate.meta.updatedAt)) ||
      !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges) || !Array.isArray(candidate.groups)) throw new Error("Invalid work registry");
  const policies = repositoryPolicies(candidate);
  if (!policies || Array.isArray(policies) || !Object.hasOwn(policies, candidate.meta.repo) ||
      !Object.entries(policies).every(([repo, policy]) => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) && ["none", "copybara"].includes(policy))) throw new Error("Invalid repository policies");
  const { registeredOnlyRepositories: registeredOnly = [] } = candidate.meta;
  if (!Array.isArray(registeredOnly) || new Set(registeredOnly).size !== registeredOnly.length ||
      !registeredOnly.every(repo => typeof repo === "string" && policies[repo] === "none")) throw new Error("Invalid registered-only repository selection");
  for (const node of candidate.nodes.filter(node => node.type === "pr"))
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(node.repo) || !Number.isInteger(node.number) || node.number <= 0 ||
        node.id !== prIdentity(node, candidate) ||
        node.url !== `https://github.com/${node.repo}/pull/${node.number}`) throw new Error("Invalid PR repository identity");
  for (const node of candidate.nodes) {
    if (node.inactive !== undefined && typeof node.inactive !== "boolean") throw new Error("Invalid inactive classification");
    if (node.group !== undefined && !candidate.groups.some(group => group.id === node.group))
      throw new Error("Invalid node group");
    const dispositions = node.followup?.attentionDispositions;
    const wait = node.releaseWait;
    const landed = node.landedPatch;
    if (landed !== undefined && (node.type !== "pr" || !landed || landed.method !== "merge-tree-identical"
        || ![landed.head, landed.upstreamHead, landed.upstreamTree, landed.replayedTree].every(value => /^[a-f0-9]{40}$/.test(value))
        || landed.upstreamTree !== landed.replayedTree || !/(?:Z|[+-]\d{2}:\d{2})$/.test(landed.verifiedAt) || !Number.isFinite(Date.parse(landed.verifiedAt))
        || !Array.isArray(landed.evidence) || !landed.evidence.length || !landed.evidence.every(safeURL)))
      throw new Error("Invalid landed patch evidence");
    if (wait !== undefined && (node.type !== "pr" || !wait || !/^[0-9a-f]{40}$/.test(wait.head)
        || !Number.isFinite(Date.parse(wait.confirmedAt)) || typeof wait.checkedVersion !== "string" || !wait.checkedVersion
        || typeof wait.nextAction !== "string" || !wait.nextAction.trim()
        || wait.blocking !== undefined && (typeof wait.blocking !== "boolean" || wait.blocking === false && !wait.module)
        || Boolean(wait.module) === Boolean(wait.repository)
        || wait.module && !/^[a-z][a-z0-9._-]*$/.test(wait.module)
        || wait.repository && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(wait.repository)))
      throw new Error("Invalid upstream release wait");
    if (dispositions !== undefined && (!Array.isArray(dispositions)
        || new Set(dispositions.map(item => item?.reason)).size !== dispositions.length
        || dispositions.some(item => !item || node.type !== "pr" || !TRIAGED_REASONS.has(item.reason)
          || typeof item.title !== "string" || !item.title.trim()
          || typeof item.nextAction !== "string" || !item.nextAction.trim()
          || !Array.isArray(item.evidence) || !item.evidence.length || !item.evidence.every(safeURL)
          || !item.binding || !/^[a-f0-9]{40}$/.test(item.binding.sourceHead)
          || item.reason === "maintainer-review" && !(item.action === "prefer-alternative" && item.replacement
            && item.binding.replacement?.id === item.replacement && item.evidence.includes(item.binding.replacement?.endorsement?.url))
          || item.action !== undefined && !(item.action === "ci-infrastructure-retry" && item.reason === "maintainer-import-checks"
            || item.action === "prefer-alternative" && item.reason === "maintainer-review"
            || item.action === "batch-cleanup" && item.reason === "author-feedback" && item.binding.reviewDecision === "APPROVED"
            && item.binding.approvedHead === item.binding.sourceHead)
          || item.replacement !== undefined && (!["author-conflicts", "maintainer-review"].includes(item.reason)
            || !candidate.nodes.some(other => other.id === item.replacement && other.type === "pr" && other.repo === node.repo && other.id !== node.id)))))
      throw new Error("Invalid attention disposition");
    const comment = node.followup?.actionableComment;
    const commentPrefix = `${node.url}#${comment?.kind === "review" ? "pullrequestreview" : "issuecomment"}-`;
    if (comment !== undefined && (!comment || node.type !== "pr"
        || typeof node.followup.owner !== "string" || !node.followup.owner.trim()
        || !/^[a-f0-9]{40}$/.test(comment.head)
        || (comment.kind !== undefined && !["comment", "review"].includes(comment.kind))
        || (comment.nonblockingReviewUpdatedAt !== undefined && (comment.kind !== "review" || !Number.isFinite(Date.parse(comment.nonblockingReviewUpdatedAt))))
        || typeof comment.commentId !== "string" || !comment.commentId.trim()
        || typeof comment.url !== "string" || !comment.url.startsWith(commentPrefix)
        || !/^[1-9]\d*$/.test(comment.url.slice(commentPrefix.length))))
      throw new Error("Invalid actionable comment assignment");
    const refinement = node.refinement;
    if (refinement !== undefined && (!refinement || !["branch", "pr"].includes(node.type) ||
        ![refinement.before, refinement.after].every(revision => revision && /^[a-f0-9]{40}$/.test(revision.head) &&
          (revision.base === undefined || /^[a-f0-9]{40}$/.test(revision.base) && revision.base !== revision.head)) ||
        refinement.before.head === refinement.after.head))
      throw new Error("Invalid refinement comparison");
    const proposalRepo = node.type === "branch" && typeof node.repo === "string"
      && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(node.repo) && node.repo.split("/")[0] === candidate.meta.owner ? node.repo : null;
    const action = node.humanAction;
    // Pages may serve a registry from before workloads moved into agent follow-ups.
    // humanAction() ignores its execution records. New metadata cannot publish one.
    const retiredExecution = allowRetiredExecution && action?.kind === "execution" && proposalRepo
      && /^[a-f0-9]{40}$/.test(action.sourceHead) && commitLinkMatches(proposalRepo, action.sourceHead, action.url);
    validateHumanAction(node, retiredExecution);
    if (node.additionalReviews !== undefined && (!Array.isArray(node.additionalReviews) || node.type !== "pr" || action ||
        node.additionalReviews.some(review => review?.kind !== "review"))) throw new Error("Invalid additional review");
    const decisions = node.contributorReview === undefined ? [] : [node.contributorReview];
    for (const decision of decisions.concat(node.additionalReviews || [])) {
      const proposal = node.type === "branch" && proposalRepo && /^[a-f0-9]{40}$/.test(decision?.head)
        && (commitLinkMatches(proposalRepo, decision.head, decision.url)
          || /^[a-f0-9]{40}$/.test(decision.baseHead)
            && decision.url === `https://github.com/${proposalRepo}/compare/${decision.baseHead.slice(0, 9)}...${decision.head.slice(0, 9)}`
          || /^[a-f0-9]{40}$/.test(decision.baseHead)
            && decision.url === `https://github.com/${proposalRepo}/compare/${decision.baseHead}...${decision.head}`);
      const amendment = node.type === "pr" && decision?.kind === "amendment"
        && /^[a-f0-9]{40}$/.test(decision.head) && /^[a-f0-9]{40}$/.test(decision.baseHead)
        && decision.head !== decision.baseHead
        && commitLinkMatches(`${candidate.meta.owner}/${node.repo.split("/")[1]}`, decision.head, decision.url)
        && [decision.title, decision.summary, decision.body].every(value => typeof value === "string" && value.trim());
      const outgoing = ["pr", "issue"].includes(node.type) && ["reply", "review", "issue"].includes(decision?.kind)
        && (node.type === "issue" && decision.head === undefined || /^[a-f0-9]{40}$/.test(decision.head))
        && (decision.kind === "issue" ? validIssueDraft(decision)
          : decision.url === node.url || decision.url?.startsWith(node.url + "#") ||
          decision.kind === "review" && decision.url?.startsWith(node.url + "/files#diff-") &&
            /^[a-f0-9]{64}[LR][1-9]\d*$/.test(decision.url.slice((node.url + "/files#diff-").length)))
        && typeof decision.title === "string" && decision.title.trim()
        && typeof decision.summary === "string" && decision.summary.trim()
        && typeof decision.body === "string" && decision.body.trim();
      if (!decision || decision.status !== "pending" || !proposal && !amendment && !outgoing
          || decision.body !== undefined && typeof decision.body !== "string"
          || decision.replyBody !== undefined && (!["proposal", "amendment"].includes(decision.kind)
            || typeof decision.replyBody !== "string" || !decision.replyBody.trim())
          || decision.summary !== undefined && typeof decision.summary !== "string"
          || decision.title !== undefined && typeof decision.title !== "string") throw new Error(`Invalid contributor decision for ${node.id}`);
    }
    const changes = node.contributorChangesRequested;
    if (changes !== undefined && (!changes || node.type !== "branch" || node.contributorReview !== undefined ||
        !/^[a-f0-9]{40}$/.test(changes.head) || !proposalRepo || !commitLinkMatches(proposalRepo, changes.head, changes.url)))
      throw new Error("Invalid contributor changes request");
    const patch = node.approvedPatch;
    if (patch !== undefined && (!patch || node.type !== "pr" || node.repo !== "google/gvisor"
        || ![patch.head, patch.approvedHead, patch.oldPatchId, patch.newPatchId].every(value => typeof value === "string" && /^[a-f0-9]{40}$/.test(value))
        || patch.head === patch.approvedHead || !["stable-patch-id", "reviewed-context-only"].includes(patch.method)
        || patch.method === "stable-patch-id" && patch.oldPatchId !== patch.newPatchId
        || patch.earlierExport !== undefined && !certifiedEarlierExport(patch)
        || ![patch.reviewId, patch.reviewer].every(value => typeof value === "string" && value.trim())
        || ![patch.submittedAt, patch.verifiedAt].every(value => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)))
        || Date.parse(patch.submittedAt) > Date.parse(patch.verifiedAt) || Date.parse(patch.verifiedAt) > Date.parse(candidate.meta.updatedAt)))
      throw new Error("Invalid approved patch equivalence");
    const recovery = node.ciRecovery;
    if (recovery !== undefined) {
      if (!recovery || node.type !== "pr" || !Object.hasOwn(policies, node.repo)
          || !/^[a-f0-9]{40}$/.test(recovery.sourceHead)
          || !Number.isFinite(Date.parse(recovery.observedAt)) || Date.parse(recovery.observedAt) > Date.parse(candidate.meta.updatedAt))
        throw new Error("Invalid CI recovery record");
      if (recovery.kind === "source-check-authentication") {
        if (recovery.reason !== "missing-api-key" || !Array.isArray(recovery.checks) || !recovery.checks.length
            || !recovery.checks.every(item => item && [item.id, item.name].every(value => typeof value === "string" && value.trim())
              && Number.isSafeInteger(item.workflowRun) && item.workflowRun > 0 && Number.isSafeInteger(item.job) && item.job > 0
              && item.jobURL === `https://github.com/${node.repo}/actions/runs/${item.workflowRun}/job/${item.job}`)
            || new Set(recovery.checks.map(item => item.id)).size !== recovery.checks.length)
          throw new Error("Invalid CI recovery record");
      } else if (recovery.kind === "shared-source-fix") {
        const remedy = candidate.nodes.find(item => item.id === recovery.remedy);
        const ancestry = [recovery.fixCommit, recovery.sourceContainsFix, recovery.ancestryURL];
        if (remedy?.type !== "pr" || remedy.repo !== node.repo || remedy.id === node.id
            || !candidate.edges.some(edge => edge.from === remedy.id && edge.to === node.id && edge.type === "blocked_by")
            || ancestry.some(value => value !== undefined) && (!/^[a-f0-9]{40}$/.test(recovery.fixCommit)
              || typeof recovery.sourceContainsFix !== "boolean"
              || recovery.ancestryURL !== `https://github.com/${node.repo}/compare/${recovery.fixCommit}...${recovery.sourceHead}`)
            || !Array.isArray(recovery.checks) || !recovery.checks.length
            || !recovery.checks.every(item => item && Number.isSafeInteger(item.number) && item.number > 0
              && /^[a-f0-9]{40}$/.test(item.head) && (item.number !== node.number || item.head === recovery.sourceHead)
              && [item.id, item.name].every(value => typeof value === "string" && value.trim())
              && Number.isSafeInteger(item.workflowRun) && item.workflowRun > 0 && Number.isSafeInteger(item.job) && item.job > 0
              && item.jobURL === `https://github.com/${node.repo}/actions/runs/${item.workflowRun}/job/${item.job}`)
            || new Set(recovery.checks.map(item => item.id)).size !== recovery.checks.length)
          throw new Error("Invalid shared source fix recovery");
      } else if (recovery.kind !== "dependency-download-retry-denied" || node.repo !== candidate.meta.repo || recovery.httpStatus !== 403
        || !/^[a-f0-9]{40}$/.test(recovery.importHead)
        || !Number.isSafeInteger(recovery.importNumber) || recovery.importNumber <= 0
        || !Number.isSafeInteger(recovery.workflowRun) || recovery.workflowRun <= 0
        || !Number.isSafeInteger(recovery.job) || recovery.job <= 0
        || recovery.jobURL !== `https://github.com/${candidate.meta.repo}/actions/runs/${recovery.workflowRun}/job/${recovery.job}`
        || ![recovery.checkId, recovery.checkName].every(value => typeof value === "string" && value.trim())
        || !Array.isArray(recovery.statuses)
        || !recovery.statuses.every(item => item && [item.id, item.name].every(value => typeof value === "string" && value.trim()))
        || new Set(recovery.statuses.map(item => item.name)).size !== recovery.statuses.length
        || new Set([recovery.checkId, ...recovery.statuses.map(item => item.id)]).size !== recovery.statuses.length + 1)
      throw new Error("Invalid CI recovery record");
    }
  }
  const ids = new Set(candidate.nodes.map((node) => node.id));
  if (ids.size !== candidate.nodes.length) throw new Error("Registry contains duplicate identities");
  for (const edge of candidate.edges) if (edge.role !== undefined && (edge.role !== "proposed_update" || edge.type !== "includes" ||
      candidate.nodes.find(node => node.id === edge.from)?.type !== "branch" || candidate.nodes.find(node => node.id === edge.to)?.type !== "pr")) throw new Error("Invalid proposed update relationship");
  if (candidate.investigations !== undefined) {
    if (!Array.isArray(candidate.investigations)) throw new Error("Invalid investigations");
    const evidenceValid = entries => Array.isArray(entries) && entries.every(entry => entry && typeof entry.label === "string" && entry.label.trim() && typeof entry.url === "string" && safeURL(entry.url));
    const nonemptyText = value => typeof value === "string" && value.trim();
    for (const item of candidate.investigations) {
      if (!item || typeof item.id !== "string" || !/^investigation:[a-z0-9][a-z0-9-]{0,79}$/.test(item.id) || ids.has(item.id) ||
          !["active", "concluded"].includes(item.status) || ![item.title, item.owner, item.summary].every(value => typeof value === "string" && value.trim()) ||
          !Number.isFinite(Date.parse(item.updatedAt)) || (item.nextStep !== undefined && typeof item.nextStep !== "string") || !evidenceValid(item.evidence) ||
          !Array.isArray(item.findings) || !item.findings.every(finding => finding && typeof finding.text === "string" && finding.text.trim() && evidenceValid(finding.evidence)))
        throw new Error("Invalid investigation record");
      if (item.additionalReviews !== undefined) throw new Error(`Invalid additional review for ${item.id}`);
      const repo = item.repo === undefined ? candidate.meta.repo : item.repo;
      if (typeof repo !== "string" || !Object.hasOwn(policies, repo)) throw new Error(`Invalid investigation repository for ${item.id}`);
      validateHumanAction(item);
      if (item.humanAction && (!item.group || item.status !== "active" || !item.settledReviews?.some(review =>
          review.kind === "proposal" && review.outcome === "approved" && review.head === item.head
          && commitLinkMatches(`${candidate.meta.owner}/${repo.split("/")[1]}`, review.head, review.url))))
        throw new Error("Invalid investigation submission");
      if (item.defaultBranchCheck !== undefined && (repo !== candidate.meta.repo
          || !nonemptyText(item.defaultBranchCheck?.context) || !nonemptyText(item.defaultBranchCheck?.onSuccess)))
        throw new Error("Invalid default-branch investigation check");
      const draft = item.contributorReview;
      if (draft !== undefined) {
        const issue = repo === candidate.meta.repo && validIssueDraft(draft) && draft.head === undefined
          && draft.url === `https://github.com/${candidate.meta.repo}/issues/new`;
        const fix = draft?.kind === "proposal" && [draft.head, draft.baseHead].every(head => /^[a-f0-9]{40}$/.test(head))
          && draft.head !== draft.baseHead && [draft.title, draft.summary, draft.body].every(nonemptyText)
          && commitLinkMatches(`${candidate.meta.owner}/${repo.split("/")[1]}`, draft.head, draft.url);
        if (!item.group || draft?.status !== "pending" || !issue && !fix)
          throw new Error(`Invalid contributor decision for ${item.id}`);
      }
      if (item.comparisons !== undefined && (!Array.isArray(item.comparisons) || !item.comparisons.every(comparison => comparison &&
          [comparison.title, comparison.description, comparison.note].every(nonemptyText) &&
          Array.isArray(comparison.columns) && comparison.columns.length >= 2 && comparison.columns.every(nonemptyText) &&
          Array.isArray(comparison.rows) && comparison.rows.length > 0 && comparison.rows.every(row => Array.isArray(row) && row.length === comparison.columns.length && row.every(nonemptyText)) &&
          evidenceValid(comparison.evidence) && comparison.evidence.length > 0))) throw new Error("Invalid investigation comparison");
      if (item.group !== undefined && !candidate.groups.some(group => group.id === item.group)) throw new Error("Invalid investigation group");
      ids.add(item.id);
    }
  }
  const graphIds = new Set(registryNodes(candidate).map(node => node.id));
  if (candidate.edges.some(edge => !graphIds.has(edge.from) || !graphIds.has(edge.to))) throw new Error("Registry contains invalid relationships");
}
function updateRegistryControls() {
  const group = $("group-filter").value;
  $("group-filter").replaceChildren(element("option", "", "All workstreams"));
  $("group-filter").firstChild.value = "";
  for (const item of [...registry.groups, { id: "new", label: "New · not yet grouped" }]) {
    const option = element("option", "", item.label); option.value = item.id; $("group-filter").append(option);
  }
  $("group-filter").value = [...$("group-filter").options].some((option) => option.value === group) ? group : "";
  $("registry-age").textContent = `Registry reviewed ${date(registry.meta.updatedAt)}`;
}
function validateSnapshotSource(snapshot, nextRegistry) {
  if (snapshot?.schema !== 1 || snapshot.repo !== nextRegistry.meta.repo || snapshot.owner !== nextRegistry.meta.owner ||
      !Number.isFinite(Date.parse(snapshot.checkedAt)) || !Array.isArray(snapshot.prs) || !snapshot.issues) throw new Error("Invalid GitHub snapshot");
}
function validateSnapshot(snapshot, nextRegistry = registry) {
  validateSnapshotSource(snapshot, nextRegistry);
  if (snapshot.mergedOnly || snapshot.registryDate !== nextRegistry.meta.updatedAt) throw new Error("Published registry and GitHub snapshot revisions differ");
  if (snapshot.defaultBranchChecks !== undefined) {
    const rows = snapshot.defaultBranchChecks;
    if (!rows || typeof rows !== "object" || Array.isArray(rows)) throw new Error("Invalid default-branch checks");
    for (const [id, row] of Object.entries(rows)) {
      const item = (nextRegistry.investigations || []).find(record => record.id === id);
      if (!item?.defaultBranchCheck || item.status !== "active" || !row || row.context !== item.defaultBranchCheck.context
          || typeof row.branch !== "string" || !row.branch.trim() || !/^[a-f0-9]{40}$/.test(row.head)
          || !["EXPECTED", "PENDING", "ERROR", "FAILURE", "SUCCESS", "MISSING"].includes(row.state)
          || row.url != null && !safeURL(row.url) || row.description != null && typeof row.description !== "string"
          || row.state === "MISSING" && (row.url != null || row.description != null))
        throw new Error("Invalid default-branch check observation");
    }
  }
  if (snapshot.ciFlakes !== undefined) {
    const scan = snapshot.ciFlakes, slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/;
    if (!scan || !Number.isFinite(Date.parse(scan.checkedAt)) || !scan.pipelines || Array.isArray(scan.pipelines) ||
        typeof scan.pipelines !== "object" || Object.entries(scan.pipelines).some(([name, state]) =>
          !slug.test(name) || !state || typeof state.status !== "string" || (state.error != null && typeof state.error !== "string") ||
          (state.recentBuilds != null && (!Array.isArray(state.recentBuilds) || state.recentBuilds.some(number =>
            !Number.isSafeInteger(number) || number < state.nextBuild || number > state.latest)))) ||
        !Array.isArray(scan.observations) || scan.observations.some(row => !row || !Object.hasOwn(scan.pipelines, row.pipeline) ||
          !Number.isSafeInteger(row.build) || row.build < 1 || !/^[a-f0-9]{40}$/.test(row.head) ||
          (row.pr != null && (!Number.isSafeInteger(row.pr) || row.pr < 1)) || typeof row.job !== "string" || !row.job.trim() ||
          !uuid.test(row.failedJob) || !uuid.test(row.passedJob) || row.failedJob === row.passedJob ||
          (row.failedState != null && !["finished", "timed_out", "expired"].includes(row.failedState)) ||
          !Number.isFinite(Date.parse(row.finishedAt)) || (row.exitCode != null && !Number.isInteger(row.exitCode))))
      throw new Error("Invalid CI flake scan");
    if (scan.actions) {
      const positive = value => Number.isSafeInteger(value) && value > 0;
      if (typeof scan.actions.status !== "string" || !Array.isArray(scan.actions.observations) ||
          scan.actions.observations.some(row => !row || !positive(row.run) || !positive(row.failedJob) ||
            !positive(row.passedJob) || row.failedJob === row.passedJob || !/^[0-9a-f]{40}$/.test(row.head) ||
            ![row.workflow, row.job].every(value => typeof value === "string" && value.trim()) ||
            !Number.isFinite(Date.parse(row.finishedAt)) || (row.pr != null && !positive(row.pr))))
        throw new Error("Invalid GitHub Actions retry evidence");
      const reports = scan.actions.reports;
      if (reports && (!Array.isArray(reports.items) || typeof reports.sample !== "string" ||
          reports.items.some(item => !item || !positive(item.number) || !["issue", "pr"].includes(item.kind) ||
            typeof item.title !== "string" || !item.title.trim() || !["open", "closed", "merged"].includes(item.state) ||
            item.url !== `https://github.com/google/gvisor/${item.kind === "pr" ? "pull" : "issues"}/${item.number}` ||
            !Number.isFinite(Date.parse(item.updatedAt))))) throw new Error("Invalid gVisor CI flake report");
    }
  }
  if (snapshot.outreachPostingMode !== undefined && !["all", "rotations", "paused", "unknown"].includes(snapshot.outreachPostingMode))
    throw new Error("Invalid outreach posting status");
  if (snapshot.reviewOutreach !== undefined) {
    if (!snapshot.reviewOutreach || typeof snapshot.reviewOutreach !== "object" || Array.isArray(snapshot.reviewOutreach))
      throw new Error("Invalid gVisor review outreach");
    for (const [id, row] of Object.entries(snapshot.reviewOutreach)) {
      if (!row || String(row.number) !== id || !/^[1-9]\d*$/.test(id) || !/^[a-f0-9]{40}$/.test(row.head) ||
          !["due", "verify-mergeability", "waiting", "needs-reviewer", "incomplete", "native-request-denied"].includes(row.status) ||
          row.kind !== undefined && row.kind !== "import-status" ||
          [row.lastActivityURL, row.lastContactURL].some(url => url !== undefined && !/^https:\/\/github\.com\/google\/gvisor\/pull\/[1-9]\d*(?:#[a-z0-9_-]+)?$/i.test(url)) ||
          row.status !== "incomplete" && !Number.isFinite(Date.parse(row.dueAt)) ||
          row.status === "native-request-denied" && (!/^[A-Za-z0-9-]+$/.test(row.reviewer) || ![403, 404, 422].includes(row.http)) ||
          ["due", "verify-mergeability"].includes(row.status) && (!["request", "comment"].includes(row.channel) || !/^[A-Za-z0-9-]+$/.test(row.reviewer) ||
            !row.reason || !/^https:\/\/github\.com\/google\/gvisor\//.test(row.evidence)))
        throw new Error("Invalid gVisor review outreach record");
    }
  }
  if (snapshot.incomingReviewRequests !== undefined) {
    if (!Array.isArray(snapshot.incomingReviewRequests) || snapshot.incomingReviewRequests.some(item => {
      if (!item || !/^[\w.-]+\/[\w.-]+$/.test(item.repo) || !Number.isSafeInteger(item.number) || item.number < 1) return true;
      const prURL = `https://github.com/${item.repo}/pull/${item.number}`;
      if (item.sourceURL !== undefined && (item.repo !== "google/gvisor" || item.kind !== "comment" || item.url !== prURL
          || !/^https:\/\/github\.com\/google\/gvisor\/pull\/[1-9]\d*#issuecomment-[1-9]\d*$/.test(item.sourceURL))) return true;
      return item.prURL !== prURL || typeof item.url !== "string" || item.url.split("#")[0] !== prURL
        || !["formal", "description", "comment", "review", "inline"].includes(item.kind)
        || typeof item.id !== "string" || !item.id || typeof item.title !== "string" || !item.title
        || !/^[a-f0-9]{40}$/.test(item.head) || (item.author != null && typeof item.author !== "string")
        || !Number.isFinite(Date.parse(item.updatedAt));
    })) throw new Error("Invalid incoming PR review request");
  }
  const issueNodes = (snapshot.issueInventoryVersion === 2 ? registryNodes(nextRegistry) : nextRegistry.nodes || []).filter(node => node.type === "issue" && node.repo && node.number);
  if (issueNodes.length !== Object.keys(snapshot.issues).length || issueNodes.some(node => !Object.hasOwn(snapshot.issues, node.id)))
    throw new Error("Incomplete issue inventory");
  for (const [id, issue] of Object.entries(snapshot.issues)) {
    const node = issueNodes.find(node => node.id === id);
    if (!node || !["open", "closed", "unknown"].includes(issue.githubState)
        || (issue.githubState === "unknown" ? !issue.unavailable : !Number.isFinite(Date.parse(issue.updatedAt)))
        || (issue.githubStateReason != null && typeof issue.githubStateReason !== "string")
        || (issue.githubURL != null && issue.githubURL !== `https://github.com/${node.repo}/issues/${node.number}`)
        || (issue.comments != null && (!Array.isArray(issue.comments) || issue.comments.some(comment =>
          !comment || typeof comment.url !== "string" || comment.url.split("#")[0] !== issue.githubURL
            || !/#issuecomment-\d+$/.test(comment.url) || !Number.isFinite(Date.parse(comment.updatedAt)))))
        || (issue.issueFeedback != null && (issue.authorLogin !== nextRegistry.meta.owner ||
          !Array.isArray(issue.issueFeedback) || issue.issueFeedback.some(row =>
          !row || row.repo !== node.repo || row.number !== node.number || row.issue !== id || row.kind !== "issue-comment"
          || !issue.comments?.some(comment => row.id === comment.id && row.url === comment.url &&
            row.updatedAt === comment.updatedAt && row.author === comment.author?.login && comment.author?.__typename === "User"
            && row.author !== nextRegistry.meta.owner))))
        || (issue.closedAt != null && !Number.isFinite(Date.parse(issue.closedAt)))
        || (issue.checkedAt != null && !Number.isFinite(Date.parse(issue.checkedAt)))
        || (issue.unavailable != null && (typeof issue.unavailable !== "string" || !issue.unavailable.trim()
          || !Number.isFinite(Date.parse(issue.unavailableAt)))))
      throw new Error("Invalid issue provider identity or state");
  }
  if (snapshot.workStates !== undefined) {
    if (!snapshot.workStates || Array.isArray(snapshot.workStates) || typeof snapshot.workStates !== "object") throw new Error("Invalid state history");
    for (const [identity, records] of Object.entries(snapshot.workStates)) {
      if (!records || Array.isArray(records) || typeof records !== "object") throw new Error("Invalid state records");
      for (const [state, record] of Object.entries(records)) {
        const pr = snapshot.prs.find(item => prIdentity(item, nextRegistry) === identity);
        const patch = pr && ["awaiting-import", "waiting-merge"].includes(state)
          ? approvedPatch({ ...nextRegistry.nodes?.find(node => node.id === identity), github: pr }) : null;
        const sourceTime = pr && state !== "contributor-review" ? Math.max(Date.parse(pr.checkedAt || snapshot.checkedAt),
          ["merged", "closed"].includes(state) && pr.statusObservation ? Date.parse(pr.statusObservation.checkedAt) : 0,
          patch ? Date.parse(patch.verifiedAt) : 0)
          : Date.parse(nextRegistry.meta.updatedAt);
        const observedTime = Date.parse(record?.observedAt ?? snapshot.checkedAt);
        if ((!Object.hasOwn(STATE_LABELS, state) && state !== "review") || !record || !["observed", "transition", "unknown"].includes(record.basis) ||
            (record.observedAt !== undefined && (typeof record.observedAt !== "string" || !Number.isFinite(observedTime) || !Number.isFinite(sourceTime) || observedTime > sourceTime)) ||
            (record.basis === "unknown" ? record.scope !== null || record.since !== null :
              typeof record.scope !== "string" || !Number.isFinite(Date.parse(record.since)) || Date.parse(record.since) > observedTime) || (record.qualifier != null && typeof record.qualifier !== "string")) throw new Error("Invalid state observation");
      }
    }
  }
  const configured = repositoryPolicies(nextRegistry);
  const suppliers = (nextRegistry.nodes || []).filter(node => node.type === "pr" && !Object.hasOwn(configured, node.repo));
  // Older snapshots may predate observation of a registered supplier. Only
  // repositories actually observed in this snapshot can supply live PRs.
  const policies = snapshot.repositories || configured;
  if (Object.entries(configured).some(([repo, policy]) => policies[repo] !== policy) ||
      Object.entries(policies).some(([repo, policy]) => !Object.hasOwn(configured, repo) &&
        (policy !== "none" || !suppliers.some(node => node.repo === repo)))) throw new Error("Snapshot repository policies differ");
  if (Object.keys(configured).length > 1 && !snapshot.repositories) throw new Error("Snapshot lacks repository inventory");
  const numbers = new Set();
  for (const pr of snapshot.prs) {
    const identity = prIdentity(pr, nextRegistry), repo = prRepo(pr, nextRegistry), policy = policies[repo];
    if (!Number.isInteger(pr.number) || numbers.has(identity) || !Array.isArray(pr.imports) || !policy ||
        (!Object.hasOwn(configured, repo) && !suppliers.some(node => node.id === identity)) ||
        pr.url !== `https://github.com/${repo}/pull/${pr.number}` ||
        (pr.importPolicy !== undefined && pr.importPolicy !== policy) ||
        (policy === "none" && (pr.importPolicy !== "none" || pr.imports.length))) throw new Error("Invalid PR inventory");
    numbers.add(identity);
    if (pr.publicImportDisposition !== undefined) {
      const disposition = publicImportDisposition({ ...nextRegistry.nodes.find(node => node.id === identity), github: pr }, snapshot.reviewAuthority === undefined);
      if (!disposition || !["exact", "equivalent", "amended", "none"].includes(disposition.scope)
          || !["conflicting", "open", "draft", "merged", "closed", "absent", "unknown"].includes(disposition.state)
          || ![null, "author-conflicts", "maintainer-import-refresh", "maintainer-reapproval", "maintainer-import-label", "maintainer-reimport", "maintainer-import-landed"].includes(disposition.action)
          || typeof disposition.description !== "string") throw new Error("Invalid public import disposition");
    }
    for (const item of [pr, ...pr.imports]) {
      if (item.branchHead != null && !/^[a-f0-9]{40}$/.test(item.branchHead)) throw new Error("Invalid source branch head");
      if (prRepo(item, nextRegistry) !== repo || item.url !== `https://github.com/${repo}/pull/${item.number}`) throw new Error("Invalid PR URL identity");
      const observation = item.mergeabilityObservation;
      if (item.mergeabilityCheckedAt != null && (!Number.isFinite(Date.parse(item.mergeabilityCheckedAt)) || Date.parse(item.mergeabilityCheckedAt) > Date.parse(item.checkedAt))) throw new Error("Invalid mergeability observation time");
      if (item.base != null && !/^[a-f0-9]{40}$/.test(item.base)) throw new Error("Invalid PR base");
      if (item.mergeCommit != null && !/^[a-f0-9]{40}$/.test(item.mergeCommit)) throw new Error("Invalid PR merge commit");
      if (item.headRepo != null && (typeof item.headRepo !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(item.headRepo))) throw new Error("Invalid PR head repository");
      if (observation != null && (!["MERGEABLE", "CONFLICTING"].includes(observation.state) ||
          !/^[a-f0-9]{40}$/.test(observation.head) || (observation.base != null && !/^[a-f0-9]{40}$/.test(observation.base)) ||
          !Number.isFinite(Date.parse(observation.checkedAt)) || Date.parse(observation.checkedAt) > Date.parse(item.checkedAt))) throw new Error("Invalid mergeability observation");
      if (!/^[a-f0-9]{40}$/.test(item.head) || !Array.isArray(item.labels) || !item.threads ||
          !Number.isFinite(Date.parse(item.checkedAt)) || (item.checks && !Array.isArray(item.checks.contexts))) throw new Error("Invalid PR attributes");
      const references = item.crossReferences;
      if (references !== undefined && (!references || typeof references.complete !== "boolean" || !Array.isArray(references.items) ||
          references.items.length > 100 || new Set(references.items.map(event => event?.id)).size !== references.items.length ||
          !references.items.every(event => event && typeof event.id === "string" && event.id.trim() && Number.isFinite(Date.parse(event.createdAt)) &&
            event.source?.__typename === "PullRequest" && Number.isSafeInteger(event.source.number) && event.source.number > 0 &&
            /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(event.source.repository?.nameWithOwner) &&
            event.source.repository.isPrivate === false &&
            event.source.url === `https://github.com/${event.source.repository.nameWithOwner}/pull/${event.source.number}` &&
            /^[a-f0-9]{40}$/.test(event.source.headRefOid) && Number.isFinite(Date.parse(event.source.updatedAt)) &&
            typeof event.source.title === "string" && typeof event.source.body === "string" &&
            (event.source.author == null || typeof event.source.author.login === "string")))) throw new Error("Invalid PR cross-references");
      if (item.checks?.supersededContexts !== undefined && (!Array.isArray(item.checks.supersededContexts) ||
          item.checks.reportedTotal !== item.checks.total + item.checks.supersededContexts.length)) throw new Error("Invalid check attempt inventory");
      for (const check of [...(item.checks?.contexts || []), ...(item.checks?.supersededContexts || [])]) {
        if (check.description != null && typeof check.description !== "string") throw new Error("Invalid check description");
        if (check.id !== undefined && (typeof check.id !== "string" || !check.id.trim())) throw new Error("Invalid check identity");
        if (check.purpose !== undefined && !["validation", "reviewer-assignment"].includes(check.purpose)) throw new Error("Invalid check purpose");
        if (check.purpose === "reviewer-assignment" && (check.kind !== "check-run" || check.appSlug !== "github-actions" || check.workflow !== "Auto Assign" || check.name !== "assign")) throw new Error("Unverified administrative check identity");
      }
    }
  }
}
function snapshotForRegistry(snapshot, nextRegistry) {
  if (!snapshot?.mergedOnly && snapshot?.registryDate === nextRegistry.meta.updatedAt) {
    validateSnapshot(snapshot, nextRegistry);
    return snapshot;
  }
  validateSnapshotSource(snapshot, nextRegistry);
  if (!Number.isFinite(Date.parse(snapshot.registryDate))) throw new Error("Invalid snapshot registry revision");
  // A merged PR cannot reopen. Other provider data belongs to a different registry.
  const prs = [];
  for (const pr of snapshot.prs) {
    if (pr?.status === "merged" && Number.isSafeInteger(pr.number) && pr.number > 0 &&
        pr.url === `https://github.com/${prRepo(pr, nextRegistry)}/pull/${pr.number}` &&
        Date.parse(pr.mergedAt) <= Date.parse(snapshot.checkedAt)) {
      prs.push({ repo: prRepo(pr, nextRegistry), number: pr.number, url: pr.url, status: "merged", mergedAt: pr.mergedAt });
    }
  }
  const { schema, repo, owner, registryDate, checkedAt } = snapshot;
  return { schema, repo, owner, registryDate, checkedAt, prs, issues: {}, mergedOnly: true };
}
function preferSnapshot(first, second) {
  if (first.mergedOnly && !second.mergedOnly) return second;
  if (!first.mergedOnly && second.mergedOnly) return first;
  const latest = Date.parse(first.checkedAt) >= Date.parse(second.checkedAt) ? first : second;
  if (!latest.mergedOnly) return latest;
  const merges = new Map([...first.prs, ...second.prs].map(pr => [pr.url, pr]));
  return { ...latest, prs: [...merges.values()] };
}
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  if (!refreshing && document.visibilityState === "visible") {
    const delay = Math.max(0, lastAttempt + REFRESH_INTERVAL_MS - Date.now());
    refreshTimer = setTimeout(() => refresh(true), delay);
  }
}
async function readSnapshot(base) {
  const options = { cache: "no-cache", credentials: "omit", signal: AbortSignal.timeout(10000) };
  const [registryResponse, snapshotResponse] = await Promise.all([
    fetch(base + "registry.json", options), fetch(base + "github-status.json", options),
  ]);
  if (!registryResponse.ok) throw new Error(`Registry returned ${registryResponse.status}`);
  if (!snapshotResponse.ok) throw new Error(`Snapshot returned ${snapshotResponse.status}`);
  const [nextRegistry, snapshot] = await Promise.all([registryResponse.json(), snapshotResponse.json()]);
  validateRegistry(nextRegistry, { allowRetiredExecution: true });
  if (nextRegistry.meta.repo !== registry.meta.repo || nextRegistry.meta.owner !== registry.meta.owner) throw new Error("Registry repository changed");
  if (Date.parse(nextRegistry.meta.updatedAt) < Date.parse(registry.meta.updatedAt)) throw new Error("Published registry is older than the displayed registry");
  return [nextRegistry, snapshotForRegistry(snapshot, nextRegistry)];
}
async function publishedSnapshot() {
  if (globalThis.location?.hostname !== "tamird.github.io") return readSnapshot("");
  const raw = "https://raw.githubusercontent.com/tamird/sty/";
  const loadCommittedPair = async () => {
    const response = await fetch("https://api.github.com/repos/tamird/sty/git/ref/heads/gh-pages", {
      cache: "no-cache", credentials: "omit", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Published revision returned ${response.status}`);
    const ref = await response.json();
    if (ref.ref !== "refs/heads/gh-pages" || ref.object?.type !== "commit" || !/^[a-f0-9]{40}$/.test(ref.object.sha))
      throw new Error("Invalid published revision");
    return readSnapshot(raw + ref.object.sha + "/");
  };
  // The branch can advance before Pages deploys. When its cached files don't
  // match, pin both requests to the published commit before consulting Pages.
  let latest, lastError;
  for (const load of [() => readSnapshot(raw + "refs/heads/gh-pages/"), loadCommittedPair, () => readSnapshot("")]) {
    try {
      let pair = await load();
      if (!latest) latest = pair;
      else {
        if (Date.parse(pair[0].meta.updatedAt) > Date.parse(latest[0].meta.updatedAt)) [latest, pair] = [pair, latest];
        latest[1] = preferSnapshot(latest[1], snapshotForRegistry(pair[1], latest[0]));
      }
      if (!latest[1].mergedOnly) return latest;
    } catch (error) {
      lastError = error;
    }
  }
  if (latest) return latest;
  throw lastError;
}
async function refresh(force = false) {
  if (refreshing || (force && Date.now() - lastAttempt < 10000)) return;
  let cached;
  try {
    cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && !force) applyLive(snapshotForRegistry(cached, registry));
  } catch { cached = null; }
  refreshing = true; lastAttempt = Date.now(); $("refresh").disabled = true;
  setFreshness("Loading published evidence snapshot…");
  try {
    let [nextRegistry, snapshot] = await publishedSnapshot();
    if (liveSnapshot && (snapshot.mergedOnly || liveSnapshot.registryDate === nextRegistry.meta.updatedAt))
      snapshot = preferSnapshot(snapshot, snapshotForRegistry(liveSnapshot, nextRegistry));
    applyLive(snapshot, nextRegistry);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot)); } catch { /* Storage is optional. */ }
  } catch (error) {
    setFreshness(`Snapshot unavailable · ${error.message}. ${model.checkedAt ? `Keeping snapshot from ${date(model.checkedAt)}.` : "Keeping the registry; no evidence snapshot is available."}`, true);
  } finally {
    refreshing = false;
    $("refresh").disabled = false;
    scheduleRefresh();
  }
}

function setView(next) {
  const separateView = [view, next].includes("investigations");
  if (separateView || next !== "table" && selected?.startsWith("attention-")) selected = null;
  view = next; searchEditing = false; render(!separateView, "push");
}
function resetFilters(redraw = true) {
  $("show-resolved").checked = false;
  const selectedNode = nodeMap().get(selected);
  if (selectedNode && historical(selectedNode)) selected = null;
  focus = null;
  if (view === "investigations") {
    $("investigation-search").value = ""; $("investigation-filter").value = ""; selected = null;
    if (redraw) render(false, "push"); return;
  }
  $("search").value = ""; $("group-filter").value = ""; $("show-resolved").checked = false; focus = null; stateFilters.clear(); reasonFilters.clear();
  if (redraw) render(true, "push");
}
function initialize() {
  const all = button("All", () => { stateFilters.clear(); reasonFilters.clear(); selected = null; render(true, "push"); }); all.id = "all-reasons"; $("state-filters").append(all);
  for (const owner of Object.keys(ATTENTION_OWNERS)) {
    const chooser = element("details", "attention-selector"), summary = element("summary"); summary.id = `attention-${owner}-summary`; chooser.append(summary);
    const options = element("div", "attention-options"), reasons = ATTENTION_REASONS.filter(reason => reason.owner === owner);
    options.append(button("Show this queue", () => {
      stateFilters.clear();
      reasonFilters = new Set(["queue-" + owner]);
      chooser.open = false;
      selected = null;
      render(true, "push");
    }));
    for (const reason of reasons) {
      const label = element("label"), input = element("input"); input.type = "checkbox"; input.dataset.reason = reason.id;
      input.addEventListener("change", () => {
        stateFilters.clear();
        for (const queue of QUEUE_FILTERS) reasonFilters.delete(queue);
        if (input.checked) reasonFilters.add(reason.id);
        else reasonFilters.delete(reason.id);
        selected = null;
        render(true, "push");
      });
      label.append(input, element("span", "", reason.title)); options.append(label);
    }
    chooser.append(options); $("state-filters").append(chooser);
  }
  const countsNote = element("span", "notice", "Recovery snapshot: live review and check receipts are not collected.");
  countsNote.id = "queue-counts-note"; countsNote.setAttribute("role", "status");
  $("state-filters").append(countsNote);
  $("search").addEventListener("input", searchInput);
  $("search").addEventListener("blur", () => { searchEditing = false; });
  $("investigation-search").addEventListener("input", searchInput);
  $("investigation-search").addEventListener("blur", () => { searchEditing = false; });
  $("investigation-filter").addEventListener("change", () => { if ($("investigation-filter").value === "concluded") $("show-resolved").checked = true; selected = null; render(false, "push"); });
  $("group-filter").addEventListener("change", () => { if (selected?.startsWith("attention-")) selected = null; render(true, "push"); });
  $("show-resolved").addEventListener("change", () => {
    if (!$("show-resolved").checked) {
      selected = null; focus = null;
      if ($("investigation-filter").value === "concluded") $("investigation-filter").value = "";
    }
    render(true, "push");
  });
  $("chain-filter").addEventListener("change", () => { focus = $("chain-filter").value || null; selected = null; render(true, "push"); });
  for (const next of VIEWS) $(`${next}-view`).addEventListener("click", () => setView(next));
  for (const id of ["reset-filters", "toolbar-reset"]) $(id).addEventListener("click", () => resetFilters());
  document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
    const next = button.dataset.sort; sortDirection = sortKey === next ? -sortDirection : ["impact", "direct", "number", "age"].includes(next) ? -1 : 1; sortKey = next; render();
  }));
  $("refresh").addEventListener("click", () => refresh(true));
  document.addEventListener("visibilitychange", scheduleRefresh);
  $("handoff-copy-all").addEventListener("click", event => copyHandoff(attentionText(visibleTableGroups, model.checkedAt), "Visible items", event.currentTarget));
  $("group-by-attention").addEventListener("change", () => { tableGrouping = $("group-by-attention").checked; if (selected?.startsWith("attention-")) selected = null; render(true, "push"); });
  $("zoom-in").addEventListener("click", () => zoom(1.2)); $("zoom-out").addEventListener("click", () => zoom(1 / 1.2));
  $("fit").addEventListener("click", () => resetCamera(true, true)); $("reset-view").addEventListener("click", () => resetCamera(false));
  const graph = $("graph");
  const pointers = new Map();
  let gesture = null;
  const point = (event) => { const box = graph.getBoundingClientRect(); return { x: event.clientX - box.left, y: event.clientY - box.top }; };
  function gesturePosition() {
    const [first, second] = pointers.values();
    return second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2,
      distance: Math.hypot(second.x - first.x, second.y - first.y) } : { ...first, distance: 0 };
  }
  function anchorGesture() {
    gesture = pointers.size ? { point: gesturePosition(), camera: { ...camera } } : null;
    graph.classList.toggle("dragging", moved && pointers.size > 0);
  }
  graph.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (!pointers.size) moved = false;
    pointers.set(event.pointerId, point(event));
    if (pointers.size > 1) {
      moved = true;
      for (const id of pointers.keys()) graph.setPointerCapture(id);
    }
    anchorGesture();
  });
  graph.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, point(event));
    const position = gesturePosition();
    if (Math.abs(position.x - gesture.point.x) + Math.abs(position.y - gesture.point.y) > 4) moved = true;
    if (!moved) return;
    graph.classList.add("dragging"); graph.setPointerCapture(event.pointerId);
    const factor = gesture.point.distance > 0 ? position.distance / gesture.point.distance : 1;
    moveCamera(gesture.camera, gesture.point, position, factor);
  });
  function endPointer(event) {
    if (pointers.delete(event.pointerId)) anchorGesture();
  }
  for (const name of ["pointerup", "pointercancel"]) window.addEventListener(name, endPointer);
  graph.addEventListener("lostpointercapture", (event) => {
    // Moving implicit touch capture from a node to the graph is not an end.
    if (event.target === graph) endPointer(event);
  });
  window.addEventListener("blur", () => {
    for (const id of pointers.keys()) if (graph.hasPointerCapture(id)) graph.releasePointerCapture(id);
    pointers.clear(); moved = true; anchorGesture();
  });
  graph.addEventListener("wheel", (event) => {
    event.preventDefault(); const box = graph.getBoundingClientRect();
    if (event.ctrlKey || event.metaKey) zoom(Math.exp(-event.deltaY * .005), event.clientX - box.left, event.clientY - box.top);
    else { camera.x -= event.deltaX; camera.y -= event.deltaY; applyCamera(); }
  }, { passive: false });
  graph.addEventListener("keydown", (event) => {
    const delta = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
    if (delta) { event.preventDefault(); camera.x += delta[0]; camera.y += delta[1]; applyCamera(); }
    else if (["+", "="].includes(event.key)) zoom(1.2); else if (event.key === "-") zoom(1 / 1.2);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); $(view === "investigations" ? "investigation-search" : "search").focus(); }
    if (event.key === "Escape") { $(view === "investigations" ? "investigation-search" : "search").blur(); select(null); }
  });
  window.addEventListener("hashchange", navigateFromURL);
  window.addEventListener("popstate", navigateFromURL);
  new ResizeObserver(() => { if (view === "dag" && model) drawGraph(graphNodes()); }).observe($("graph-stage"));
}
async function start() {
  try {
    const response = await fetch("registry.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Registry returned ${response.status}`);
    registry = await response.json(); validateRegistry(registry, { allowRetiredExecution: true });
    model = { ...registry, nodes: registryNodes(registry).map(node => ({ ...node, workStates: stateRecords({}, node) })),
      groups: [...registry.groups, { id: "new", label: "New · not yet grouped" }] };
    updateRegistryControls();
    // Resolve URLs against the full snapshot, including newly discovered PRs.
    // A failed refresh leaves the validated registry as the known inventory.
    await refresh();
    initialize(); const restored = restoreView(); initializing = false; render(!restored);
    if (view === "table" && tableGrouping && selected) document.getElementById(selected)?.scrollIntoView({ block: "start" });
  } catch (error) { $("visible-count").textContent = "Registry unavailable"; setFreshness(error.message, true); }
}
start();
