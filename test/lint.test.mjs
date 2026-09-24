import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const lint = (fixture) => spawnSync(process.execPath, ['bin/skillwright-lint.mjs', fixture], { encoding: 'utf8' });

test('approves a structurally valid skill', () => {
  const result = lint('test/fixtures/valid-skill/SKILL.md');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /\[APPROVED\]/);
});

test('rejects a skill without portable metadata', () => {
  const result = lint('test/fixtures/invalid-skill/SKILL.md');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /frontmatter requires description/);
});

test('portable Agent Skills copies stay synchronized with Pi sources', async () => {
  for (const name of ['author-agent-skill', 'review-agent-skill']) {
    const [portable, pi] = await Promise.all([
      readFile(`.agents/skills/${name}/SKILL.md`, 'utf8'),
      readFile(`skills/pi/${name}/SKILL.md`, 'utf8'),
    ]);
    assert.equal(portable, pi, `${name} portable copy differs from Pi source`);
  }
});
