import { goals, projects, upstream } from './work-map-data.mjs';

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(text, url) {
  const node = element('a', text);
  node.href = url;
  return node;
}
function linkedParagraph(text, url) {
  const node = element('p', '');
  node.append(link(text, url));
  return node;
}
for (const goal of goals) {
  const card = element('article', '');
  card.append(element('h3', goal.title), element('p', goal.detail));
  document.querySelector('#goals').append(card);
}
for (const item of upstream) {
  const card = element('article', '', item.state === 'Merged' ? 'merged' : '');
  card.append(element('div', item.state, 'badge'), element('h3', item.title));
  if (item.number) card.append(linkedParagraph(`astral-sh/ruff #${item.number}`, `https://github.com/astral-sh/ruff/pull/${item.number}`));
  if (item.summary) card.append(element('p', item.summary));
  if (item.source) card.append(linkedParagraph('Original fork change', `https://github.com/tamird/ruff/commit/${item.source}`));
  if (item.qualifiedHead) card.append(linkedParagraph('Qualified adapted change', item.qualifiedURL ?? `https://github.com/tamird/ruff/commit/${item.qualifiedHead}`));
  if (item.qualification) {
    card.append(element('p', item.qualification.summary));
    for (const evidence of item.qualification.evidence) card.append(linkedParagraph(evidence.label, evidence.url));
  }
  if (item.merge) card.append(linkedParagraph('Merged upstream adaptation', `https://github.com/astral-sh/ruff/commit/${item.merge}`));
  document.querySelector('#upstream-items').append(card);
}
const grid = document.querySelector('#projects');
const search = document.querySelector('#search');
const state = document.querySelector('#state');
const cards = new Map();
for (const project of projects) {
  const card = element('article', '');
  const heading = element('h3', '');
  heading.append(link(project.name, `https://github.com/${project.repo}/pull/${project.number}`));
  card.append(heading, element('div', `${project.draft ? 'Draft PR' : 'Non-draft PR'} · #${project.number}`, 'badge'), element('p', project.summary), element('p', project.checks, 'muted'), element('p', project.followup, project.blocked ? 'blocker' : ''));
  for (const [label, url] of project.dependencies) card.append(linkedParagraph(label, url));
  const details = element('details', '');
  details.append(element('summary', 'Observed revision'), element('code', project.head), linkedParagraph('Inspect exact source', `https://github.com/tamird/${project.repo.split('/')[1]}/commit/${project.head}`));
  card.append(details);
  cards.set(project, card);
  grid.append(card);
}
function filter() {
  let count = 0;
  for (const project of projects) {
    const matches = JSON.stringify(project).toLowerCase().includes(search.value.toLowerCase());
    const visible = matches && (state.value === 'all' || state.value === 'blocked' && project.blocked || state.value === 'draft' && project.draft || state.value === 'non-draft' && !project.draft);
    cards.get(project).hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('#count').textContent = `${count} of ${projects.length} projects`;
}
search.addEventListener('input', filter);
state.addEventListener('change', filter);
filter();
