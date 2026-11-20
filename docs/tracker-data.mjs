import { validateObservations } from './github-provider.mjs';

// Adapt sty's canonical records to the existing gVisor tracker schema.
export function buildRegistry({ projects, additionalProjects, upstream, goals, bazelFeedback,
  relatedChanges, languageWork, tyWork = [], inventory = {}, ruffForkAudit, solverInventory }, updatedAt) {
  validateForkAudit(ruffForkAudit, tyWork);
  validateSolverInventory(solverInventory, tyWork);
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
    evidence: item.dependencies.map(([label, url]) => ({ label, url })),
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
    summary: `${item.summary}\n\n${item.nextAction}\n\nThe issue is ${item.state}; its original reproduction has not been rerun against current Bazel.`,
  });
  for (const item of upstream) {
    if (item.number) {
      nodes.push({ id: identity(repo, item.number), type: 'pr', repo, number: item.number,
        title: item.title, group: 'ty', status: item.state === 'Merged' ? 'merged' : 'open',
        url: `https://github.com/${repo}/pull/${item.number}`,
        summary: item.summary || `${item.state}. ${item.author === 'zsol' ? 'Zsol contribution; use as an upstream template.' : 'Related upstream work; inspect before proposing overlapping changes.'}`,
        evidence: item.merge ? [{ label: 'Upstream merge', url: `https://github.com/${repo}/commit/${item.merge}` }] : [],
      });
      continue;
    }
    const node = { id: `branch:${item.id}`, type: 'branch', repo: 'tamird/ruff',
      title: item.title, group: 'ty', status: item.state,
      ref: item.ref, head: item.qualifiedHead, url: item.qualifiedURL,
      summary: `${item.summary}\n\n${item.qualification?.summary || ''}\n\nTamir must approve before any upstream submission.`,
      evidence: item.qualification?.evidence || [],
    };
    if (item.nextAction) node.followup = { owner: 'Agent', sourceHead: item.qualifiedHead, nextAction: item.nextAction };
    if (item.state === 'Awaiting Tamir review') node.contributorReview = {
      kind: 'proposal', status: 'pending', title: 'Review qualified ty proposal',
      summary: 'Review the published change and decide whether to submit upstream. Qualification is recorded in the item details. Nothing has been submitted upstream.',
      head: item.qualifiedHead, baseHead: item.qualifiedBase, url: item.qualifiedURL,
    };
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
        }))),
      evidence: item.evidence || [],
    }))),
  };
  return registry;
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
