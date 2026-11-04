import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs, promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const runProcess = promisify(execFile);
const workerPath = fileURLToPath(new URL('./simulated-worker.mjs', import.meta.url));
const guardrails = [
  'Repository: https://github.com/enzopascucci67-lang/math-learning-platform',
  'Use an isolated branch for repository work and follow AGENTS.md.',
  'Leave the lesson-resume fix pending. No paid runs, deployment, schedules, hosted Supabase, or merge.',
  'Stop for a user decision before proceeding past an approval or scope blocker.',
];

export async function supervise({ objective, maxTurns, runTurn, verify, log = console.log }) {
  let nextStep = 'Start work and report the result, remaining work, or a decision you need.';
  for (let turn = 1; turn <= maxTurns; turn++) {
    const prompt = { objective, guardrails, nextStep };
    log(`Turn ${turn} prompt: ${JSON.stringify(prompt)}`);
    const result = await runTurn(prompt);
    log(`Turn ${turn} result: ${JSON.stringify(result)}`);

    if (result.decision) {
      return { status: 'blocked', turn, detail: result.decision };
    }

    const remaining = await verify();
    if (!remaining.length) {
      return { status: 'complete', turn, detail: 'Independent verification passed.' };
    }

    nextStep = [
      `Verification found: ${remaining.join(' ')}`,
      `Previous result (worker report): ${JSON.stringify(result)}`,
      'Address the remaining checks and report the outcome.',
    ].join('\n');
  }
  return { status: 'turn-limit', turn: maxTurns, detail: nextStep };
}

async function main() {
  const { values } = parseArgs({
    options: {
      objective: { type: 'string', default: 'Produce a demo objective receipt and checklist.' },
      'max-turns': { type: 'string', default: '3' },
      scenario: { type: 'string', default: 'complete' },
    },
  });
  const objective = values.objective.trim();
  const maxTurns = Number(values['max-turns']);
  if (!objective || !Number.isSafeInteger(maxTurns) || maxTurns < 1 ||
      !['complete', 'blocker'].includes(values.scenario)) {
    throw new Error('Supply a nonempty --objective, positive integer --max-turns, and scenario complete or blocker.');
  }

  const workspace = await mkdtemp(join(tmpdir(), 'math-impact-supervisor-'));
  try {
    const result = await supervise({
      objective,
      maxTurns,
      async runTurn(prompt) {
        const { stdout } = await runProcess(process.execPath, [
          workerPath, workspace, values.scenario, JSON.stringify(prompt),
        ], { timeout: 10000, windowsHide: true });
        return JSON.parse(stdout);
      },
      async verify() {
        const expected = [
          ['receipt.txt', objective + '\n'],
          ['checklist.txt', 'Objective recorded\nChecklist complete\n'],
        ];
        const remaining = [];
        for (const [name, content] of expected) {
          const actual = await readFile(join(workspace, name), 'utf8').catch(error => {
            if (error.code !== 'ENOENT') throw error;
            return null;
          });
          if (actual !== content) remaining.push(`${name} is missing or incorrect.`);
        }
        return remaining;
      },
    });
    console.log(`Stop: ${result.status} after ${result.turn} turn(s). ${result.detail}`);
    process.exitCode = { complete: 0, blocked: 2, 'turn-limit': 3 }[result.status];
  } finally {
    await rm(workspace, { recursive: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(`Stop: supervisor error. ${error.message}`);
    process.exitCode = 1;
  });
}
