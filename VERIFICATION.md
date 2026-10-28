# Version 1 verification

Verified locally on October 28, 2026.

## Automated checks

- Strict TypeScript check: passed.
- ESLint: passed.
- Four learning tests: passed (numeric equivalents and invalid input, answer-key integrity, prerequisite graph integrity, mastery and duplicate XP prevention).
- Next.js production compilation and prerendering: passed. The first sandboxed build could not create a prerender output folder; the same build passed when run with filesystem access.

## Browser evidence

The learning journey flows from the curriculum map to lesson practice, local storage, and updated progress rendering.

- Homepage and branching Algebra I map rendered; clicking Foundations expanded its lesson panel.
- Entered 19 for `6 + 3 × 4`: received incorrect-answer feedback and the explanation.
- Retried with 18: received correct-answer feedback and advanced to question two.
- Answered `(6 + 3) × 4` with 36: lesson mastery was saved.
- Reloaded the page: `MASTERED · 50 XP EARNED` remained visible.
- Returned to the homepage: the Foundations progress circle displayed 100%.
- Created a demo classroom, created an Order of operations assignment, switched to Student, entered the random join code, and joined successfully.
- The student classroom showed one member and one assignment, with the assigned lesson marked Completed using the existing personal progress.
- Inspected the homepage at a 390 × 844 mobile viewport and at the desktop viewport; navigation and learning entry points remained available.
- Toggled dark mode and inspected the desktop homepage and branching map.

These browser actions used only local demonstration personas. No real student data was collected.

## Not verified against a live backend

Supabase credentials were not supplied. The migration, seed and RPC integrations are implemented, but live database migration execution, email confirmation, account persistence, concurrent XP transactions and cross-account RLS isolation require a configured test instance. Follow the acceptance matrix in README before enabling public accounts. Vercel deployment and GitHub remote creation were not performed.
