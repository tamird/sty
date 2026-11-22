import { validateObservations } from './github-provider.mjs';
import { createHash } from 'node:crypto';

// Adapt sty's canonical records to the existing gVisor tracker schema.
export function buildRegistry({ projects, additionalProjects, upstream, goals, bazelFeedback,
  relatedChanges, languageWork, tyWork = [], inventory = {}, ruffForkAudit, solverInventory, ruffForwardAudit }, updatedAt) {
  validateForkAudit(ruffForkAudit, tyWork);
  validateSolverInventory(solverInventory, tyWork);
  validateForwardAudit(ruffForwardAudit, tyWork);
  const repo = 'astral-sh/ruff';
  const community = [...projects, ...additionalProjects];
  const repositories = Object.fromEntries([repo, 'tamird/ruff', 'bazelbuild/bazel',
    ...community.map(item => item.repo), ...languageWork.map(item => item.repo)].map(name => [name, 'none']));
  const identity = (repository, number) => repository === repo ? `pr:${number}` : `pr:${repository}:${number}`;
  const nodes = community.map(item => ({
    id: identity(item.repo, item.number), type: 'pr', repo: item.repo, number: item.number,
    title: item.title || `${item.name}: add type checking`, group: 'community',
    status: item.draft ? 'draft' : 'open', url: `https://github.com/${item.repo}/pull/${item.number}`,
    head: item.head, summary: `${item.summary}\n\nRecorded checks: ${item.checks}\n\n${item.followup}`,
    evidence: item.dependencies.map(([label, url]) => ({ label, url })).concat(item.evidence || []),
    followup: { owner: 'Agent', sourceHead: item.head, nextAction: item.nextAction },
  }));
  const edges = [];
  for (const item of relatedChanges) {
    const id = identity(item.repo, item.number);
    nodes.push({ ...item, id, type: 'pr', group: 'community', status: item.state,
      url: `https://github.com/${item.repo}/pull/${item.number}` });
    if (item.relation === 'includes') edges.push({ from: id, to: identity(...item.parent),
      type: 'includes', reason: item.summary, evidence: [`https://github.com/${item.repo}/pull/${item.number}`] });
  }
  for (const item of languageWork) nodes.push({ ...item, id: identity(item.repo, item.number),
    type: 'pr', group: 'language', status: item.state, url: `https://github.com/${item.repo}/pull/${item.number}` });
  for (const item of bazelFeedback) nodes.push({
    id: `issue:bazelbuild/bazel:${item.number}`, type: 'issue', repo: 'bazelbuild/bazel',
    number: item.number, title: item.title, group: 'bazel', status: 'Feedback filed',
    url: `https://github.com/bazelbuild/bazel/issues/${item.number}`,
    summary: `${item.summary}\n\n${item.nextAction}\n\n${item.retest?.summary || `The issue is ${item.state}; its original reproduction has not been rerun against current Bazel.`}`,
    evidence: item.retest ? [{ label: 'Current Bazel reproduction', url: item.retest.url }] : [],
  });
  for (const item of upstream) {
    const node = item.number ? {
      id: identity(repo, item.number), type: 'pr', repo, number: item.number,
      title: item.title, group: 'ty', status: item.state === 'Merged' ? 'merged' : 'open',
      url: `https://github.com/${repo}/pull/${item.number}`,
      summary: item.summary || `${item.state}. ${item.author === 'zsol' ? 'Zsol contribution; use as an upstream template.' : 'Related upstream work; inspect before proposing overlapping changes.'}`,
      evidence: item.merge ? [{ label: 'Upstream merge', url: `https://github.com/${repo}/commit/${item.merge}` }] : [],
    } : {
      id: `branch:${item.id}`, type: 'branch', repo: 'tamird/ruff',
      title: item.title, group: 'ty', status: item.state,
      ref: item.ref, url: item.qualifiedURL, evidence: [],
    };
    if (item.qualifiedHead) {
      const approval = item.settledReviews?.findLast(review => ['proposal', 'amendment'].includes(review.kind)
        && review.head === item.qualifiedHead && review.url === item.qualifiedURL);
      const permission = approval?.outcome === 'approved'
        ? approval.summary || 'Tamir approved this exact commit for upstream submission.'
        : 'This proposal is not approved for upstream submission.';
      node.head = item.qualifiedHead;
      node.summary = `${item.summary}\n\n${item.qualification?.summary || ''}\n\n${permission}`;
      node.evidence.push(...(item.qualification?.evidence || []));
      if (item.settledReviews) node.settledReviews = item.settledReviews;
      if (item.nextAction && item.state !== 'Awaiting Tamir review' && !item.contributorReview)
        node.followup = { owner: 'Agent', sourceHead: item.qualifiedHead, nextAction: item.nextAction };
      if (node.type === 'branch' && item.state === 'Awaiting Tamir review') node.contributorReview = {
        kind: 'proposal', status: 'pending', title: 'Review qualified ty proposal',
        summary: 'Review the published change and decide whether to submit upstream. Qualification is recorded in the item details. Nothing has been submitted upstream.',
        head: item.qualifiedHead, baseHead: item.qualifiedBase, url: item.qualifiedURL,
      };
    }
    if (item.contributorReview) node.contributorReview = item.contributorReview;
    if (item.refinement) node.refinement = item.refinement;
    nodes.push(node);
  }
  const registry = {
    meta: { repo, owner: 'tamird', updatedAt, repositories, inventory: { ...inventory,
      pathAudit: { scope: ruffForkAudit.scope, base: ruffForkAudit.base, fork: ruffForkAudit.fork,
        upstream: ruffForkAudit.upstream, paths: ruffForkAudit.manifest.length,
        classifications: Object.fromEntries([...new Set(ruffForkAudit.coverage.map(item => item.reconciliation))]
          .map(state => [state, ruffForkAudit.coverage.filter(item => item.reconciliation === state).length])),
        currentDeltaAudit: ruffForkAudit.currentDeltaAudit,
        url: 'https://tamird.github.io/sty/ruff-fork-audit.json' },
      solverAudit: { frozen: solverInventory.frozen, coverage: solverInventory.coverage,
        forward: { upstreamBase: solverInventory.forward.upstreamBase,
          revision: solverInventory.forward.apiCorrectionRevision, qualified: solverInventory.forward.qualified },
        limits: solverInventory.limits },
      forwardAudit: { base: ruffForwardAudit.currentBase, revision: ruffForwardAudit.currentCandidate,
        counts: ruffForwardAudit.counts, runtimeQualified: false, upstreamReady: false,
        url: 'https://tamird.github.io/sty/ruff-forward-audit.json', limits: ruffForwardAudit.limits },
    } },
    groups: [{ id: 'community', label: 'Community type checking' }, { id: 'ty', label: 'Upstream ty' },
      { id: 'bazel', label: 'Bazel feedback' }, { id: 'language', label: 'Starlark specification' }],
    nodes, edges,
    investigations: goals.map(goal => ({ id: `investigation:${goal.id}`, title: goal.title,
      owner: 'Tamir / Agent', summary: goal.detail, status: 'active', updatedAt,
      evidence: [{ label: 'sty source', url: 'https://github.com/tamird/sty' }], findings: [],
    })).concat(tyWork.map(item => ({ id: `investigation:${item.id}`, title: item.title,
      group: 'ty', owner: 'Agent', task: true, status: 'active', updatedAt,
      summary: `${item.state}. ${item.summary}`, nextStep: item.nextAction,
      findings: item.sources.map(source => ({ text: source.detail + (source.paths?.length ? ` — ${source.paths.join(', ')}` : ''),
        evidence: [{ label: source.commit, url: `https://github.com/tamird/ruff/commit/${source.commit}` }] }))
        .concat(solverInventory.units.filter(unit => unit.trackerParent === item.id).map(unit => ({
          text: `${unit.title}. ${unit.detail} Next: ${unit.nextAction}`,
          evidence: unit.evidence, sourceInventory: true,
        }))).concat(ruffForwardAudit.forwardReviewUnits.filter(unit => unit.trackerParent === item.id).map(unit => ({
          text: `${unit.title}. ${unit.classification} Next: ${unit.nextAction}`,
          evidence: unit.evidence, sourceInventory: true, forwardSourceInventory: true,
        }))),
      evidence: item.evidence || [],
    }))),
  };
  return registry;
}

export function validateForwardAudit(audit, mechanisms) {
  if (audit?.schema !== 1 || audit.runtimeQualifiedByThisAudit !== false || audit.upstreamReady !== false ||
      !Array.isArray(audit.manifest) || !Array.isArray(audit.files) || !Array.isArray(audit.forwardReviewUnits))
    throw new Error('Invalid forward source inventory');
  const sha = /^[a-f0-9]{40}$/;
  for (const ref of [audit.currentBase, audit.currentCandidate, audit.frozenBase, audit.frozenCandidate])
    if (!sha.test(ref)) throw new Error('Invalid forward source revision');
  const paths = new Map(audit.manifest.map(row => [row.path, row]));
  if (paths.size !== audit.manifest.length || paths.size !== audit.counts.netPaths)
    throw new Error('Incomplete forward path inventory');
  let raw = '';
  const zeroBlob = '0'.repeat(40);
  const reused = new Set();
  for (const row of audit.manifest) {
    if (!row.path || /[\t\n\0]/.test(row.path) || !row.disposition ||
        ![row.baseBlob, row.candidateBlob, row.frozenBaseBlob, row.frozenCandidateBlob].every(blob => sha.test(blob)) ||
        !/^[0-7]{6}$/.test(row.oldMode) || !/^[0-7]{6}$/.test(row.newMode) || !['A', 'M', 'D'].includes(row.status))
      throw new Error(`Invalid forward source path: ${row.path}`);
    raw += `:${row.oldMode} ${row.newMode} ${row.baseBlob} ${row.candidateBlob} ${row.status}\t${row.path}\n`;
    if (row.sameBaseBlobAsFrozen !== (row.baseBlob !== zeroBlob && row.baseBlob === row.frozenBaseBlob) ||
        row.sameCandidateBlobAsFrozen !== (row.candidateBlob !== zeroBlob && row.candidateBlob === row.frozenCandidateBlob))
      throw new Error(`Inconsistent forward blob equality: ${row.path}`);
    const sameFrozenPair = row.baseBlob === row.frozenBaseBlob && row.candidateBlob === row.frozenCandidateBlob;
    if (row.disposition === 'frozen-source-reused' && !sameFrozenPair)
      throw new Error(`Unproven frozen source reuse: ${row.path}`);
    if (sameFrozenPair) reused.add(row.path);
  }
  if (createHash('sha256').update(raw).digest('hex') !== audit.rawManifestSHA256 ||
      reused.size !== audit.counts.exactFrozenBlobPairs)
    throw new Error('Forward source manifest digest or frozen reuse mismatch');
  const rustPaths = [...paths.keys()].filter(path => path.includes('/src/') && path.endsWith('.rs'));
  const changed = new Set(rustPaths.filter(path => !reused.has(path)));
  if (rustPaths.length !== audit.counts.rustSourcePaths ||
      rustPaths.filter(path => reused.has(path)).length !== audit.counts.exactFrozenRustSourceBlobPairs ||
      changed.size !== audit.counts.changedRustSourcePaths || audit.files.length !== changed.size)
    throw new Error('Incomplete forward Rust source coverage');
  const reviewed = new Set();
  let hunks = 0;
  for (const row of audit.files) {
    const source = paths.get(row.path);
    if (!changed.has(row.path) || reviewed.has(row.path) || row.candidateBlob !== source.candidateBlob ||
        !row.classification || !row.detail || !row.hunks.length)
      throw new Error(`Invalid forward source attribution: ${row.path}`);
    reviewed.add(row.path);
    for (const hunk of row.hunks) {
      if (!/^[a-f0-9]{64}$/.test(hunk.sha256) || !hunk.classification ||
          hunk.source !== `https://github.com/tamird/ruff/blob/${audit.currentCandidate}/${row.path}#L${hunk.newStart}`)
        throw new Error(`Invalid forward source hunk: ${row.path}`);
      hunks++;
    }
  }
  if (hunks !== audit.counts.forwardHunks) throw new Error('Incomplete forward hunk inventory');
  if (audit.forwardReviewUnits.length !== audit.counts.forwardProducerFamilies)
    throw new Error('Incomplete forward producer inventory');
  const parents = new Set(mechanisms.map(item => item.id)), units = new Set();
  for (const unit of audit.forwardReviewUnits) {
    if (units.has(unit.id) || !parents.has(unit.trackerParent) || !unit.title || !unit.classification ||
        !unit.nextAction || !unit.evidence.length || unit.runtimeQualifiedByThisAudit !== false ||
        unit.upstreamReady !== false || unit.independentPullRequestClaim !== false)
      throw new Error(`Invalid forward producer family: ${unit.id}`);
    units.add(unit.id);
    for (const evidence of unit.evidence) {
      const prefix = `https://github.com/tamird/ruff/blob/${audit.currentCandidate}/`;
      const path = evidence.url.startsWith(prefix) ? evidence.url.slice(prefix.length).split('#')[0] : '';
      if (!paths.has(path) || evidence.blob !== paths.get(path).candidateBlob)
        throw new Error(`Unproven forward source evidence: ${unit.id}`);
    }
  }
}

// A source review unit must remain attached to an actionable task and its frozen
// source. It cannot acquire qualification merely by appearing in the inventory.
export function validateSolverInventory(audit, mechanisms) {
  if (audit?.schemaVersion !== 1 || !Array.isArray(audit.units) ||
      audit.units.length !== audit.coverage.reviewUnits) throw new Error('Incomplete solver source inventory');
  const known = new Set(mechanisms.map(item => item.id));
  const seen = new Set(), hunks = new Set();
  for (const unit of audit.units) {
    if (seen.has(unit.id) || !known.has(unit.trackerParent) || !unit.title || !unit.detail ||
        !unit.nextAction || unit.sourceReviewed !== true || unit.qualified !== false ||
        !unit.evidence.length || !unit.hunkIds.length ||
        unit.evidence.some(source => !source.url.startsWith(`https://github.com/tamird/ruff/blob/${audit.frozen.revision}/`)))
      throw new Error(`Invalid solver source unit: ${unit.id}`);
    seen.add(unit.id);
    for (const hunk of unit.hunkIds) hunks.add(hunk);
  }
  if (hunks.size !== audit.coverage.runtimeOrMixedHunks || audit.coverage.runtimeQualified !== false ||
      audit.coverage.upstreamReady !== false || audit.coverage.isPullRequestCount !== false)
    throw new Error('Unproven solver qualification or incomplete hunk attribution');
}

export function buildTracker(records, updatedAt, observations) {
  const registry = buildRegistry(records, updatedAt);
  const { repo, repositories } = registry.meta;
  const { bazelFeedback, bazelFeedbackObservedAt, ruffForkAudit } = records;
  validateObservations(observations, registry);
  const checkedAt = [bazelFeedbackObservedAt, observations.checkedAt].filter(Boolean)
    .sort((a, b) => Date.parse(a) - Date.parse(b)).at(-1);
  const snapshot = { schema: 1, repo, owner: 'tamird', registryDate: updatedAt,
    checkedAt, repositories, prs: observations.prs, issues: Object.fromEntries(bazelFeedback.map(item => [
      `issue:bazelbuild/bazel:${item.number}`, { githubState: item.state, updatedAt: item.updatedAt,
        githubURL: `https://github.com/bazelbuild/bazel/issues/${item.number}`, checkedAt: bazelFeedbackObservedAt },
    ])) };
  return { registry, snapshot, audit: ruffForkAudit };
}

// The captured Git manifest defines the audit's scope independently of its curation.
// A new or omitted path must receive an explicit disposition, including unresolved work.
export function validateForkAudit(audit, mechanisms) {
  if (audit?.schema !== 1 || audit.scope !== 'old-fork-path-audit') throw new Error('Invalid fork audit scope');
  for (const ref of [audit.base, audit.fork, audit.upstream]) {
    if (!/^[a-f0-9]{40}$/.test(ref)) throw new Error('Invalid fork audit revision');
  }
  const scope = new Map(audit.manifest.map(item => [item.path, item]));
  const coverage = new Map(audit.coverage.map(item => [item.path, item]));
  if (scope.size !== audit.manifest.length || coverage.size !== audit.coverage.length ||
      scope.size !== coverage.size || [...scope.keys()].some(path => !coverage.has(path))) {
    throw new Error('Incomplete fork path coverage');
  }
  const knownMechanisms = new Set(mechanisms.map(item => item.id));
  const categories = new Set(['host-extension-design', 'general-python-candidate',
    'already-landed-equivalent', 'supporting-tests', 'supporting-docs',
    'supporting-infrastructure', 'unreconciled']);
  const reconciliations = new Set(['partial', 'unassigned', 'support-classified',
    'exact-file-match', 'mechanism-compared']);
  for (const item of audit.coverage) {
    const receipt = scope.get(item.path);
    if (!reconciliations.has(item.reconciliation) || !item.reason ||
        !item.categories.length || item.categories.some(value => !categories.has(value)) ||
        item.mechanisms.some(id => !knownMechanisms.has(id))) throw new Error(`Invalid fork disposition: ${item.path}`);
    for (const blob of [receipt.oldBlob, receipt.newBlob]) {
      if (!/^[a-f0-9]{40}$/.test(blob)) throw new Error(`Invalid fork blob: ${item.path}`);
    }
    if (item.reconciliation === 'exact-file-match' && item.upstreamBlob !== receipt.newBlob) {
      throw new Error(`Unproven upstream file equivalence: ${item.path}`);
    }
    if (['partial', 'unassigned'].includes(item.reconciliation) && !item.categories.includes('unreconciled')) {
      throw new Error(`Hidden unresolved fork work: ${item.path}`);
    }
  }
  if (audit.currentDeltaAudit.state !== 'pending' || !audit.currentDeltaAudit.reason) {
    throw new Error('The unfinished rebased delta needs a separate audit');
  }
}
