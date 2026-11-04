"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, useRef } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Gamepad2,
  Sun,
  Moon,
  ArrowRight,
  Target,
  House,
  ClipboardList,
  Users,
  Smile,
} from "lucide-react";
import {
  courses,
  allLessons,
  satLessons,
  satDomains,
  games,
  type Lesson,
} from "@/lib/curriculum";
import { backend, appName } from "@/lib/backend";
import { AccountSession } from "@/lib/account-session";
import { loadAccount } from "@/lib/account-data";
import {
  changeOutfit,
  cosmeticItems,
  normalizeOutfit,
  unlockedItems,
  type OutfitSlot,
} from "@/lib/cosmetics";
import { CharacterWardrobe, CharacterPreview } from "./character-wardrobe";
import { LearningSidebar } from "./learning-sidebar";
import {
  readDemo,
  recordAttempt,
  STORAGE_KEY,
  type DemoState,
  type Classroom,
  type Assignment,
} from "@/lib/store";
import { ProgressCircle } from "./skill-tree";
import { Practice } from "./practice";
import { CourseMap } from "./course-map";
import {
  GradePicker,
  MyLearning,
  MyAssignments,
  UnitList,
  AvailableSubjects,
} from "./student-learning";
import {
  lessonName,
  gradeName,
  gradeLessons,
  assignmentIds,
  assignmentDone,
  learningContext,
  lessonNavigation,
  readPreferences,
  savePreferences,
  type LearningPreferences,
} from "@/lib/student-learning";
const nav = [
  ["/learn", "My Learning"],
  ["/courses", "Practice"],
  ["/assignments", "My Assignments"],
  ["/classrooms", "Classrooms"],
  ["/profile", "My Profile"],
] as const;
const navIcons = [House, BookOpen, ClipboardList, Users, Smile];
const subscribe = () => () => {};
export function Platform() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return mounted ? (
    <PlatformContent />
  ) : (
    <div className="app">
      <p role="status">Loading your learning space…</p>
    </div>
  );
}
function PlatformContent() {
  const path = usePathname();
  const [session] = useState(
    () =>
      new AccountSession({
        connected: Boolean(backend),
        load: (id) => {
          if (!backend) throw Error("Accounts are unavailable.");
          return loadAccount(backend, id);
        },
        readDemo,
        writeDemo: (next) =>
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next)),
        readPreferences,
        writePreferences: savePreferences,
      }),
  );
  const account = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot,
  );
  const { state, user, role, preferences } = account;
  const renderIdentity = session.capture();
  function requireCurrentAccount() {
    session.requireReady();
    if (!session.isCurrent(renderIdentity))
      throw Error("Your account changed. Please try again.");
    return renderIdentity;
  }
  const [demoRole, setDemoRole] = useState("student"),
    [message, setMessage] = useState(""),
    [dark, setDark] = useState(
      () => localStorage.getItem("math-atlas:theme") === "dark",
    );
  useEffect(() => {
    const client = backend;
    if (!client) return;
    return session.start({
      getUser: async () => {
        const { data, error } = await client.auth.getUser();
        if (error && error.name !== "AuthSessionMissingError")
          throw Error(error.message);
        return data.user?.id || null;
      },
      subscribe: (callback) => {
        const { data } = client.auth.onAuthStateChange((_, next) => {
          setMessage("");
          callback(next?.user.id || null);
        });
        return () => data.subscription.unsubscribe();
      },
    });
  }, [session]);

  function persist(next: DemoState) {
    session.saveDemo(next, requireCurrentAccount());
  }
  const activeRole = user ? role : demoRole;
  const context = learningContext(
    activeRole === "student" ? state.classrooms : [],
    user || "demo-student",
    preferences,
  );
  const effectivePreferences = { ...preferences, grade: context.grade };
  const [assignmentRoom, setAssignmentRoom] = useState("");
  const [newRoomGrade, setNewRoomGrade] = useState<number | null>(null);
  const [classroomBusy, setClassroomBusy] = useState(false);
  const classroomMutation = useRef(false);
  const selectedAssignmentRoom = state.classrooms.find(
    (room) => room.id === assignmentRoom,
  );
  const suggestedLessons =
    selectedAssignmentRoom?.grade != null
      ? gradeLessons(selectedAssignmentRoom.grade)
      : allLessons;
  const eligible = new Set(suggestedLessons.map((lesson) => lesson.id));
  const topics = courses
    .flatMap((course) => course.units)
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons.filter((lesson) => eligible.has(lesson.id)),
    }))
    .filter((unit) => unit.lessons.length);
  const completed = state.completed;
  const xp = completed.length * 50;
  const unlocked = user
    ? state.unlockedCosmetics || []
    : unlockedItems(completed);
  const outfit = normalizeOutfit(state.outfit, unlocked);
  async function equipCosmetic(slot: OutfitSlot, item: string | null) {
    const identity = requireCurrentAccount();
    if (user && backend) {
      const { error } = await backend.rpc("equip_cosmetic", {
        p_slot: slot,
        p_item: item,
      });
      if (!session.isCurrent(identity)) return;
      if (error) throw Error(error.message);
      await session.refresh(identity);
    } else {
      const current = session.getSnapshot().state;
      persist({
        ...current,
        outfit: changeOutfit(
          current.outfit,
          unlockedItems(current.completed),
          slot,
          item,
        ),
      });
    }
  }
  function announceRewards(before: string[], after: string[]) {
    const earned = cosmeticItems.filter(
      (item) => after.includes(item.id) && !before.includes(item.id),
    );
    if (earned.length)
      setMessage(
        `New clothing unlocked: ${earned.map((item) => item.name).join(", ")}. Visit My Profile to try it on!`,
      );
  }
  const course = courses.find((c) => c.id === path.split("/")[2]);
  const activeLesson = allLessons.find((l) => l.id === path.split("/")[2]);
  const teacherPage = path === "/classrooms";
  const showExplorer = path === "/courses" || path.startsWith("/course/");
  const learningPage = ["/", "/learn", "/dashboard"].includes(path);
  const lessonNav = activeLesson
    ? lessonNavigation(activeLesson.id, context.grade, completed)
    : null;
  function updatePreferences(next: LearningPreferences) {
    try {
      session.savePreferences(next, requireCurrentAccount());
    } catch {
      setMessage(
        "Your browser could not save your learning choices. Check that storage is allowed.",
      );
    }
  }
  function openLesson(
    lesson: Lesson,
    position?: number,
    identity = requireCurrentAccount(),
  ) {
    if (!session.isCurrent(identity)) return;
    const current = session.getSnapshot().preferences;
    try {
      session.savePreferences(
        {
          ...current,
          lastLesson: lesson.id,
          started: [...new Set([...current.started, lesson.id])],
          positions:
            position === undefined
              ? current.positions
              : { ...current.positions, [lesson.id]: position },
        },
        identity,
      );
    } catch {
      setMessage(
        "Your browser could not save your learning choices. Check that storage is allowed.",
      );
    }
  }
  const learningProps = {
    completed,
    attempts: state.attempts,
    preferences: effectivePreferences,
    onOpen: openLesson,
  };
  async function attempt(
    lesson: Lesson,
    questionId: string,
    answer: string,
    correct: boolean,
  ) {
    const identity = requireCurrentAccount();
    const previousUnlocks = unlocked;
    if (user && backend) {
      const { data, error } = await backend.rpc("submit_answer", {
        p_lesson: lesson.id,
        p_question: questionId,
        p_answer: answer,
      });
      if (!session.isCurrent(identity)) return false;
      if (error) throw Error(error.message);
      if (!(await session.refresh(identity))) return false;
      announceRewards(
        previousUnlocks,
        session.getSnapshot().state.unlockedCosmetics || [],
      );
      openLesson(lesson, undefined, identity);
      return Boolean(data);
    }
    persist(
      recordAttempt(state, lesson, {
        questionId,
        answer,
        correct,
        at: new Date().toISOString(),
      }),
    );
    openLesson(lesson);
    announceRewards(
      previousUnlocks,
      unlockedItems(session.getSnapshot().state.completed),
    );
    return correct;
  }
  async function createRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (classroomMutation.current) return;
    classroomMutation.current = true;
    setClassroomBusy(true);
    const data = new FormData(e.currentTarget);
    const roomName = String(data.get("name")).trim();
    const identity = renderIdentity;
    try {
      requireCurrentAccount();
      if (!roomName) throw Error("Give your classroom a name.");
      if (user && backend) {
        const { error } = await backend.rpc("create_classroom", {
          p_name: roomName,
          p_course: String(data.get("course")),
          p_grade: Number(data.get("grade")),
        });
        if (!session.isCurrent(identity)) return;
        if (error) throw error;
        if (!(await session.refresh(identity))) return;
      } else {
        const room: Classroom = {
          id: crypto.randomUUID(),
          name: roomName,
          course: String(data.get("course")),
          grade: Number(data.get("grade")),
          code: crypto
            .randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase(),
          owner: "demo-teacher",
          members: [],
        };
        persist({ ...state, classrooms: [...state.classrooms, room] });
      }
      setMessage("Classroom created. Share its join code.");
    } catch (e) {
      if (session.isCurrent(identity)) setMessage((e as Error).message);
    } finally {
      classroomMutation.current = false;
      setClassroomBusy(false);
    }
  }
  async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (classroomMutation.current) return;
    classroomMutation.current = true;
    setClassroomBusy(true);
    const code = String(new FormData(e.currentTarget).get("code"))
      .trim()
      .toUpperCase();
    const identity = renderIdentity;
    try {
      requireCurrentAccount();
      if (user && backend) {
        const { error } = await backend.rpc("join_classroom", { p_code: code });
        if (!session.isCurrent(identity)) return;
        if (error) throw error;
        if (!(await session.refresh(identity))) return;
      } else {
        const room = state.classrooms.find((c) => c.code === code);
        if (!room)
          throw Error(
            "No classroom found. In demo mode, create and join in this browser.",
          );
        persist({
          ...state,
          classrooms: state.classrooms.map((c) =>
            c.id === room.id
              ? { ...c, members: [...new Set([...c.members, "demo-student"])] }
              : c,
          ),
        });
      }
      setMessage("You joined the classroom.");
    } catch (e) {
      if (session.isCurrent(identity)) setMessage((e as Error).message);
    } finally {
      classroomMutation.current = false;
      setClassroomBusy(false);
    }
  }
  async function setClassGrade(
    event: React.FormEvent<HTMLFormElement>,
    roomId: string,
  ) {
    event.preventDefault();
    const grade = Number(new FormData(event.currentTarget).get("grade"));
    const identity = renderIdentity;
    try {
      requireCurrentAccount();
      if (user && backend) {
        const { error } = await backend.rpc("set_classroom_grade", {
          p_classroom: roomId,
          p_grade: grade,
        });
        if (!session.isCurrent(identity)) return;
        if (error) throw error;
        await session.refresh(identity);
      } else
        persist({
          ...state,
          classrooms: state.classrooms.map((room) =>
            room.id === roomId ? { ...room, grade } : room,
          ),
        });
      if (session.isCurrent(identity))
        setMessage("Class grade saved. Existing assignments are kept.");
    } catch (error) {
      if (session.isCurrent(identity)) setMessage((error as Error).message);
    }
  }
  async function assign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (classroomMutation.current) return;
    classroomMutation.current = true;
    setClassroomBusy(true);
    const d = new FormData(e.currentTarget);
    const [lesson, ...additionalLessons] = new Set([
      ...d.getAll("lesson").map(String),
      ...topics
        .filter((topic) => d.getAll("topic").includes(topic.id))
        .flatMap((topic) => topic.lessons.map((item) => item.id)),
    ]);
    const a: Assignment = {
      id: crypto.randomUUID(),
      classroom: String(d.get("classroom")),
      lesson,
      additionalLessons,
      title: String(d.get("title")).trim(),
      due: String(d.get("due")),
    };
    const identity = renderIdentity;
    try {
      requireCurrentAccount();
      const room = state.classrooms.find((room) => room.id === a.classroom);
      if (!a.title) throw Error("Give your assignment a title.");
      if (!room || !lesson || !assignmentIds(a).every((id) => eligible.has(id)))
        throw Error("Choose a lesson for this classroom’s grade.");
      if (user && backend) {
        const { error } = await backend.from("assignments").insert({
          classroom_id: a.classroom,
          lesson_id: a.lesson,
          additional_lesson_ids: a.additionalLessons,
          title: a.title,
          due_at: a.due ? new Date(a.due + "T23:59:59").toISOString() : null,
        });
        if (!session.isCurrent(identity)) return;
        if (error) throw error;
        if (!(await session.refresh(identity))) return;
      } else persist({ ...state, assignments: [...state.assignments, a] });
      setMessage(
        "Assignment created. Students can open the selected lessons from My Assignments.",
      );
    } catch (e) {
      if (session.isCurrent(identity)) setMessage((e as Error).message);
    } finally {
      classroomMutation.current = false;
      setClassroomBusy(false);
    }
  }
  async function auth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!backend) {
      setMessage(
        "Accounts require Supabase configuration. Guest learning works now.",
      );
      return;
    }
    const d = new FormData(e.currentTarget),
      email = String(d.get("email")),
      password = String(d.get("password"));
    const signup = d.get("action") === "signup";
    if (signup && process.env.NEXT_PUBLIC_ENABLE_ACCOUNT_SIGNUP !== "true") {
      setMessage(
        "Public registration is disabled pending consent and safeguarding setup.",
      );
      return;
    }
    const { error } = signup
      ? await backend.auth.signUp({ email, password })
      : await backend.auth.signInWithPassword({ email, password });
    setMessage(
      error
        ? error.message
        : signup
          ? "Check your email to confirm your account."
          : "Signed in.",
    );
  }
  function assignmentCards() {
    const visible = state.assignments.filter((a) =>
      state.classrooms.some(
        (c) =>
          c.id === a.classroom &&
          (activeRole === "teacher" ||
            c.members.includes(user || "demo-student")),
      ),
    );
    return visible.length ? (
      <div className="stack">
        {visible.map((a) => (
          <Link
            className="assignment"
            key={a.id}
            href={
              "/lesson/" +
              (assignmentIds(a).find((id) => !completed.includes(id)) ??
                a.lesson)
            }
          >
            <BookOpen size={20} />
            <span>
              <strong>{a.title}</strong>
              <small>
                {a.due ? `Due ${a.due.slice(0, 10)}` : "No due date"} ·{" "}
                {assignmentIds(a)
                  .map((id) => allLessons.find((l) => l.id === id)?.title ?? id)
                  .join(", ")}
              </small>
            </span>
            <span className="badge">
              {assignmentDone(a, completed) ? "Completed" : "Open lesson →"}
            </span>
          </Link>
        ))}
      </div>
    ) : (
      <p className="muted">
        No assignments yet. Join a classroom to see your work here.
      </p>
    );
  }
  if (account.status !== "ready") {
    return (
      <div className="app" data-theme={dark ? "dark" : "light"}>
        <main>
          <section className="page-heading">
            <h1>
              {account.status === "error"
                ? "Let’s reconnect your account"
                : "Loading your learning space…"}
            </h1>
            {account.status === "error" ? (
              <>
                <p role="alert">{account.error}</p>
                <div className="actions">
                  <button className="primary" onClick={session.retry}>
                    Try again
                  </button>
                  <button
                    className="secondary"
                    onClick={() => backend?.auth.signOut()}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <p role="status">
                Checking your account and loading your progress.
              </p>
            )}
          </section>
        </main>
      </div>
    );
  }
  return (
    <div
      data-theme={dark ? "dark" : "light"}
      className={
        teacherPage
          ? "app teacher-app"
          : learningPage
            ? "app student-app reference-dashboard"
            : "app student-app"
      }
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link href="/" className="brand">
          <svg
            className="atlas-brand-mark"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path d="M3 42 24 5l21 37H3z" fill="#1460ff" />
            <path d="m14 23 10 13 10-13-10 7z" fill="#cde3ff" />
            <path d="m19 13 5-8 5 8-5 9z" fill="#4991ff" />
          </svg>
          {appName}
        </Link>
        <nav aria-label="Main navigation">
          {teacherPage ? (
            <>
              <Link href="/classrooms" className="active">
                Teacher & classroom area
              </Link>
              <Link href="/learn">Back to My Learning</Link>
            </>
          ) : (
            nav.map(([href, label], index) => (
              <Link
                key={href}
                href={href}
                className={
                  (href === "/learn" && learningPage) ||
                  (href === "/courses" &&
                    (path.startsWith("/lesson/") ||
                      path.startsWith("/course/"))) ||
                  path.startsWith(href)
                    ? "active"
                    : ""
                }
                aria-current={
                  (href === "/learn" && learningPage) ||
                  (href === "/courses" &&
                    (path.startsWith("/lesson/") ||
                      path.startsWith("/course/"))) ||
                  path.startsWith(href)
                    ? "page"
                    : undefined
                }
              >
                {(() => {
                  const Icon = navIcons[index];
                  return <Icon size={24} aria-hidden="true" />;
                })()}
                <span>
                  {label === "My Learning"
                    ? "Learn"
                    : label === "My Assignments"
                      ? "My work"
                      : label === "My Profile"
                        ? "My character"
                        : label === "Classrooms"
                          ? "My class"
                          : label}
                </span>
              </Link>
            ))
          )}
        </nav>
        {learningPage && (
          <div className="dashboard-header-actions">
            <GradePicker
              grade={context.grade}
              disabled={!!context.classroom}
              onChange={(grade) => updatePreferences({ ...preferences, grade })}
            />
            <Link
              className="header-character"
              href="/profile"
              aria-label="My character and profile"
            >
              <CharacterPreview outfit={outfit} />
            </Link>
          </div>
        )}
        {teacherPage && (
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Toggle dark mode"
              onClick={() => {
                setDark(!dark);
                localStorage.setItem(
                  "math-atlas:theme",
                  !dark ? "dark" : "light",
                );
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button
                className="secondary"
                onClick={() => backend?.auth.signOut()}
              >
                Sign out
              </button>
            ) : (
              <Link className="primary small" href="/account">
                Log in <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        )}
      </header>
      <div className="mode-bar">
        {user
          ? "Connected account"
          : "Guest demo · Progress saves in this browser"}
        {!teacherPage &&
          preferences.grade !== null &&
          preferences.grade >= 7 && (
            <Link
              href="/sat"
              aria-current={path === "/sat" ? "page" : undefined}
            >
              SAT Math
            </Link>
          )}
      </div>
      <div
        className={
          teacherPage
            ? ""
            : showExplorer
              ? "student-workspace"
              : "personal-learning-workspace"
        }
      >
        {showExplorer && (
          <LearningSidebar
            key={path}
            path={path}
            completed={completed}
            onOpen={openLesson}
          />
        )}
        <main id="main">
          {message && (
            <div role="status" className="notice">
              {message}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </div>
          )}
          {context.classroom &&
            (learningPage ||
              path === "/profile" ||
              path === "/assignments") && (
              <section
                className="notice class-learning-context"
                aria-label="Class grade"
              >
                <label>
                  Learning for
                  <select
                    value={context.classroom.id}
                    onChange={(event) =>
                      updatePreferences({
                        ...preferences,
                        classroomId: event.target.value,
                      })
                    }
                  >
                    {context.enrolled.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} · {gradeName(room.grade!)}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  Your teacher sets this grade. Find assignments in My work.
                </p>
              </section>
            )}
          {learningPage && (
            <MyLearning
              key={context.grade ?? "choose-grade"}
              {...learningProps}
              outfit={outfit}
              unlocked={unlocked}
              onEquip={equipCosmetic}
            />
          )}
          {path === "/assignments" && (
            <MyAssignments
              {...learningProps}
              assignments={state.assignments}
              classrooms={state.classrooms}
              studentId={user || "demo-student"}
              onJoin={joinRoom}
              joining={classroomBusy}
            />
          )}
          {path === "/courses" && (
            <>
              <div className="student-page-heading">
                <div>
                  <h1>All courses</h1>
                  <p>
                    Pick a course, then choose a unit or jump straight to a
                    lesson using the course explorer.
                  </p>
                </div>
              </div>
              <AvailableSubjects catalog />
            </>
          )}
          {path.startsWith("/course/") &&
            (course && !course.planned ? (
              <>
                <div className="student-page-heading">
                  <div>
                    <Link href="/learn" className="text-link">
                      ← My Learning
                    </Link>
                    <h1>{course.title}</h1>
                    <p>Choose a unit to see its lessons.</p>
                  </div>
                </div>
                <CourseMap
                  key={course.id}
                  course={course}
                  completed={completed}
                  onOpen={openLesson}
                />
                <UnitList
                  {...learningProps}
                  units={course.units.map((unit) => ({
                    key: `${course.id}-${unit.id}`,
                    title: unit.title,
                    courseId: course.id,
                    unit,
                  }))}
                />
              </>
            ) : (
              <PageHeading
                title="Coming Soon"
                description="These lessons are not ready yet. Choose My Learning to find available lessons."
              />
            ))}
          {path.startsWith("/lesson/") &&
            (activeLesson && lessonNav ? (
              <>
                <div className="lesson-breadcrumb">
                  <Link href={lessonNav.backHref}>← Back to Unit</Link>
                  <span>{lessonNav.unitTitle}</span>
                </div>
                <div className="student-page-heading lesson-title">
                  <div>
                    <h1>{lessonName(activeLesson)}</h1>
                    <p>{activeLesson.explanation}</p>
                  </div>
                </div>
                <section className="worked-example">
                  <h2>Worked example</h2>
                  <p>{activeLesson.example}</p>
                </section>
                <Practice
                  key={`${user || "guest"}:${activeLesson.id}`}
                  lesson={activeLesson}
                  completed={completed.includes(activeLesson.id)}
                  initialIndex={preferences.positions[activeLesson.id]}
                  onPositionChange={(index) => openLesson(activeLesson, index)}
                  onAttempt={(q, a, c) => attempt(activeLesson, q, a, c)}
                  completionAction={
                    lessonNav.next ? (
                      <Link
                        className="primary"
                        href={"/lesson/" + lessonNav.next.id}
                        onClick={() => openLesson(lessonNav.next!)}
                      >
                        Next Lesson: {lessonName(lessonNav.next)}
                      </Link>
                    ) : (
                      <Link className="primary" href={lessonNav.backHref}>
                        Back to Unit
                      </Link>
                    )
                  }
                />
                <div className="lesson-bottom-nav">
                  <Link href={lessonNav.backHref}>← Back to Unit</Link>
                  {!completed.includes(activeLesson.id) && (
                    <span>
                      Answer each question correctly to finish this lesson.
                    </span>
                  )}
                </div>
              </>
            ) : (
              <PageHeading
                title="Lesson not found"
                description="Choose My Learning to find your lessons."
              />
            ))}
          {path === "/profile" && (
            <>
              <div className="student-page-heading">
                <div>
                  <h1>My Profile</h1>
                  <p>Your grade and learning settings.</p>
                </div>
              </div>
              <section className="profile-section">
                <h2>My grade</h2>
                <GradePicker
                  grade={context.grade}
                  disabled={!!context.classroom}
                  onChange={(grade) =>
                    updatePreferences({ ...preferences, grade })
                  }
                />
                <p>
                  {context.classroom
                    ? "Your teacher sets this grade. Use Learning for to switch between your classes."
                    : `Your grade choice is saved in this browser${user ? " for your account" : ""}.`}
                </p>
              </section>
              <section className="profile-section">
                <h2>My progress</h2>
                <p>
                  {completed.length} lessons completed · {xp} XP · Level{" "}
                  {Math.floor(xp / 250) + 1}
                </p>
              </section>
              <CharacterWardrobe
                key={user || "guest"}
                outfit={outfit}
                unlocked={unlocked}
                onEquip={equipCosmetic}
              />
              <section className="profile-section">
                <h2>My account</h2>
                <p>
                  {user
                    ? "You are signed in. Your completed lessons are saved to your account."
                    : "You’re learning as a guest. Your progress is saved in this browser."}
                </p>
                {user ? (
                  <button
                    className="secondary"
                    onClick={() => backend?.auth.signOut()}
                  >
                    Sign out
                  </button>
                ) : (
                  <Link className="secondary" href="/account">
                    Log in or create an account
                  </Link>
                )}
              </section>
              <section className="profile-section">
                <h2>More options</h2>
                <ul className="profile-links">
                  <li>
                    <Link href="/classrooms">
                      {user && role === "teacher"
                        ? "Teacher area"
                        : "Classrooms & teacher area"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/games">Math Games · Coming Soon</Link>
                  </li>
                  <li>
                    <Link href="/sat">SAT Math · For older students</Link>
                  </li>
                </ul>
                <button
                  className="secondary"
                  onClick={() => {
                    setDark(!dark);
                    localStorage.setItem(
                      "math-atlas:theme",
                      !dark ? "dark" : "light",
                    );
                  }}
                >
                  {dark ? "Use light background" : "Use dark background"}
                </button>
              </section>
            </>
          )}
          {path === "/sat" && (
            <>
              <PageHeading
                eyebrow="A LITTLE PRACTICE. A LOT MORE CONFIDENCE."
                title="Your SAT Math toolkit."
                description="Original questions. Clear explanations. A path forward in every domain."
              />
              <div className="card diagnostic">
                <div>
                  <span className="badge">START WITH A CHECK-IN</span>
                  <h2>Find your starting point</h2>
                  <p>
                    Try one lesson in each domain. Your weakest areas appear
                    below as you learn.
                  </p>
                </div>
                <Link className="primary" href="/lesson/sat-algebra">
                  Start diagnostic path <ArrowRight size={17} />
                </Link>
              </div>
              <div className="grid two">
                {satLessons.map((l, i) => (
                  <article className="card" key={l.id}>
                    <div className="card-top">
                      <Target />
                      <ProgressCircle
                        value={completed.includes(l.id) ? 100 : 0}
                      />
                    </div>
                    <span className="eyebrow">DOMAIN 0{i + 1}</span>
                    <h2>{satDomains[i]}</h2>
                    <p>{l.explanation}</p>
                    <span className="badge">
                      {completed.includes(l.id) ? "Mastered" : "Needs practice"}
                    </span>
                    <Link className="text-link" href={"/lesson/" + l.id}>
                      Practice this domain →
                    </Link>
                    <Link
                      className="subtle-link"
                      href={
                        "/lesson/" +
                        ["solve", "quadratic", "fractions", "function"][i]
                      }
                    >
                      Review a related math concept
                    </Link>
                  </article>
                ))}
              </div>
              <p className="muted">
                Introductory diagnostic path, not an official score prediction.
                Timed modules and adaptive testing are planned. Questions are
                original and not affiliated with College Board.
              </p>
            </>
          )}
          {path === "/classrooms" && (
            <>
              <PageHeading
                eyebrow="BETTER TOGETHER"
                title="Room for every learner."
                description="A simple space to connect learning, classrooms, and assignments."
              />
              {!user && (
                <div className="notice">
                  Classroom demo: one browser, two roles. This is shared local
                  demonstration data, not real student accounts.
                  <div className="actions">
                    <button
                      className={
                        demoRole === "student" ? "primary" : "secondary"
                      }
                      onClick={() => setDemoRole("student")}
                    >
                      Student view
                    </button>
                    <button
                      className={
                        demoRole === "teacher" ? "primary" : "secondary"
                      }
                      onClick={() => setDemoRole("teacher")}
                    >
                      Teacher view
                    </button>
                  </div>
                </div>
              )}
              {activeRole === "teacher" ? (
                <div className="grid two">
                  <form className="card stack" onSubmit={createRoom}>
                    <h2>Create a classroom</h2>
                    <label>
                      Class grade
                      <select
                        name="grade"
                        required
                        value={newRoomGrade ?? ""}
                        onChange={(event) =>
                          setNewRoomGrade(Number(event.target.value))
                        }
                      >
                        <option value="" disabled>
                          Choose a grade
                        </option>
                        {Array.from({ length: 13 }, (_, grade) => (
                          <option key={grade} value={grade}>
                            {gradeName(grade)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Classroom name
                      <input
                        name="name"
                        required
                        maxLength={80}
                        placeholder="Algebra explorers"
                      />
                    </label>
                    <label>
                      Course
                      <select name="course" key={newRoomGrade ?? "all"}>
                        {courses
                          .filter(
                            (c) =>
                              !c.planned &&
                              (newRoomGrade === null ||
                                c.grades.includes(newRoomGrade)),
                          )
                          .map((c) => (
                            <option value={c.id} key={c.id}>
                              {c.title}
                            </option>
                          ))}
                      </select>
                    </label>
                    <button className="primary" disabled={classroomBusy}>
                      {classroomBusy ? "Saving…" : "Create classroom"}
                    </button>
                  </form>
                  <form className="card stack" onSubmit={assign}>
                    <h2>Create an assignment</h2>
                    <label>
                      Classroom
                      <select
                        name="classroom"
                        required
                        value={assignmentRoom}
                        onChange={(event) =>
                          setAssignmentRoom(event.target.value)
                        }
                      >
                        <option value="">Choose a classroom</option>
                        {state.classrooms.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Title
                      <input name="title" required maxLength={120} />
                    </label>
                    <fieldset
                      key={assignmentRoom + "-" + selectedAssignmentRoom?.grade}
                      disabled={!selectedAssignmentRoom}
                    >
                      <legend>Lessons and topics</legend>
                      {selectedAssignmentRoom &&
                        topics.map((topic) => (
                          <details key={topic.id}>
                            <summary>{topic.title}</summary>
                            <label>
                              <input
                                type="checkbox"
                                name="topic"
                                value={topic.id}
                              />
                              All lessons in {topic.title}
                            </label>
                            {topic.lessons.map((lesson) => (
                              <label key={lesson.id}>
                                <input
                                  type="checkbox"
                                  name="lesson"
                                  value={lesson.id}
                                />
                                {lesson.title}
                              </label>
                            ))}
                          </details>
                        ))}
                    </fieldset>
                    <label>
                      Due date
                      <input type="date" name="due" />
                    </label>
                    <button
                      className="primary"
                      disabled={!selectedAssignmentRoom || classroomBusy}
                    >
                      Create assignment
                    </button>
                    <small>
                      Select individual lessons or all lessons in a topic.
                    </small>
                  </form>
                </div>
              ) : (
                <form className="card join-form" onSubmit={joinRoom}>
                  <h2>Find your classroom</h2>
                  <label>
                    Classroom code
                    <input
                      name="code"
                      required
                      placeholder="Enter your 12-character code"
                      maxLength={32}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                  <button className="primary" disabled={classroomBusy}>
                    {classroomBusy ? "Joining…" : "Join classroom"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
              <div className="grid two section">
                {state.classrooms
                  .filter(
                    (c) =>
                      activeRole === "teacher" ||
                      c.members.includes(user || "demo-student"),
                  )
                  .map((c) => (
                    <article className="card" key={c.id}>
                      <span className="eyebrow">
                        {courses.find((x) => x.id === c.course)?.title}
                      </span>
                      <h2>{c.name}</h2>
                      <p>
                        {c.grade != null
                          ? gradeName(c.grade)
                          : "Grade not set · existing classroom"}
                      </p>
                      {activeRole === "teacher" && (
                        <form
                          onSubmit={(event) => void setClassGrade(event, c.id)}
                        >
                          <label>
                            Class grade
                            <select
                              name="grade"
                              defaultValue={c.grade ?? ""}
                              required
                            >
                              <option value="" disabled>
                                Choose a grade
                              </option>
                              {Array.from({ length: 13 }, (_, grade) => (
                                <option key={grade} value={grade}>
                                  {gradeName(grade)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button className="secondary">
                            Save class grade
                          </button>
                        </form>
                      )}
                      {activeRole === "teacher" && (
                        <p>
                          Join code: <code>{c.code}</code>
                        </p>
                      )}
                      <p>
                        {c.members.length} student
                        {c.members.length !== 1 ? "s" : ""} ·{" "}
                        {
                          state.assignments.filter((a) => a.classroom === c.id)
                            .length
                        }{" "}
                        assignments
                      </p>
                      {activeRole === "teacher" && (
                        <details>
                          <summary>Student roster and completion</summary>
                          {c.members.length ? (
                            c.members.map((id) => (
                              <p key={id}>
                                Learner {id.slice(0, 8)} ·{" "}
                                {user
                                  ? "See verified completion below"
                                  : state.assignments.filter(
                                      (a) =>
                                        a.classroom === c.id &&
                                        assignmentDone(a, completed),
                                    ).length + " assignments completed"}
                              </p>
                            ))
                          ) : (
                            <p>No students enrolled yet.</p>
                          )}
                          {user && (
                            <TeacherReport
                              classroom={c.id}
                              assignmentCount={
                                state.assignments.filter(
                                  (a) => a.classroom === c.id,
                                ).length
                              }
                            />
                          )}
                        </details>
                      )}
                    </article>
                  ))}
              </div>
              <section className="card">
                <h2>
                  {activeRole === "teacher"
                    ? "Recent assignments"
                    : "My Assignments"}
                </h2>
                {assignmentCards()}
              </section>
            </>
          )}
          {path === "/games" && (
            <>
              <PageHeading
                eyebrow="A FUTURE CHAPTER"
                title="A little play. A lot of possibility."
                description="Your favorite math games will have a home here when we’re ready to connect them."
              />
              <div className="grid two">
                {games.map((g, i) => (
                  <article className={"course-card tint-" + i} key={g.id}>
                    <Gamepad2 size={36} />
                    <h2>{g.title}</h2>
                    <p>{g.description}</p>
                    <span className="badge">Integration planned</span>
                    <p className="muted">
                      The existing game remains separate. No game has been
                      rebuilt or connected.
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
          {path === "/account" && (
            <>
              <PageHeading
                title="My account"
                description="Log in to save completed lessons to your account. You can also keep learning as a guest."
              />
              <form onSubmit={auth} className="card account stack">
                <h2>Welcome back</h2>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={8}
                    required
                  />
                </label>
                <label>
                  Action
                  <select name="action">
                    <option value="login">Log in</option>
                    <option value="signup">
                      Create student account (13+ only)
                    </option>
                  </select>
                </label>
                <label className="checkbox">
                  <input type="checkbox" required /> I am 13 or older. Younger
                  learners can use guest mode with an adult.
                </label>
                <button className="primary">
                  Continue <ArrowRight size={17} />
                </button>
                <p className="muted">
                  Teacher access requires administrator approval. Do not enter
                  children’s personal information in this preview.
                </p>
                {!backend && (
                  <p className="notice">
                    Supabase is not configured. Accounts are unavailable; use
                    the guest learning experience.
                  </p>
                )}
                <Link href="/learn" className="text-link">
                  Continue as a guest →
                </Link>
              </form>
            </>
          )}
          {![
            "/",
            "/learn",
            "/courses",
            "/sat",
            "/dashboard",
            "/classrooms",
            "/games",
            "/account",
            "/assignments",
            "/profile",
          ].includes(path) &&
            !path.startsWith("/course/") &&
            !path.startsWith("/lesson/") && (
              <PageHeading
                title="Page not found"
                description="Choose My Learning to find your lessons."
              />
            )}
        </main>
      </div>
      <footer>
        <Link href="/" className="brand">
          ✦ {appName}
        </Link>
        <span>Made for curious minds. Free for everyone.</span>
        <small>Preview · No ads, public profiles, or messaging</small>
      </footer>
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
function TeacherReport({
  classroom,
  assignmentCount,
}: {
  classroom: string;
  assignmentCount: number;
}) {
  const [rows, setRows] = useState<
      {
        student_id: string;
        assignment_id: string;
        title: string;
        lesson_ids: string[];
        completed_count: number;
      }[]
    >([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    backend
      ?.rpc("assignment_content_report", { p_classroom: classroom })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setRows(data || []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [classroom, assignmentCount]);
  return (
    <div>
      {loading ? (
        <p role="status">Loading verified progress…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : rows.length ? (
        rows.map((r) => (
          <p key={r.assignment_id + "-" + r.student_id}>
            Learner {r.student_id.slice(0, 8)} · {r.title} · {r.completed_count}
            /{r.lesson_ids.length} lessons complete
          </p>
        ))
      ) : (
        <p>No assigned lesson results yet.</p>
      )}
    </div>
  );
}
