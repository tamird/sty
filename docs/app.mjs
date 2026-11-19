import { goals, projects, upstream } from './work-map-data.mjs';

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(text, url, className) {
  const node = element('a', text, className);
  node.href = url;
  return node;
}
function linkedParagraph(text, url) {
  const node = element('p', '');
  node.append(link(text, url));
  return node;
}
function evidenceDetails(label) {
  const node = element('details', '', 'evidence');
  node.append(element('summary', label));
  return node;
}
function cell(child, className) {
  const node = element('td', '', className);
  if (typeof child === 'string') node.textContent = child;
  else node.append(child);
  return node;
}
function upstreamURL(item) {
  return item.number ? `https://github.com/astral-sh/ruff/pull/${item.number}` : item.qualifiedURL;
}
function qualificationDetails(item) {
  const details = evidenceDetails('Details');
  if (item.summary) details.append(element('p', item.summary));
  if (item.qualification) {
    details.append(element('p', item.qualification.summary));
    for (const evidence of item.qualification.evidence) details.append(linkedParagraph(evidence.label, evidence.url));
  }
  if (item.qualifiedHead) details.append(element('code', item.qualifiedHead));
  if (item.source) details.append(linkedParagraph('Original fork change', `https://github.com/tamird/ruff/commit/${item.source}`));
  return details;
}
function queueRow(owner, action, label, url, primary = false) {
  const row = element('tr', '');
  row.append(cell(element('span', owner, 'owner')), cell(action), cell(link(label, url, primary ? 'primary-action' : 'small-link')));
  document.querySelector('#next-actions').append(row);
}
for (const item of upstream.filter(item => item.state === 'Awaiting Tamir review')) {
  queueRow('Tamir', `Review: ${item.title}`, 'Review commit', item.qualifiedURL, true);
}
for (const project of projects.filter(project => project.blocked)) {
  queueRow('Agent', `${project.name}: ${project.nextAction ?? project.followup}`, 'Inspect PR', `https://github.com/${project.repo}/pull/${project.number}`);
}
for (const goal of goals) {
  const item = element('li', '');
  item.append(element('strong', `${goal.title}. `), document.createTextNode(goal.detail));
  document.querySelector('#goals').append(item);
}
const merged = upstream.filter(item => item.state === 'Merged');
document.querySelector('#merged-count').textContent = `(${merged.length})`;
for (const item of merged) {
  const row = element('tr', '');
  row.append(cell(item.title), cell(link(`#${item.number}`, upstreamURL(item))), cell(link(item.merge, `https://github.com/astral-sh/ruff/commit/${item.merge}`)));
  document.querySelector('#merged-items').append(row);
}
for (const item of upstream.filter(item => item.state !== 'Merged')) {
  const row = element('tr', '');
  const title = element('div', '');
  const url = upstreamURL(item);
  if (url) title.append(link(item.title, url));
  else title.textContent = item.title;
  if (item.number) title.append(element('div', `#${item.number}`, 'muted'));
  const state = element('div', item.state, 'status');
  if (item.state === 'Awaiting Tamir review') {
    state.classList.add('blocker');
    state.append(element('div', 'Qualified; not submitted.', 'muted'));
  } else {
    state.append(element('div', item.state === 'Related upstream design' ? 'Track alternative design.' : 'Follow existing review.', 'muted'));
  }
  row.append(cell(title), cell(state), cell(qualificationDetails(item)));
  document.querySelector('#upstream-items').append(row);
}
const search = document.querySelector('#search');
const state = document.querySelector('#state');
const rows = new Map();
for (const project of projects) {
  const row = element('tr', '');
  const projectTitle = element('div', '');
  projectTitle.append(link(project.name, `https://github.com/${project.repo}/pull/${project.number}`), element('div', `#${project.number}`, 'muted'));
  const status = element('span', project.draft ? 'Draft' : 'Non-draft', project.blocked ? 'status blocker' : 'status');
  const details = evidenceDetails('Details');
  details.append(element('p', project.summary), element('p', project.checks), element('p', project.followup));
  for (const [label, url] of project.dependencies) details.append(linkedParagraph(label, url));
  details.append(element('code', project.head), linkedParagraph('Observed source', `https://github.com/tamird/${project.repo.split('/')[1]}/commit/${project.head}`));
  row.append(cell(projectTitle), cell(status), cell(project.nextAction ?? project.followup), cell(details));
  rows.set(project, row);
  document.querySelector('#projects').append(row);
}
function filter() {
  let count = 0;
  for (const project of projects) {
    const matches = JSON.stringify(project).toLowerCase().includes(search.value.toLowerCase());
    const visible = matches && (state.value === 'all' || state.value === 'blocked' && project.blocked || state.value === 'draft' && project.draft || state.value === 'non-draft' && !project.draft);
    rows.get(project).hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('#count').textContent = `${count} of ${projects.length} projects`;
}
search.addEventListener('input', filter);
state.addEventListener('change', filter);
filter();
