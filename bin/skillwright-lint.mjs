#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: skillwright <path/to/SKILL.md> [...]');
  process.exit(2);
}

function issue(level, file, message) {
  return { level, file, message };
}

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { error: 'missing YAML frontmatter delimited by ---' };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const field = line.match(/^\s*([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (!field) return { error: `unsupported frontmatter line: ${line}` };
    data[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
  }
  return { data, body: source.slice(match[0].length) };
}

async function lint(file) {
  const findings = [];
  let source;
  try { source = await readFile(file, 'utf8'); }
  catch (error) { return [issue('BLOCKER', file, `cannot read file: ${error.code ?? error.message}`)]; }
  const parsed = parseFrontmatter(source);
  if (parsed.error) return [issue('BLOCKER', file, parsed.error)];
  const { data, body } = parsed;
  if (!data.name) findings.push(issue('BLOCKER', file, 'frontmatter requires name'));
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) findings.push(issue('BLOCKER', file, 'name must be lowercase kebab-case'));
  else if (path.basename(path.dirname(file)) !== data.name && path.basename(file) === 'SKILL.md') findings.push(issue('RECOMMENDATION', file, `name should match containing directory (${path.basename(path.dirname(file))})`));
  if (!data.description) findings.push(issue('BLOCKER', file, 'frontmatter requires description'));
  else {
    const words = data.description.trim().split(/\s+/).filter(Boolean);
    if (!/\b(use when|when (an |the )?(agent|user|engineer|developer|team|someone) needs?)\b/i.test(data.description)) findings.push(issue('RECOMMENDATION', file, 'description should state when to use the skill'));
    if (!/\b(produces?|returns?|creates?|writes?|reports?|validates?|generates?)\b/i.test(data.description)) findings.push(issue('RECOMMENDATION', file, 'description should state its result'));
    if (words.length > 50) findings.push(issue('RECOMMENDATION', file, `description has ${words.length} words; prefer 15–50`));
  }
  if (!body.trim()) findings.push(issue('BLOCKER', file, 'skill body is empty'));
  if (!/\b(if|when) .{0,120}\b(missing|absent|not provided|unavailable)\b/i.test(body)) findings.push(issue('RECOMMENDATION', file, 'define behavior for missing required input when the skill has inputs'));
  if (/\b(write|edit|delete|deploy|publish|send|execute|run)\b/i.test(body) && !/\b(confirm|confirmation|authorize|authority|do not|must not|only .* (path|directory)|read-only)\b/i.test(body)) findings.push(issue('RECOMMENDATION', file, 'state an authority or confirmation boundary for side effects'));
  if (!/\b(return|report|output|write|create|print|produce)\b/i.test(body)) findings.push(issue('RECOMMENDATION', file, 'state the terminal output or artifact'));
  return findings;
}

const all = (await Promise.all(files.map(lint))).flat();
for (const finding of all) console.log(`${finding.level}: ${finding.file} — ${finding.message}`);
const blockers = all.filter(({ level }) => level === 'BLOCKER').length;
console.log(blockers ? `\n[REVIEW REQUIRED] ${blockers} blocker(s)` : '\n[APPROVED] no static blockers');
process.exit(blockers ? 1 : 0);
