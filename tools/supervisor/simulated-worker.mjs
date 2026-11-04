import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [, , workspace, scenario, payload] = process.argv;
const { objective, nextStep } = JSON.parse(payload);
let result;

if (scenario === 'blocker') {
  result = { summary: 'Fixture work paused.', decision: 'Which checklist format should I use?' };
} else if (nextStep.startsWith('Verification found: checklist.txt is missing or incorrect.')) {
  await writeFile(join(workspace, 'checklist.txt'), 'Objective recorded\nChecklist complete\n');
  result = { summary: 'Wrote checklist.txt.' };
} else {
  await writeFile(join(workspace, 'receipt.txt'), objective + '\n');
  result = { summary: 'Wrote receipt.txt.', remaining: 'Create checklist.txt.' };
}

console.log(JSON.stringify(result));
