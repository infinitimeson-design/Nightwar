/*
  data-loader.js
  The single place that knows the data files exist and how to fetch them.
  Every other module receives plain JS arrays/objects and never touches
  fetch() or a file path itself — that's what keeps "add a scenario/role"
  a pure data-file change.

  Note: fetch() of a local JSON file requires an http(s) origin (GitHub
  Pages qualifies). Opening index.html directly via file:// will fail this
  fetch in most browsers due to CORS — run a local static server when
  developing (e.g. `npx serve` or `python -m http.server`) rather than
  double-clicking the file.
*/

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export async function loadRoles() {
  return loadJSON('data/roles.json');
}

export async function loadScenarios() {
  return loadJSON('data/scenarios.json');
}
