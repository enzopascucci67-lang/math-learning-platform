# Version 1 verification

## Grade-personalized circle paths — October 28, 2026

- All 36 tests, TypeScript, ESLint and production build passed. Tests cover distinct introductory paths for all 13 grades, canonical progress IDs, grade navigation and forward circle-map branches.
- Regenerated the curriculum seed and ran it in the local PostgreSQL integration tests. The new 14 lessons add 28 questions; existing IDs remain intact. Hosted connected accounts need the updated seed before using new lessons.
- Browser selected Grades 3, 9, 10, Kindergarten and 12: actual circles, next lessons and selected-skill panels changed. Grade selection persisted after reload.
- Selected the Area of triangles circle, opened its lesson, answered 42 and 6, and returned to a 100% completion circle. Existing Algebra completion remained available across grades.
- Phone-width content/client widths were both 375 pixels; no horizontal overflow. My Learning and practice omit the large course sidebar. All courses retains search/outline access.

## Course explorer and preview access — October 28, 2026

- All 34 tests, ESLint, TypeScript and production build passed.
- Desktop browser: course explorer listed units/lessons and completion; searching “linear equations” opened Solving Equations directly and highlighted the current lesson in the outline.
- Mobile browser: search stayed visible, an unmatched query showed recovery guidance, Browse courses cleared the query and displayed the course outline. No horizontal overflow at a 390-pixel viewport.
- Preview launcher exited successfully with its hidden server still responding. A subsequent launch reused that server. Original preview origin was preserved for browser demo storage. See README for the Windows launcher and local-only access limitations.

## Student usability increment — October 28, 2026

- Existing 32 tests, TypeScript, ESLint and production build passed.
- Browser verified no-grade subject choices, Grade 12 fallback subject access, Grade 3 start/resume actions and resuming at question two.
- Created a local demo classroom and joined from My Assignments using a lowercase code with surrounding spaces. First-time enrollment guidance changed to “Join another classroom” after success.
- Inspected the learning page at a 390-pixel browser viewport; content and client widths were equal, with no horizontal overflow. Preview: `verification/easier-learning-mobile.png`.
- No schema change or deployment. Hosted Supabase behavior remains outside these browser demo checks.

## Character wardrobe increment — October 28, 2026

- All 32 automated tests passed, including ephemeral PostgreSQL execution of migrations 001/002 and the seed. Verified reward milestones, backfill, repeated completion, slot validation, denied direct writes, denied anonymous access and cross-account clothing isolation.
- TypeScript, ESLint and the production build passed. The build needed filesystem access to replace old generated output.
- Browser on the production build: starter wardrobe rendered; completed Order of Operations with answers 18 and 36; reward notice announced the explorer cap and first star badge; equipped both; reloaded and confirmed the outfit, one completed lesson and 50 XP persisted. Locked items remained disabled.
- Inspected the wardrobe and character at the browser's narrow viewport. Evidence: `verification/character-wardrobe.png`.
- Hosted Supabase Auth, email, REST transport and concurrent database sessions remain unverified. Apply migration 002 before using connected accounts with this build.

The remaining sections record the original V1 checks and predate these increments.

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
## Reference-inspired dashboard verification

- All 36 automated tests passed, plus TypeScript, ESLint and production build.
- Browser: Grade 9 → Grade 6 changed seven circles to four with grade-specific lessons. Selecting Ratios and unit rates changed the lesson card to its real practice link.
- Browser: next-lesson action opened Combining Like Terms, and returning displayed Continue learning.
- Browser: branching view remained available; quick cap removal and re-equipping saved correctly, with removal verified after reload. Grade 6 also persisted.
- Phone layout checked at 390 × 844: content width and client width both 390 pixels. Desktop inspected at 1536 × 1024.
- Screenshots: verification/reference-dashboard-desktop.jpg and verification/reference-dashboard-mobile.jpg. Local preview remains at http://127.0.0.1:3000/learn. Hosted account verification remains pending.


## Classroom authorization increment

All 44 tests passed, including seven new classroom database scenarios plus their parent suite. TypeScript and ESLint passed. The tests execute migrations 001–003 and the current curriculum seed using restricted authenticated/anonymous roles with simulated Supabase identity. Teacher ownership, student roster privacy, join code normalization and idempotency, assignment reads/writes/reports, verified mastery, repeat rewards and anonymous rejection were exercised. Migration 003 closes direct join-code reads while preserving owner codes through classroom_overview. No UI source changed; no new browser or bundle verification was necessary. No hosted migration or Supabase Auth/REST verification was performed.

## Class grades and student interface

46 automated tests passed, including class-grade precedence, Kindergarten, multiple classes, nonmember/stale selection fallback, matching lesson suggestions and PostgreSQL rejection of wrong-grade assignments. Permission tests confirm students and other teachers cannot change a class grade, and existing assignments remain after grade changes. TypeScript and ESLint passed. Browser verified setting the existing demo classroom to Grade 3, the teacher lesson picker narrowing to two Grade 3 lessons, creating Equal groups practice, and the student path changing from personal Grade 6 to class Grade 3. The test adds that assignment to the existing local demo class. Hosted Supabase Auth/REST remains unverified.

Final UI verification: production build passed. At a 390 × 844 browser viewport, document and client widths were both 375 pixels (scrollbar excluded). The desktop was inspected at 1440 × 1080. Fixed an inherited small-screen rule hiding navigation icons. Browser completed Multiplying Equal Groups with answers 20 and 42, verified hints, next-question feedback, the 50 XP completion and forest hoodie reward, then reloaded Learn: class Grade 3, a green completed multiplication circle, 150 total XP and Sharing equally as the next lesson persisted. No warning/error entries were returned by the browser console check. Screenshots: verification/friendly-learning-desktop.jpg and verification/friendly-learning-mobile.jpg. The original local preview origin remains running. These are local demo flows, not hosted account verification.

## Rounded avatar artwork

46 tests, TypeScript, ESLint and production build passed. Desktop browser checked the header icon, dashboard and full wardrobe; shirt/cap/badge and hoodie/no-cap combinations rendered correctly. Equipping the earned hoodie and removing the cap survived reload. The phone wardrobe fits a 390 × 844 viewport with equal content/client widths of 375 pixels. Crown/scarf remained locked. New layered SVG artwork uses unique gradient IDs per preview and the existing inventory/persistence operations. Screenshots: verification/rounded-avatar-wardrobe.jpg and verification/rounded-avatar-mobile.jpg.

## Expanded Grade 6

50 tests passed; TypeScript, ESLint and production build passed. Eight new lessons/24 questions have independent arithmetic checks and Grade 6-only suggestion checks. Actual SQL migrations/current seed verified matching classroom assignments and all new answer keys. Browser verified Grade 3/6 class switching, the 12-lesson picker, new fraction hints, equivalent answers and both fraction lessons with persisted 100% circle progress. The existing scarf reward unlocked at five total completed lessons. Phone overflow check: document/client widths 375/375 at viewport 390 × 844. Local demo now includes Grade 6 explorers and two new completions. Reapply the updated seed for hosted grading; no hosted migration, authentication or REST verification was performed.

## Pawn and reward checkpoints

54 tests, ESLint and production build including TypeScript passed. New journey tests cover actual next/resume/finished positions, multi-lesson reward placement, cross-grade totals, duplicate/unknown completion rejection, short paths and no extra reward promises after the catalog is earned. Browser: choosing Percentages kept the pawn at Expressions, gift buttons focused matching reward details, crown showed 5 more new lessons, and scarf showed Earned with a wardrobe link. At 390 × 844, document/client widths both measured 375 pixels. Desktop inspected at 1440 × 1080. Screenshots are verification/atlas-pawn-path.jpg and verification/atlas-pawn-mobile.jpg. Existing lesson unlock thresholds and database permissions are unchanged. Connected completion reads have stable timestamp/lesson ordering, but hosted account testing was not performed.

## Broad polish and curriculum expansion — October 29, 2026

Added 26 lessons and 78 questions (two lessons per grade, Kindergarten–12), bringing the catalog to 62 lessons and 155 questions. New lessons include worked examples, targeted hints and answer explanations; counting, arrays and fraction strips have accessible teaching illustrations. Grade 6 now has 14 lessons across 12 circles. Coverage is introductory and still incomplete; this is not a full standards-aligned K–12 curriculum.

Polished the rounded character, shaded clothing cards and Atlas pawn. Added Sunset sweater (15 unique completed lessons), Stargazer beanie (20), and Explorer satchel (30), preserving all previous items and thresholds. The path keeps its pawn on the next unfinished lesson while circle selection focuses the selected lesson. Multi-lesson circles expose a compact list. Wardrobe and reward details show the actual item art, with wearing/locked states and mobile/dark styles.

Practice now focuses each new question, prevents duplicate submissions, supplies guidance after incorrect answers, and shows one completion celebration. Replays are clearly marked and do not promise new XP. Next-lesson navigation skips completed lessons and can return to earlier unfinished grade work. Classroom create/join/assignment forms prevent repeated pending writes, reject whitespace-only names/titles, and filter the new-class course list by grade. Teacher reports ignore obsolete responses and show loading feedback. Course coverage labels preserve gaps instead of implying continuous coverage.

Connected setup: apply migration 005_more_clothing.sql after migrations 001–004, then reapply the current supabase/seed.sql. Migration 005 is additive and existing completion grants backfill its new clothing. No live Supabase connection or deployment was configured or changed. Guest saves, canonical IDs and existing architecture remain in place.

Verification: 61 automated tests pass, including all 78 new answer keys through the database grading function, wrong-grade assignment rejection, authorization isolation, and clothing unlock/equip thresholds through 30 lessons. ESLint, strict TypeScript and production build pass. Browser checks covered desktop paths, selected-circle focus and lesson menu, later reward details, phone practice incorrect/retry/completion/replay, locked wardrobe items, dark mode, and equal content/client widths at phone and intermediate widths. Screenshots are in verification/. Hosted teacher/student multi-browser acceptance remains a next step.

Next roadmap priorities: configure a separate Supabase test project and verify real teacher/student accounts; expand and review curriculum coverage; add configurable assignment question selection and richer teacher reporting. Games remain placeholders.
