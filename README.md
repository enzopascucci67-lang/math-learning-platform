# Math Learning Platform · Version 1

An independent Next.js App Router, strict TypeScript, Tailwind CSS and XYFlow project. Temporary public name: **Math Atlas**. Change `NEXT_PUBLIC_APP_NAME` to rename the UI; update `src/app/layout.tsx` for metadata. This repository does not import, edit, or rebuild Equate or Math Connections.

## Run locally

### Open the preview on Windows

Double-click **Start Math Atlas.cmd** in this project folder. It opens `http://127.0.0.1:3000/learn` in your browser and starts a hidden local preview process if needed. Running the launcher again reuses that process. It uses your installed Node.js or this computer's bundled Codex Node.js runtime. Dependencies must already be installed; if there is no production build yet, the launcher creates one. After changing source code, run `pnpm build` before restarting the preview.

This address works on this Windows computer; it is not a public website link. The launcher can reopen the preview after a restart or closed chat session. Logs and process information stay in the ignored `.preview/` folder. If another application occupies port 3000, the launcher reports that conflict rather than stopping that application. An optional `MATH_ATLAS_PREVIEW_PORT` environment variable selects a different port, which also uses separate browser demo storage.

### Development setup

Requires Node.js 20.9+ (Node 22 LTS recommended) and pnpm 11. Install pnpm if necessary with `npm install -g pnpm`.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

On PowerShell use `Copy-Item .env.example .env.local`. Open http://localhost:3000. No external services are required for guest/demo learning. If port 3000 is occupied, Next.js prints the selected port. Do not run these commands in an existing games repository.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

## What works

- My Learning uses a blue numbered circle path personalized by the selected grade, with a next-lesson card, optional branching tree, quick character clothing controls and real progress totals. Practice opens the searchable course catalog for exploring beyond the grade path.

- Each grade from Kindergarten through Grade 12 has a distinct introductory path, selected by unit-level grade metadata rather than broad course ranges. Grade choice persists in this browser; shared lesson progress is preserved when switching grades. These starting paths are not complete grade curricula or adaptive placements.
- Clear start/resume actions, responsive lesson lists and a visible first-classroom join form help students find their next step.

- Homepage, responsive navigation, dark mode, curriculum filters for K–12 grades and subjects.
- Data-driven branching Algebra I map with zoom, pan, circular progress, recommendations, and freely accessible lessons.
- Arithmetic, fractions, seven introductory Algebra I concepts, and original SAT practice in the four digital SAT domains. Fourteen additional two-question starting lessons cover counting, addition within twenty, place value, division, larger multiplication, decimals, ratios, integers, proportions, triangle angles/area, exponent rules, function composition and right-triangle trigonometry.
- Multiple choice, numeric/fraction answers with absolute tolerance 0.000001, and a deliberately limited simplified-expression validator. No JavaScript evaluation. Expression equivalence currently accepts whitespace and multiplication-symbol variants of the canonical monomial, not arbitrary symbolic equivalence.
- Hints, retries, explanations, mastery after every lesson question has been answered correctly, 50 XP once per lesson, levels and a customizable character with six clothing items.
- Browser-persistent classroom creation, random join codes, membership, lesson assignments, due dates, completion and role switching for demonstration.
- Supabase email/password login, gated registration, authoritative roles, durable progress, classroom operations, assignment completion reports and SQL grading when configured.
- Modular games registry and integration event contract, with unconnected placeholder cards for existing games.

## Demo versus connected accounts

Guest progress is stored under `math-atlas:demo:v1` in localStorage. It survives reloads in this browser only. Demo classrooms share one teacher and one student persona in this browser; switch roles on Classrooms. Create a classroom, copy its code, switch to Student, join, open an assignment, answer its questions, then return to Teacher. Guest XP and progress can be edited by the browser owner and are not trusted for real accounts. Storage failures are surfaced during answer submission. Clearing browser data clears the demo.

Connected accounts use Supabase Auth and RLS. Their results do not upload guest data or share the demo classroom database. After sign-in, progress, classrooms, and assignments load from Supabase. A teacher can see only lesson-completion results for lessons assigned to students in their own classroom. No public student profiles or messaging exist. Displayed learner IDs are pseudonymous UUID prefixes. Grade filtering is available; a profile grade column is prepared, but an account grade editor is not yet implemented.

The platform waits for connected account data before enabling learning and classroom actions. Switching accounts clears the previous account's displayed data; delayed results from earlier sessions are ignored. Failed account loading offers retry/sign-out controls instead of falling back to guest saves. Guest progress and per-account browser learning preferences remain separate.

The SAT starting-point experience is an introductory sequence of four domain lessons, not a scored adaptive diagnostic. Practice spans easy, medium and hard questions across the collection; each topic does not yet have every difficulty. Weak areas currently mean domains not mastered. Timed modules, practice configuration, unit quizzes, detailed analytics and unit mastery rewards remain future work. Planned subjects are visibly labeled and unavailable for practice. K–12 coverage is not complete.

## Character and clothing rewards

Open **My Profile → My character** to choose clothing, hats and accessories. The sky shirt is free. One completed lesson unlocks the explorer cap and star badge; three unlock the forest hoodie; five unlock the scholar scarf; ten unlock the star crown. Reviewing a completed lesson does not award another reward. Clothing is optional and never blocks lessons.

Guest outfits save with existing browser demo data. Connected outfits save in the profile; database functions derive unlocks from verified lesson completion, validate item slots and reject locked items. Existing accounts receive earned rewards when their inventory loads. Guest rewards do not upload to an account.

## Supabase configuration

1. Create a **new** Supabase project. Do not use the existing games database.
2. Apply migrations from `supabase/migrations/` in this order: `001_foundation.sql`, `002_cosmetic_rewards.sql`, `003_classroom_code_privacy.sql`, `004_classroom_grades.sql`, `005_more_clothing.sql`, and `006_assignment_content.sql`. For an existing staging database at 005, back it up and apply only 006. Verify that a pre-existing assignment still opens for an enrolled student and appears in the teacher report.
3. Apply the committed `supabase/seed.sql` in the SQL editor after the migrations. When curriculum changes, run `pnpm exec tsx scripts/seed.ts` from the repository root, commit the generated SQL, and reapply it to staging before testing connected grading. Keep lesson and question IDs stable to preserve existing progress. CI verifies that the committed seed matches the generator.
4. Copy the project URL and publishable client key into `.env.local`:

   - `NEXT_PUBLIC_APP_NAME`: optional display name.
   - `NEXT_PUBLIC_SUPABASE_URL`: new Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: client publishable key. Never use a service-role key in the browser.
   - `NEXT_PUBLIC_ENABLE_ACCOUNT_SIGNUP`: defaults to `false`. Leave disabled until age, consent, school provisioning and safeguarding requirements are reviewed. Controlled adult test accounts can be created in the Supabase dashboard.

5. Configure Supabase Auth Site URL and allowed redirects for localhost and the final deployment; enable email confirmation. Configure production email delivery before enabling public registration. This client uses Supabase's browser session persistence; it does not rely on a frontend role selector for authorization.
6. All new accounts receive the student role via a database trigger. Approve an adult teacher through a trusted administrative SQL session:

```sql
update public.profiles set role = 'teacher' where id = 'VERIFIED_ADULT_USER_UUID';
```

Never grant profile-update permissions to clients. Teacher verification is a manual administrative prerequisite, not self-service. For accounts created before applying the migration, insert their profile administratively before testing.

RLS covers every application table. Clients cannot insert progress, attempts, XP, memberships or classrooms directly. Security-definer functions use fixed search paths and authorize `auth.uid()`; classroom reports are scoped to assigned lessons. Unique XP activity keys and a transaction lock prevent duplicate rewards and concurrent grading races. `topic_mastery` and `assignment_submissions` are derived views. Database-backed role, persistence and authorization behavior must be tested against your configured instance before a public launch; no live Supabase credentials were provided for this build.

Before public use, add join-attempt throttling, abuse monitoring, password/account recovery UI, managed younger-student accounts, consent/retention/deletion policies, and an explicit teacher-verification workflow. The preview does not claim COPPA compliance. No under-13 account collection should be enabled yet. Guest access remains available without personal information.

## Staging release

Use a separate Supabase project with synthetic teacher and student accounts. Set the project's URL and publishable key in the hosting provider's preview environment before building. Keep account signup disabled and set the staging Auth Site URL to the hosted preview used for acceptance.

Record the commit and preview URL for each rehearsal.

1. Apply migrations 001–006 and the seed to an empty staging database. Verify that the preview can sign in and that a teacher can assign work, a student can complete it, and the teacher sees the result.
2. On an isolated database at 005, seed the curriculum and use a build compatible with 005 to create a single-lesson assignment and record a student's completion. Record the assignment and report before upgrading.
3. Apply 006, then deploy the current preview against that upgraded database. In separate teacher and student sessions, verify that the same assignment opens, its lesson is unchanged, and the teacher report retains the completion. Record the result for both the fresh install and the upgrade.


## Architecture

```text
src/app/                 App Router entry, metadata, Tailwind/design tokens
src/components/          Platform routes, XYFlow tree, reusable progress circle, practice viewer
src/lib/curriculum.ts    Typed curriculum, original question content, games and outfit contracts
src/lib/cosmetics.ts     Stable clothing catalog, demo eligibility and outfit validation
src/lib/answers.ts       Safe numeric and constrained-expression validation
src/lib/store.ts         Versioned demo storage types and boundary
src/lib/backend.ts       Optional Supabase client and centralized display name
supabase/migrations/     Tables, indexes, RLS and authorized database functions
supabase/seed.sql        Generated SQL curriculum seed
scripts/seed.ts          Curriculum-to-SQL generator
tests/                   Answer validation, content integrity and graph tests
```

Both grade and subject views refer to the same course data. Every unit stores its own layout coordinates and prerequisite IDs; the map needs no course-specific rendering logic. The current route shell is a client-side V1 container; extract dashboard/classroom controllers and a typed repository interface as these features grow. The SQL content hierarchy mirrors the source content; V1 renders bundled curriculum, while the database stores canonical grading keys. A later content editor can replace bundled reads without changing the lesson model.

`src/lib/grade-content.ts` assigns units to grades and adds introductory content. `src/lib/grade-map.ts` lays out the selected grade's circles and prerequisite branches. **Reapply the regenerated `supabase/seed.sql` to a configured database before practicing the new lessons with connected accounts.** No new schema migration is needed for this increment. Existing lesson and question IDs were retained.

## Games integration boundary

`games` in `src/lib/curriculum.ts` is a registry with stable IDs. `GameIntegration` defines a future verified result event. No external game URLs, account credentials, score endpoints, or assets have been connected. Future integrations must verify game results on a trusted server, derive student identity from authentication, and award XP through unique activity keys. Never award rewards from a client-supplied score alone.

## Connect to a new GitHub repository

The available GitHub connector has no repository-creation operation, and GitHub CLI was not installed in the build environment. This project has its own local `.git`; the parent repository and existing games were untouched.

Create an empty repository named `math-learning-platform` in GitHub (private recommended during development). Do not initialize it with a README. From **this directory**:

```sh
git remote add origin https://github.com/YOUR_USERNAME/math-learning-platform.git
git push -u origin main
```

Alternatively, after installing and authenticating GitHub CLI:

```sh
gh repo create math-learning-platform --private --source=. --remote=origin --push
```

No credentials or `.env.local` should ever be committed. `.env.example` contains placeholders only.

## Deploy to Vercel

1. Push this independent repository to GitHub.
2. Import it as a new Vercel project; framework Next.js, repository root as project root, build command `pnpm build`.
3. Set the environment variables above for the relevant environments. Keep account signup disabled during review. No service-role key is needed.
4. Apply migration and seed to a separate production Supabase project and configure its Auth Site URL.
5. Deploy, then test the guest and controlled-account journeys below on the deployment URL. Environment changes require redeployment.

No deployment, Supabase project, or paid resource is created automatically.

## Acceptance checks and next steps

Automated tests verify fraction equivalence, invalid numeric input, answer-key consistency, unique content IDs, and acyclic branching prerequisites. Run lint, strict typecheck and production build separately. Next.js 16 does not run lint as part of build.

Manual acceptance: complete a lesson including a wrong answer and retry; reload and verify tree progress; repeat and verify XP stays unchanged. Create a demo class and assignment, join as demo student, complete the lesson and inspect completion. Check dark mode, mobile navigation, keyboard navigation and tree zoom. For Supabase, repeat with two students and an approved teacher, confirm student B cannot read A's progress, an unrelated teacher cannot access a classroom report, and direct progress/XP/role writes are rejected. Test codes and assignments across separate browsers.

Next priorities: validate against a live Supabase test project, extract remaining route controllers, expand high-quality curriculum and SAT diagnostics, add question-level assignment selection, and review safeguarding before collecting real student accounts. Local PostgreSQL authorization tests now cover classrooms and assignments as well as cosmetics. Integrate the existing games only after explicit approval.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).

Student interface: Learn is the grade-based circle path; My work contains real teacher assignments; My character opens the wardrobe and profile. Desktop navigation stays visible, and phone navigation uses icons with labels. Class grades override personal suggestions for enrolled students; use Learning for to switch between graded classes. Teachers set the grade when creating a class or use Save class grade on an existing room. Only matching lessons appear in the new-assignment picker. Previously assigned work remains visible after a grade change. Personal grade choices and lesson positions remain in this browser, while connected class grades are database-backed.

Grade 6 now offers 12 lessons across 10 skill circles, including eight expanded lessons with 24 questions: fraction groups/division, decimal division, equivalent ratios, percentages, expression evaluation, prism volume and mean/median. This is introductory expanded coverage, not a complete grade curriculum. Existing IDs and progress remain valid. Reapply the current supabase/seed.sql after migrations 001–004 before using new lessons with connected accounts. The local preview includes a Grade 6 explorers demo class; switch Learning for to that class to try its path.

The circle path now has an Atlas pawn marking the next unfinished lesson. Looking at another circle does not move it. Gift dots open clothing reward details, and the checkpoint strip shows cap/badge after 1 completed lesson, hoodie after 3, scarf after 5 and crown after 10. Lessons from any grade count once. These clothing checkpoints are lesson milestones, separate from account levels (one level per five completed lessons). Existing earned clothing is preserved. Future gift dots forecast following the current grade path; exploring out of order can move them. No new migration is required for the pawn/checkpoint UI.


## Broad polish and curriculum expansion — October 29, 2026

Added 26 lessons and 78 questions (two lessons per grade, Kindergarten–12), bringing the catalog to 62 lessons and 155 questions. New lessons include worked examples, targeted hints and answer explanations; counting, arrays and fraction strips have accessible teaching illustrations. Grade 6 now has 14 lessons across 12 circles. Coverage is introductory and still incomplete; this is not a full standards-aligned K–12 curriculum.

Polished the rounded character, shaded clothing cards and Atlas pawn. Added Sunset sweater (15 unique completed lessons), Stargazer beanie (20), and Explorer satchel (30), preserving all previous items and thresholds. The path keeps its pawn on the next unfinished lesson while circle selection focuses the selected lesson. Multi-lesson circles expose a compact list. Wardrobe and reward details show the actual item art, with wearing/locked states and mobile/dark styles.

Practice now focuses each new question, prevents duplicate submissions, supplies guidance after incorrect answers, and shows one completion celebration. Replays are clearly marked and do not promise new XP. Next-lesson navigation skips completed lessons and can return to earlier unfinished grade work. Classroom create/join/assignment forms prevent repeated pending writes, reject whitespace-only names/titles, and filter the new-class course list by grade. Teacher reports ignore obsolete responses and show loading feedback. Course coverage labels preserve gaps instead of implying continuous coverage.

Connected setup: apply migration 005_more_clothing.sql after migrations 001–004, then reapply the current supabase/seed.sql. Migration 005 is additive and existing completion grants backfill its new clothing. No live Supabase connection or deployment was configured or changed. Guest saves, canonical IDs and existing architecture remain in place.

Verification: 61 automated tests pass, including all 78 new answer keys through the database grading function, wrong-grade assignment rejection, authorization isolation, and clothing unlock/equip thresholds through 30 lessons. ESLint, strict TypeScript and production build pass. Browser checks covered desktop paths, selected-circle focus and lesson menu, later reward details, phone practice incorrect/retry/completion/replay, locked wardrobe items, dark mode, and equal content/client widths at phone and intermediate widths. Screenshots are in verification/. Hosted teacher/student multi-browser acceptance remains a next step.

Next roadmap priorities: configure a separate Supabase test project and verify real teacher/student accounts; expand and review curriculum coverage; add configurable assignment question selection and richer teacher reporting. Games remain placeholders.
