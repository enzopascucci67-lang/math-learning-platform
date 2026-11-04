# Codebase review and incremental development

Reviewed October 28, 2026. This review covers the application source, database migration, seed generator, automated tests, package configuration and CI workflow. Generated dependencies and build output are not application source.

## Existing architecture

- Next.js App Router uses a catch-all page to render the client-side Platform shell. The shell handles routes, authentication, demo persistence, classroom operations and account refresh.
- Curriculum is bundled TypeScript: courses contain grade ranges, units contain prerequisite IDs and map coordinates, and lessons contain question sets. Arithmetic, fractions, Algebra I and introductory SAT practice have content; other subjects are placeholders. Grade coverage is incomplete.
- The existing XYFlow component renders branching maps. The current local student-interface changes had replaced map entry points with grade-based lesson lists. Those local changes were present before this increment and were preserved.
- Practice supports hints, retries and server-confirmed answers for connected users. Demo mastery requires a correct attempt on every question. Completion IDs are unique and each lesson contributes 50 XP.
- Local demo classrooms support roles, random join codes, enrollment, full-lesson assignments and completion display. Connected classrooms use Supabase Auth, row-level policies and authorized database functions. Teacher roles require administrative approval.
- Learning preferences store grade, last lesson and question position separately for guest and each account, in this browser. Connected completion is durable in Supabase; preference sync across devices is not implemented.
- Profiles already have an outfit field and there is a cosmetic_unlocks table. No clothing catalog, equip operation or reward-awarding operation exists. The character is a placeholder.
- Game cards are placeholders, with a typed future integration contract. Existing games are separate.

## First increment

Students can reach available subject/course trees from their grade's lesson view. Course pages offer an optional interactive tree beside a unit selector and lesson links. The lesson list stays available. Nodes show completed, ready, or build-toward status; suggested prerequisites guide rather than block access. Branch merges require every suggested prerequisite to be complete before showing ready. Progress handles empty units safely. The completion banner has a short entrance animation; reduced-motion settings disable it. Continuous edge animation was removed.

No database schema or grading keys changed. No GitHub remote is configured locally, and the connected GitHub repository listing returned no accessible repositories. These edits are local.

## Next increments

1. Verify connected teacher/student journeys using a separate Supabase test project: apply migration and seed, test role enforcement, join codes, roster visibility, assignment reports, persistence and duplicate rewards. Add an integration suite that exercises cross-account authorization. No live database verification has been performed here.
2. Character customization and lesson-based clothing rewards are implemented; see the third increment below. Apply migration 002 before using the updated app with a connected account.
3. Continue extracting classroom and learning operations from Platform into smaller controllers while preserving routes and storage keys. Account loading and identity isolation are now extracted and covered by regression tests; see the second increment below.
4. Expand unit/grade content and add completion celebrations for newly earned milestones. Preserve lesson and question IDs to retain existing attempts. Add configurable assignments after the full-lesson workflow has live coverage.

## Verification

TypeScript, lint, the production build and all 10 automated tests passed for this increment, including branch-merge readiness and progress edge cases. The build initially hit a permission error replacing old generated output and passed with filesystem access. Browser interaction testing was attempted, but the browser tool could not reach the local server; visual and interactive verification of this increment remains pending. Live Supabase authorization, email flows and cross-device persistence still require a configured test instance. See VERIFICATION.md for historical browser checks; they predate this increment.

## Second increment: account isolation and readiness

The first roadmap item, live Supabase verification, cannot run yet: the local project has only `.env.example`, with no configured connection. The next actionable production-readiness issue was stale account state during sign-in, sign-out and switching users.

- Added a per-platform account controller in `src/lib/account-session.ts` and moved Supabase account reads into `src/lib/account-data.ts`.
- Connected startup waits for identity and data before displaying learning or classroom controls. Account changes immediately clear the prior role, progress, classrooms, assignments and preferences. Failed authentication or loading shows retry/sign-out controls and does not enable guest saves.
- Identity generations prevent delayed reads or mutation responses from updating a later session, including signing out and back into the same user. Latest refresh results take precedence over earlier requests. Subscription cleanup invalidates in-flight responses and obsolete callbacks.
- Answer submissions and classroom actions check account readiness, then recheck the originating identity before refreshing data or displaying success. Preference writes use the same identity protection. Practice state is remounted when the displayed user changes.
- Guest data and storage keys are preserved. Account refreshes preserve preferences edited during the current session. Database permissions and grading logic are unchanged.

Verification: all 20 tests passed, including 10 new account-controller regression tests for loading gates, teacher-to-student switches, sign-out, stale identity lookups, out-of-order reads, failed loads, retries, cleanup, token refresh and returning to the same account. TypeScript, ESLint and the production build passed. The build required filesystem access to replace existing generated output. These tests simulate asynchronous auth and data responses; they do not prove live Supabase row-level isolation or browser behavior. Live account testing and current browser interaction verification remain pending. No deployment or database migration was performed.

At the end of increment 2, the next planned feature was character clothing and database-authorized rewards. That work is now implemented below.

## Third increment: character wardrobe and earned clothing

- Replaced the profile's character placeholder with a responsive SVG character and wardrobe. Six items span body clothing, hats and accessories. Hats and accessories can be removed. Buttons show current equipment and the completion requirement for locked items.
- Added free starter clothing, cap/badge rewards at one completed lesson, a hoodie at three, a scarf at five and a crown at ten. Newly earned items are announced after completing a lesson. Replaying lessons does not add rewards.
- Guest outfits persist in the existing demo save; old saves need no migration. Eligibility counts unique known lessons. Invalid, locked or wrong-slot saved items are filtered before rendering.
- Added `002_cosmetic_rewards.sql`, preserving the existing schema and grading keys. It introduces a read-only catalog, a completion trigger, reward backfill and authorized inventory/equip operations. Unlocks are derived from database lesson completion. Account identity comes from authentication; helpers are not callable by clients. No direct profile/unlock writes are granted.
- The account loader now reads authoritative outfit/inventory data. Equipment saves use the existing account-change guards. Apply migration 002 before connecting the updated app to an existing database.
- Added PGlite as a development-only dependency to execute the actual migrations and seed in an ephemeral PostgreSQL instance. Test setup supplies Supabase's auth roles and identity function; it does not contact a hosted service.

Verification: all 32 tests, ESLint, TypeScript and the production build passed. Database tests executed migrations 001 and 002 and the curriculum seed. They cover anonymous access rejection, forbidden direct writes and helper calls, locked/wrong-slot equipment, existing-progress backfill, incomplete/repeated lessons, milestone thresholds, persisted equipment/removal and isolation between learners. This does not test hosted Supabase Auth/email, REST transport or concurrent database sessions.

Browser verification on the production build: opened the starter wardrobe, completed the two Order of Operations questions, observed the cap/badge reward notification, equipped both items and reloaded My Profile. Equipment, 50 XP and lesson completion persisted. Inspected the responsive wardrobe at the browser's narrow viewport. Screenshot: `verification/character-wardrobe.png`.

## Remaining delivery work

- Local classroom authorization integration coverage is complete (eighth increment); verify those flows with hosted Supabase Auth in a separate test project.
- Add configurable classroom assignments and improve teacher completion reports, preserving the current full-lesson assignment flow.
- Expand curriculum toward complete grade coverage and verify all student journeys on desktop and mobile.
- Connect the repository and deployment, configure the live database and run hosted acceptance checks. No deployment or hosted migration has been performed in this increment.

## Sixth increment: grade-specific paths and simple circles

User feedback supersedes the previous direction for a persistent explorer on every student page: My Learning should return to simple circles, and choosing a grade should materially change its lessons.

- Added unit-level grade metadata and 14 original introductory lessons (28 questions), preserving existing content IDs. Each grade K–12 has a distinct starting path. Examples: Grade 3 shows multiplication/division; Grade 9 shows the branching Algebra path; Grade 10 shows triangle geometry; Grade 12 shows function composition/trigonometry. Shared skills retain shared mastery IDs across grade changes.
- My Learning now displays a clean circle skill tree with progress rings and light prerequisite lines, plus a selected-skill lesson panel. The grade selector updates the map, next lesson and selected panel together. The map remains freely explorable.
- Removed the large course explorer and boxed unit lists from My Learning. Practice, assignments and profile pages use the simpler centered workspace. All courses and explicit subject pages retain the explorer/search for finding material beyond the grade path.
- Rebuilt the SQL curriculum seed. A configured database must receive the updated seed before the new lesson IDs can be graded for connected accounts. No new schema migration is required. Grade paths are introductory coverage, not full curricula or adaptive assessments.

Verification: 36 tests passed, including all-grade path uniqueness, canonical lesson/mastery identity, grade-specific next/back navigation and map layout validity. TypeScript, ESLint and production build passed. Browser verified Grade 3 → Grade 9 → Grade 10 plus Kindergarten and Grade 12 changed the actual skill circles and lesson choices. Selected Area of triangles, completed its two questions and returned to a 100% circle; grade selection persisted after reload. At phone width, content/client widths were both 375 pixels without horizontal overflow. Hosted database checks remain pending; local PostgreSQL tests ran with the regenerated seed.

## Fifth increment: findable courses and a reusable preview

The requested direction was a course-based experience that somewhat resembles CodeHS without copying its branding or abandoning math-specific features. Reference: [CodeHS student navigation guide](https://help.codehs.com/en/articles/5715402-for-students-navigating-codehs-the-code-editor), which describes left navigation and a next-assignment entry point. The implementation keeps this platform's curriculum model, branching skill trees, lesson mastery, character and clothing rewards.

- Added an always-visible All courses destination and a desktop course explorer. The active course shows numbered units and direct lesson links, completion marks and the current lesson. The explorer remains available alongside practice so learners can switch topics without returning through multiple pages.
- Added case-insensitive, multiword lesson search across friendly/canonical lesson names, course names and units, including SAT practice. Results identify their course and unit, link directly to practice, and clear on navigation. Empty searches show the normal outline; unmatched searches provide a recovery action.
- Added direct shortcuts for SAT, character/rewards and classrooms. On narrow screens, search remains visible and Browse courses reveals the outline in one tap. Navigation resets the mobile panel so it does not push the next page down unnecessarily.
- Added a Windows launcher, `Start Math Atlas.cmd`, backed by `scripts/start-preview.mjs`. It starts a detached, hidden local server, checks that it responds, and reuses the project's existing server on subsequent launches. The default stays at the original `127.0.0.1:3000` origin to retain demo browser storage. Other processes occupying the port are not stopped. Missing builds are prepared automatically; the existing project's dependencies must be installed.

Verification: all 34 tests passed, including search normalization, canonical references, empty/unmatched queries and SAT coverage. ESLint, TypeScript and production builds passed. Browser checks verified desktop outline/current-lesson highlighting, direct navigation from a “linear equations” search result, unmatched-search recovery and one-tap mobile course browsing. At the 390-pixel viewport, content/client widths were both 375 pixels, with no horizontal overflow. Verified that the launcher exited while its server remained available and a second launch reused the same server. The final preview remains local; hosted Supabase and public deployment are still outstanding.

## Fourth increment: easier student journeys

Usability review found two avoidable dead ends: selecting a grade without available curriculum offered no direct lesson choices, and the first classroom join form was collapsed beneath empty assignment lists. Student lesson/list/profile markup also lacked dedicated spacing and responsive styles.

- Added available-subject cards for learners who have not selected a grade and for grades with no available curriculum. Cards disclose lesson counts and the course grade range; exploring them preserves the selected grade. Learners with grade lessons can also expand “Explore other subjects.”
- The next-lesson action now says “Start learning” for an untouched lesson and “Pick up where you left off” / “Continue learning” for a started lesson.
- First-time classroom enrollment is visible above assignment lists, with a labeled field and code instructions. The field accepts extra pasted whitespace; the existing handler trims it and accepts lowercase. Enrolled learners see a separate “Join another classroom” disclosure. Empty assignment guidance distinguishes not-yet-enrolled learners from those already caught up.
- Added student styles for headings, grade selection, lesson and assignment rows, completion and worked-example panels, profile settings and subject cards. At narrow widths primary lesson actions span the row and controls have larger targets. Existing curriculum, maps, grading, persistence, accounts and rewards are preserved; no schema change is required.

Verification: existing 32 tests, TypeScript, ESLint and production build passed. Browser checks on the production build confirmed subject access before grade selection, a usable subject path after selecting Grade 12, Grade 3 start/continue labels and resume at question two, and successful first classroom enrollment with a lowercase code surrounded by spaces. The demo test created a classroom named “Usability test classroom.” At a 390-pixel browser viewport, the learning page had equal content and client widths (375 pixels excluding the scrollbar), confirming no horizontal overflow. Screenshot: `verification/easier-learning-mobile.png`. Browser viewport was restored after testing. Hosted-account testing remains outstanding.
## Seventh increment: reference-inspired circle dashboard

Applied the supplied visual reference to the existing learning dashboard: blue/navy styling, grade selector in the header, a prominent next-lesson card, connected numbered unit circles and a character panel with Outfits/Hats/Extras. Selecting a circle changes the lesson card; the existing branching tree remains available as an alternate view. Clothing controls use the existing unlock and persistence logic. Progress totals come from saved completion records. The character remains the customizable SVG, with improved shading and blue clothing details. No schema changes.

Verification: 36 tests passed; TypeScript, ESLint and production build passed. Browser checks confirmed Grade 9 to Grade 6 changes the actual path, circle selection changes the next lesson, the main action opens practice and returns with Continue learning, branching view works, and removing/re-equipping a cap persists after reload. At a 390 × 844 viewport, content and viewport widths were both 390 pixels. Screenshots are in verification/reference-dashboard-desktop.jpg and verification/reference-dashboard-mobile.jpg. Live Supabase testing and public deployment remain outstanding.


## Eighth increment: classroom authorization coverage

Added seven database integration scenarios using the real migrations and seed in ephemeral PostgreSQL. Coverage includes approved teacher creation, rejection of student role promotion and direct classroom/membership writes, private room discovery, normalized and repeat joins, owner-only assignment creation/report access, student roster privacy, assignment visibility, completion reports scoped to assigned lessons, repeat-completion reward uniqueness, and anonymous access rejection.

Found and fixed direct join-code disclosure to enrolled learners: migration 003 replaces table-wide classroom SELECT with explicit non-code column grants. The existing security-definer classroom_overview function still returns codes to owners and hides them from learners. Account loading already uses that function, so no UI or controller changes are needed. Apply 003 to any configured database; no hosted migration was run here.

Verification: all 44 tests, TypeScript and ESLint passed. No application bundle changes were made in this increment, so the previous dashboard preview remains current. Local PostgreSQL tests do not prove hosted Auth/REST behavior or concurrent sessions. Hosted acceptance remains pending a separate configured Supabase project. The next feature work is configurable assignments after hosted full-lesson coverage, or further grade curriculum expansion while that configuration is pending.

## Ninth increment: class grades and accessible student workspace

Classrooms now have an optional validated grade, required when creating new rooms in the UI. Teachers can set or change the grade of existing rooms. The enrolled class grade takes precedence over a personal browser preference; multiple graded classes have an explicit selector, and a missing/departed selection safely falls back to an enrolled class. Ungraded legacy classes preserve personal grade selection. The teacher lesson picker and submission handler filter new assignments to the class grade; migration 004 enforces that at the database boundary. Existing assignments and canonical progress IDs remain intact. Apply migration 004 after 001–003 before using the updated connected app; no hosted migration was performed.

Redesigned student navigation with paired icons and short labels, a persistent desktop course menu and compact phone navigation. The blue circle path uses tactile controls, green completion states, a labeled progress meter, and one prominent start/continue action. Younger grades receive shorter instructions; older grades retain lesson explanations. Practice has a question-position meter and larger inputs/feedback. Character rewards, optional branching tree, course search, classroom tools, themes and reduced-motion support remain available. No new external font or image service was added.

## Tenth increment: rounded customizable avatar

Replaced the angular placeholder artwork with a layered vector character: rounded face/ears, soft hair locks, expressive eyes and smile, rounded hands and sleeves, shaped trousers, detailed sneakers, fabric shading, a softer backdrop and grounding shadow. Updated every wearable layer to fit the new body: shirt, hoodie, cap, crown, badge and scarf. Artwork lives in character-preview.tsx and the wardrobe re-exports it so dashboard, header and profile share the same rendering. Per-instance gradient IDs preserve simultaneous previews. No new assets, network dependencies, inventory IDs, storage keys or database changes.

Verification: all 46 tests, TypeScript, ESLint and production build passed. Browser inspected shirt/cap/badge at desktop dashboard and profile sizes, equipped the unlocked forest hoodie, removed the cap to inspect the hair and face, and reloaded to verify persistence. At a 390 × 844 viewport, profile content/client widths were both 375 pixels. Locked crown/scarf remained locked; their artwork was updated without granting rewards. Screenshots: verification/rounded-avatar-wardrobe.jpg and verification/rounded-avatar-mobile.jpg. No hosted account verification was performed for this artwork-only change.

## Eleventh increment: expanded Grade 6 content

Added eight original lessons and 24 questions covering fraction groups, fraction division, decimal division, equivalent ratios, percentage amounts, evaluating expressions, rectangular-prism volume and mean/median. Each lesson has a worked example, three questions, targeted hints and worked solutions. Grade 6 now has 12 lessons across 10 circles; this is expanded coverage, not a complete standards-aligned course. New content is suggested only for Grade 6, while the catalog remains open to exploration. Existing lesson/question IDs, clothing inventory and saves are unchanged. Fractions and ratios demonstrate multi-lesson circles. Statistics now has an introductory Grade 6 unit.

Rebuilt supabase/seed.sql; reapply that seed after migrations 001–004 before grading the new lesson IDs with connected accounts. No new schema migration is needed. Kept the new Algebra subject-map node apart from existing nodes. Replaced a search test's hard-coded course lesson count with a canonical count so expanding content does not invalidate search coverage.

Verification: 50 tests, TypeScript, ESLint and production build passed. New tests independently calculate every new numeric key, check equivalent fractions, all-grade isolation and multi-lesson navigation. PostgreSQL tests assign all Grade 6 lessons, reject Grade 3 work for that room and grade all 24 new questions through submit_answer. Browser created and joined the local Grade 6 explorers class without changing the original Grade 3 class; the class selector switched between their distinct paths. Completed both fraction lessons (including 10/12 as equivalent to 5/6), observed circle progression 0% → 50% → 100%, unlocked the existing five-lesson scarf reward, and reloaded to confirm progress/class selection. This adds two lesson completions and the new class to local demo data. At 390 × 844, content/client widths were both 375 pixels. Screenshots: verification/grade-six-expanded-desktop.jpg and verification/grade-six-expanded-mobile.jpg. Hosted account checks remain pending.

## Twelfth increment: Atlas pawn and clothing checkpoints

Added a rounded blue/gold Atlas pawn with a mountain emblem to mark the next unfinished lesson's unit. Browsing a different circle changes the lesson preview, not the pawn; aria-current identifies the actual step. A completed grade path leaves the pawn at the finish. Earned gift badges and upcoming gift dots are placed on the circle path using unique known lesson completions and the existing clothing milestones. Future placement forecasts following the current path; out-of-order exploration may move a forecast. Rewards beyond a short grade path remain in the checkpoint strip without a false dot.

A connected clothing checkpoint strip shows cap/badge at 1, hoodie at 3, scarf at 5 and crown at 10 completed lessons. These remain lesson milestones, separate from the existing five-lessons-per-account-level display. No inventory IDs, thresholds, schema, unlock permissions or storage keys changed. Selecting a gift focuses its reward details, with a remaining-lesson count and wardrobe link. Earned state uses authoritative inventory; replay/unknown/duplicate completion IDs cannot advance it. Connected progress reads now explicitly sort by completion timestamp and lesson ID for stable earned-checkpoint placement.

Verification: all 54 tests, ESLint and production build (including TypeScript) passed. Four new tests cover next/resume/finish marker placement, multi-lesson forecasts, cross-grade rewards, short/empty paths, invalid/duplicate completions and all-rewards-earned behavior. Browser verified that previewing Percentages left the pawn at Expressions; a crown gift focused the 5-lessons-remaining panel, and an earned scarf gift showed its wardrobe link. The phone check at 390 × 844 reported equal content/client widths of 375 pixels. Desktop inspected at 1440 × 1080. Screenshots: verification/atlas-pawn-path.jpg and verification/atlas-pawn-mobile.jpg. Hosted account verification remains pending; no database migration is needed for this increment.

## Broad polish and curriculum expansion — October 29, 2026

Added 26 lessons and 78 questions (two lessons per grade, Kindergarten–12), bringing the catalog to 62 lessons and 155 questions. New lessons include worked examples, targeted hints and answer explanations; counting, arrays and fraction strips have accessible teaching illustrations. Grade 6 now has 14 lessons across 12 circles. Coverage is introductory and still incomplete; this is not a full standards-aligned K–12 curriculum.

Polished the rounded character, shaded clothing cards and Atlas pawn. Added Sunset sweater (15 unique completed lessons), Stargazer beanie (20), and Explorer satchel (30), preserving all previous items and thresholds. The path keeps its pawn on the next unfinished lesson while circle selection focuses the selected lesson. Multi-lesson circles expose a compact list. Wardrobe and reward details show the actual item art, with wearing/locked states and mobile/dark styles.

Practice now focuses each new question, prevents duplicate submissions, supplies guidance after incorrect answers, and shows one completion celebration. Replays are clearly marked and do not promise new XP. Next-lesson navigation skips completed lessons and can return to earlier unfinished grade work. Classroom create/join/assignment forms prevent repeated pending writes, reject whitespace-only names/titles, and filter the new-class course list by grade. Teacher reports ignore obsolete responses and show loading feedback. Course coverage labels preserve gaps instead of implying continuous coverage.

Connected setup: apply migration 005_more_clothing.sql after migrations 001–004, then reapply the current supabase/seed.sql. Migration 005 is additive and existing completion grants backfill its new clothing. No live Supabase connection or deployment was configured or changed. Guest saves, canonical IDs and existing architecture remain in place.

Verification: 61 automated tests pass, including all 78 new answer keys through the database grading function, wrong-grade assignment rejection, authorization isolation, and clothing unlock/equip thresholds through 30 lessons. ESLint, strict TypeScript and production build pass. Browser checks covered desktop paths, selected-circle focus and lesson menu, later reward details, phone practice incorrect/retry/completion/replay, locked wardrobe items, dark mode, and equal content/client widths at phone and intermediate widths. Screenshots are in verification/. Hosted teacher/student multi-browser acceptance remains a next step.

Next roadmap priorities: configure a separate Supabase test project and verify real teacher/student accounts; expand and review curriculum coverage; add configurable assignment question selection and richer teacher reporting. Games remain placeholders.
