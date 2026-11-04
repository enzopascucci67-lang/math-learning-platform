<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Codex development supervisor

- Work on one explicitly approved item at a time. Record its scope and observable acceptance checks before editing. Carry the item through implementation, verification, and a draft PR without waiting for routine step-by-step prompts.
- Make the smallest change that satisfies the acceptance checks. Preserve existing lesson and question IDs. Pause for human review and explicit approval before changing grading, authentication, classroom permissions, or database schema.
- Use browser guest mode and synthetic data for manual checks. Use ephemeral PGlite for database tests. Keep verification isolated from hosted accounts and real learner data.
- For application changes, install dependencies with `pnpm install --frozen-lockfile` as needed and run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Run the item-specific acceptance checks too. If a check fails, diagnose it and allow at most one retry after an in-scope correction or a clearly transient failure. Report a blocker if it still fails or requires a change outside the approved scope.
- Review the full diff against the base and confirm that every change serves the approved item. Report the scope, acceptance results, commands and outcomes, any retry, and outstanding blockers. Open a draft PR for human review when checks pass and publishing is safe. If a check is blocked or publishing would trigger a deployment or paid automation, stop with a reviewable diff and report the reason.
- Keep the work free of paid usage. Do not start a separate cloud run, enable schedules or paid overages, add credentials, deploy, apply hosted migrations, or merge.
