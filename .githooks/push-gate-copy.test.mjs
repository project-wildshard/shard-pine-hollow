// Meta QA 11-26 row 29: the gate copy's install never runs without a limit. A `pnpm install` that stalls fails the copy
// within WS_GATE_STEP_S, naming the step and its last output, and leaves no copy behind. Real Git; `pnpm` is a stand-in
// on PATH that says what it is doing and then never exits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ENV } from './test-helpers.mjs';
import { GATE_DIR, installLimit, makeGateCopy } from './push-gate-copy.mjs';

const git = (cwd, args) => {
  const result = spawnSync('git', ['-c', 'user.name=T', '-c', 'user.email=t@example.com', ...args], { cwd, env: ENV, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
};

test('a stalled install fails the gate copy within its limit, naming the step and its last output', () => {
  const root = mkdtempSync(join(tmpdir(), 'push-gate-limit-'));
  try {
    git(root, ['init', '-q', '-b', 'main']);
    writeFileSync(join(root, '.gitignore'), '/tmp/\n/bin/\n');
    writeFileSync(join(root, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n");
    git(root, ['add', '.gitignore', 'pnpm-lock.yaml']);
    git(root, ['commit', '-q', '-m', 'seed']);
    mkdirSync(join(root, 'bin'));
    writeFileSync(join(root, 'bin/pnpm'), '#!/bin/sh\n[ -n "$STAND_IN_WARM" ] && exit 0\necho "Progress: resolved 12, reused 11, downloaded 0"\nexec sleep 600\n');
    chmodSync(join(root, 'bin/pnpm'), 0o755);
    // macOS checks a new executable on its first run, which can take seconds: run the stand-in once before the clock
    spawnSync(join(root, 'bin/pnpm'), [], { env: { ...ENV, STAND_IN_WARM: '1' } });
    const head = git(root, ['rev-parse', 'HEAD']), env = { ...ENV, PATH: `${join(root, 'bin')}:${ENV.PATH ?? ''}`, WS_GATE_STEP_S: '3' };
    const began = performance.now();
    assert.throws(() => makeGateCopy(root, head, { say: () => {}, env }),
      /^Error: gate step install stuck: no exit after 3 s, stopped \(limit: WS_GATE_STEP_S\); last output: Progress: resolved 12, reused 11, downloaded 0$/u);
    assert.ok((performance.now() - began) / 1000 < 12);
    const left = existsSync(join(root, GATE_DIR)) ? readdirSync(join(root, GATE_DIR)).filter((name) => !name.endsWith('.trash')) : [];
    assert.deepEqual(left, []);
    assert.equal(installLimit({}), 300);
    assert.equal(installLimit({ WS_GATE_STEP_S: '7' }), 7);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
