// Adapt sty's canonical records to the existing gVisor tracker schema.
export function buildTracker({ projects, upstream, goals }, updatedAt) {
  const repo = 'astral-sh/ruff';
  const repositories = Object.fromEntries([repo, 'tamird/ruff', ...projects.map(item => item.repo)].map(name => [name, 'none']));
  const identity = (repository, number) => repository === repo ? `pr:${number}` : `pr:${repository}:${number}`;
  const nodes = projects.map(item => ({
    id: identity(item.repo, item.number), type: 'pr', repo: item.repo, number: item.number,
    title: `${item.name}: add type checking`, group: 'community',
    status: item.draft ? 'draft' : 'open', url: `https://github.com/${item.repo}/pull/${item.number}`,
    head: item.head, summary: `${item.summary}\n\nRecorded checks: ${item.checks}\n\n${item.followup}`,
    evidence: item.dependencies.map(([label, url]) => ({ label, url })),
    followup: { owner: 'Agent', sourceHead: item.head, nextAction: item.nextAction },
  }));
  for (const item of upstream) {
    if (item.number) {
      nodes.push({ id: identity(repo, item.number), type: 'pr', repo, number: item.number,
        title: item.title, group: 'ty', status: item.state === 'Merged' ? 'merged' : 'open',
        url: `https://github.com/${repo}/pull/${item.number}`,
        summary: `${item.state}. ${item.author === 'zsol' ? 'Zsol contribution; use as an upstream template.' : 'Related upstream work; inspect before proposing overlapping changes.'}`,
        evidence: item.merge ? [{ label: 'Upstream merge', url: `https://github.com/${repo}/commit/${item.merge}` }] : [],
      });
      continue;
    }
    const node = { id: `branch:${item.id}`, type: 'branch', repo: 'tamird/ruff',
      title: item.title, group: 'ty', status: item.state,
      ref: 'upstream/destructured-list-elements', head: item.qualifiedHead, url: item.qualifiedURL,
      summary: `${item.summary}\n\n${item.qualification?.summary || ''}\n\nTamir must approve before any upstream submission.`,
      evidence: item.qualification?.evidence || [],
    };
    if (item.state === 'Awaiting Tamir review') node.contributorReview = {
      kind: 'proposal', status: 'pending', title: 'Review qualified ty proposal',
      summary: 'Review the published change and decide whether to submit upstream. Qualification is recorded in the item details. Nothing has been submitted upstream.',
      head: item.qualifiedHead, baseHead: item.qualifiedBase, url: item.qualifiedURL,
    };
    nodes.push(node);
  }
  const registry = {
    meta: { repo, owner: 'tamird', updatedAt, repositories },
    groups: [{ id: 'community', label: 'Community type checking' }, { id: 'ty', label: 'Upstream ty' }],
    nodes, edges: [],
    investigations: goals.map(goal => ({ id: `investigation:${goal.id}`, title: goal.title,
      owner: 'Tamir / Agent', summary: goal.detail, status: 'active', updatedAt,
      evidence: [{ label: 'sty source', url: 'https://github.com/tamird/sty' }], findings: [],
    })),
  };
  // The recovered records do not contain provider-level review/check receipts.
  // Leave those attributes absent rather than inventing complete GitHub data.
  const snapshot = { schema: 1, repo, owner: 'tamird', registryDate: updatedAt,
    checkedAt: updatedAt, repositories, prs: [], issues: {} };
  return { registry, snapshot };
}
