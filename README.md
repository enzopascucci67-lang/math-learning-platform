# Math Learning Platform · Version 1

An independent Next.js App Router, strict TypeScript, Tailwind CSS and XYFlow project. Temporary public name: **Math Atlas**. Change `NEXT_PUBLIC_APP_NAME` to rename the UI; update `src/app/layout.tsx` for metadata. This repository does not import, edit, or rebuild Equate or Math Connections.

## Run locally

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

- Homepage, responsive navigation, dark mode, curriculum filters for K–12 grades and subjects.
- Data-driven branching Algebra I map with zoom, pan, circular progress, recommendations, and freely accessible lessons.
- Arithmetic, fractions, seven introductory Algebra I concepts, and original SAT practice in the four digital SAT domains.
- Multiple choice, numeric/fraction answers with absolute tolerance 0.000001, and a deliberately limited simplified-expression validator. No JavaScript evaluation. Expression equivalence currently accepts whitespace and multiplication-symbol variants of the canonical monomial, not arbitrary symbolic equivalence.
- Hints, retries, explanations, mastery after every lesson question has been answered correctly, 50 XP once per lesson, levels and avatar placeholder.
- Browser-persistent classroom creation, random join codes, membership, lesson assignments, due dates, completion and role switching for demonstration.
- Supabase email/password login, gated registration, authoritative roles, durable progress, classroom operations, assignment completion reports and SQL grading when configured.
- Modular games registry and integration event contract, with unconnected placeholder cards for existing games.

## Demo versus connected accounts

Guest progress is stored under `math-atlas:demo:v1` in localStorage. It survives reloads in this browser only. Demo classrooms share one teacher and one student persona in this browser; switch roles on Classrooms. Create a classroom, copy its code, switch to Student, join, open an assignment, answer its questions, then return to Teacher. Guest XP and progress can be edited by the browser owner and are not trusted for real accounts. Storage failures are surfaced during answer submission. Clearing browser data clears the demo.

Connected accounts use Supabase Auth and RLS. Their results do not upload guest data or share the demo classroom database. After sign-in, progress, classrooms, and assignments load from Supabase. A teacher can see only lesson-completion results for lessons assigned to students in their own classroom. No public student profiles or messaging exist. Displayed learner IDs are pseudonymous UUID prefixes. Grade filtering is available; a profile grade column is prepared, but an account grade editor is not yet implemented.

The SAT starting-point experience is an introductory sequence of four domain lessons, not a scored adaptive diagnostic. Practice spans easy, medium and hard questions across the collection; each topic does not yet have every difficulty. Weak areas currently mean domains not mastered. Timed modules, practice configuration, unit quizzes, detailed analytics, unit mastery rewards and cosmetic inventory UI remain future work. Planned subjects are visibly labeled and unavailable for practice. K–12 coverage is not complete.

## Supabase configuration

1. Create a **new** Supabase project. Do not use the existing games database.
2. Run `supabase/migrations/001_foundation.sql` in its SQL editor.
3. Regenerate content with `pnpm exec tsx scripts/seed.ts`, then run `supabase/seed.sql` in the SQL editor. Reapply the seed when curriculum changes; keep question IDs stable because attempts reference them.
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

## Architecture

```text
src/app/                 App Router entry, metadata, Tailwind/design tokens
src/components/          Platform routes, XYFlow tree, reusable progress circle, practice viewer
src/lib/curriculum.ts    Typed curriculum, original question content, games and outfit contracts
src/lib/answers.ts       Safe numeric and constrained-expression validation
src/lib/store.ts         Versioned demo storage types and boundary
src/lib/backend.ts       Optional Supabase client and centralized display name
supabase/migrations/     Tables, indexes, RLS and authorized database functions
supabase/seed.sql        Generated SQL curriculum seed
scripts/seed.ts          Curriculum-to-SQL generator
tests/                   Answer validation, content integrity and graph tests
```

Both grade and subject views refer to the same course data. Every unit stores its own layout coordinates and prerequisite IDs; the map needs no course-specific rendering logic. The current route shell is a client-side V1 container; extract dashboard/classroom controllers and a typed repository interface as these features grow. The SQL content hierarchy mirrors the source content; V1 renders bundled curriculum, while the database stores canonical grading keys. A later content editor can replace bundled reads without changing the lesson model.

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

Next priorities: validate SQL against a live Supabase test project, add an authorization integration suite, extract route controllers, expand high-quality curriculum and SAT diagnostics, implement configurable assignments and profile grade selection, and review safeguarding before collecting real student accounts. Integrate the existing games only after explicit approval.

Implementation references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Supabase Next.js setup](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).
