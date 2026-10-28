"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Gamepad2,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Target,
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
import {
  emptyState,
  readDemo,
  recordAttempt,
  STORAGE_KEY,
  type DemoState,
  type Classroom,
  type Assignment,
} from "@/lib/store";
import { SkillTree, ProgressCircle } from "./skill-tree";
import { Practice } from "./practice";
const nav = [
  ["/learn", "Explore", Compass],
  ["/dashboard", "My learning", LayoutDashboard],
  ["/sat", "SAT Math", Target],
  ["/classrooms", "Classrooms", GraduationCap],
  ["/games", "Math Games", Gamepad2],
] as const;
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
  const path = usePathname(),
    router = useRouter();
  const [state, setState] = useState<DemoState>(readDemo),
    [user, setUser] = useState<string | null>(null),
    [role, setRole] = useState("student"),
    [demoRole, setDemoRole] = useState("student"),
    [message, setMessage] = useState(""),
    [dark, setDark] = useState(
      () => localStorage.getItem("math-atlas:theme") === "dark",
    );
  const [grade, setGrade] = useState("all"),
    [subject, setSubject] = useState("all"),
    [selected, setSelected] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    if (!backend) return;
    backend.auth.getUser().then(({ data }) => {
      setUser(data.user?.id || null);
      if (data.user) void refresh(data.user.id);
    });
    const { data } = backend.auth.onAuthStateChange((_, session) => {
      setUser(session?.user.id || null);
      if (session?.user) void refresh(session.user.id);
      else setState(readDemo());
    });
    return () => data.subscription.unsubscribe();
  }, []);
  async function refresh(id: string) {
    if (!backend) return;
    const [p, progress, rooms, assignments] = await Promise.all([
      backend.from("profiles").select("role").eq("id", id).single(),
      backend.from("lesson_progress").select("lesson_id").eq("user_id", id),
      backend.rpc("classroom_overview"),
      backend.from("assignments").select("*"),
    ]);
    const err = p.error || progress.error || rooms.error || assignments.error;
    if (err) {
      setMessage(err.message);
      return;
    }
    setRole(p.data.role);
    setState({
      ...emptyState,
      completed: progress.data.map((x) => x.lesson_id),
      classrooms: rooms.data || [],
      assignments: assignments.data.map((x) => ({
        id: x.id,
        classroom: x.classroom_id,
        lesson: x.lesson_id,
        due: x.due_at || "",
        title: x.title,
      })),
      studentCompleted: {},
    });
  }

  function persist(next: DemoState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  }
  const activeRole = user ? role : demoRole;
  const completed = state.completed;
  const xp = completed.length * 50;
  const course = courses.find((c) => c.id === path.split("/")[2]);
  const activeLesson = allLessons.find((l) => l.id === path.split("/")[2]);
  async function attempt(
    lesson: Lesson,
    questionId: string,
    answer: string,
    correct: boolean,
  ) {
    if (user && backend) {
      const { data, error } = await backend.rpc("submit_answer", {
        p_lesson: lesson.id,
        p_question: questionId,
        p_answer: answer,
      });
      if (error) throw Error(error.message);
      await refresh(user);
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
    return correct;
  }
  async function createRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      if (user && backend) {
        const { error } = await backend.rpc("create_classroom", {
          p_name: String(data.get("name")),
          p_course: String(data.get("course")),
        });
        if (error) throw error;
        await refresh(user);
      } else {
        const room: Classroom = {
          id: crypto.randomUUID(),
          name: String(data.get("name")),
          course: String(data.get("course")),
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
      setMessage((e as Error).message);
    }
  }
  async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code"))
      .trim()
      .toUpperCase();
    try {
      if (user && backend) {
        const { error } = await backend.rpc("join_classroom", { p_code: code });
        if (error) throw error;
        await refresh(user);
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
      setMessage((e as Error).message);
    }
  }
  async function assign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const a: Assignment = {
      id: crypto.randomUUID(),
      classroom: String(d.get("classroom")),
      lesson: String(d.get("lesson")),
      title: String(d.get("title")),
      due: String(d.get("due")),
    };
    try {
      if (user && backend) {
        const { error } = await backend.from("assignments").insert({
          classroom_id: a.classroom,
          lesson_id: a.lesson,
          title: a.title,
          due_at: a.due ? new Date(a.due + "T23:59:59").toISOString() : null,
        });
        if (error) throw error;
        await refresh(user);
      } else persist({ ...state, assignments: [...state.assignments, a] });
      setMessage(
        "Assignment created. Completing its lesson updates personal progress.",
      );
    } catch (e) {
      setMessage((e as Error).message);
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
          <Link className="assignment" key={a.id} href={"/lesson/" + a.lesson}>
            <BookOpen size={20} />
            <span>
              <strong>{a.title}</strong>
              <small>
                {a.due ? `Due ${a.due.slice(0, 10)}` : "No due date"} ·{" "}
                {allLessons.find((l) => l.id === a.lesson)?.title}
              </small>
            </span>
            <span className="badge">
              {completed.includes(a.lesson) ? "Completed" : "Open lesson →"}
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
  return (
    <div data-theme={dark ? "dark" : "light"} className="app">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link href="/" className="brand">
          <span className="brand-icon">
            a<span>✦</span>
          </span>
          {appName}
          <span className="beta">BETA</span>
        </Link>
        <nav aria-label="Main navigation">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? "active" : ""}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
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
      </header>
      <div className="mode-bar">
        {user
          ? "Connected account"
          : "Guest demo · Progress saves in this browser"}
        <span>Always free. Always growing.</span>
      </div>
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
        {path === "/" && (
          <>
            <section className="hero">
              <div>
                <div className="eyebrow">
                  <span className="dot" /> YOUR NEXT DISCOVERY STARTS HERE
                </div>
                <h1>
                  Big ideas.
                  <br />
                  Small steps.
                  <br />
                  <span>Endless possibility.</span>
                </h1>
                <p>
                  Math isn’t a straight line. Find your own path with
                  interactive lessons, connected ideas, and a little curiosity.
                </p>
                <div className="actions">
                  <Link className="primary" href="/learn">
                    Find your learning path <ArrowRight size={18} />
                  </Link>
                  <Link className="text-link" href="/course/algebra">
                    Explore the skill tree ↗
                  </Link>
                </div>
                <div className="hero-meta">
                  <span>
                    <Check size={15} /> 100% free
                  </span>
                  <span>
                    <Check size={15} /> Learn at your pace
                  </span>
                  <span>
                    <Check size={15} /> No account needed
                  </span>
                </div>
              </div>
              <div className="hero-map">
                <div className="map-caption">
                  <span className="eyebrow">A WORLD OF CONNECTED IDEAS</span>
                  <span className="badge">Algebra I</span>
                </div>
                <SkillTree
                  course={courses[2]}
                  completed={completed}
                  onSelect={(id) => {
                    setSelected(id);
                    router.push("/course/algebra#" + id);
                  }}
                />
                <div className="map-footer">
                  <Sparkles size={16} /> Every concept opens a new possibility.
                </div>
              </div>
            </section>
            <section className="section">
              <div className="section-heading">
                <div className="eyebrow">ONE STEP CLOSER TO “I GET IT”</div>
                <h2>Where will curiosity take you?</h2>
                <p>Start where you are. There’s a path for you.</p>
              </div>
              <div className="grid three">
                {courses.slice(0, 3).map((c, i) => (
                  <Link
                    href={"/course/" + c.id}
                    key={c.id}
                    className={"course-card tint-" + i}
                  >
                    <span className="course-symbol">{["+", "½", "x²"][i]}</span>
                    <span className="badge">
                      {i === 2
                        ? "Grades 7–10"
                        : i === 1
                          ? "Grades 3–6"
                          : "Grades K–4"}
                    </span>
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                    <div className="card-bottom">
                      Explore learning path <ArrowUpRight size={19} />
                    </div>
                  </Link>
                ))}
              </div>
              <Link className="text-link centered" href="/learn">
                Browse all subjects and grades <ArrowRight size={16} />
              </Link>
            </section>
            <section className="feature-band">
              <div className="eyebrow">YOUR GOALS. YOUR PACE.</div>
              <h2>
                A strong foundation.
                <br />A brighter next chapter.
              </h2>
              <div className="grid three">
                <article>
                  <Compass />
                  <h3>See how it all connects</h3>
                  <p>
                    Explore branching skill trees. Review freely and build
                    mastery one concept at a time.
                  </p>
                </article>
                <article>
                  <Target />
                  <h3>Make SAT Math click</h3>
                  <p>
                    Original practice across all four domains, with explanations
                    that make sense.
                  </p>
                  <Link href="/sat">Meet your SAT toolkit →</Link>
                </article>
                <article>
                  <Users />
                  <h3>Learn better, together</h3>
                  <p>
                    Create classrooms, share assignments, and help every student
                    find their next step.
                  </p>
                  <Link href="/classrooms">Explore classrooms →</Link>
                </article>
              </div>
            </section>
          </>
        )}
        {path === "/learn" && (
          <>
            <PageHeading
              eyebrow="YOUR WORLD OF MATH"
              title="Find your next discovery."
              description="Browse by grade or subject. Every path draws from the same connected curriculum."
            />
            <div className="filters">
              <label>
                Grade
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="all">All grades</option>
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? "Kindergarten" : `Grade ${i}`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Subject
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="all">All subjects</option>
                  {[...new Set(courses.map((c) => c.subject))].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid three">
              {courses
                .filter(
                  (c) =>
                    (grade === "all" || c.grades.includes(Number(grade))) &&
                    (subject === "all" || c.subject === subject),
                )
                .map((c) => (
                  <article className="card" key={c.id}>
                    <span className="badge">
                      {c.planned ? "Planned" : "Ready to explore"}
                    </span>
                    <h2>{c.title}</h2>
                    <p>{c.description}</p>
                    <small>
                      {c.units.flatMap((u) => u.lessons).length} lessons
                    </small>
                    {!c.planned && (
                      <Link className="text-link" href={"/course/" + c.id}>
                        Open skill tree →
                      </Link>
                    )}
                  </article>
                ))}
            </div>
            <p className="muted">
              K–12 browsing is supported. Some grades have only planned courses
              while the curriculum grows.
            </p>
          </>
        )}
        {path.startsWith("/course/") &&
          (course && !course.planned ? (
            <>
              <PageHeading
                eyebrow="YOUR LEARNING PATH"
                title={course.title}
                description={course.description}
              />
              <div className="learning-layout">
                <section>
                  <div className="card tree-card">
                    <div className="map-caption">
                      <strong>Follow your curiosity</strong>
                      <span className="badge">
                        {
                          completed.filter((id) =>
                            course.units.some((u) =>
                              u.lessons.some((l) => l.id === id),
                            ),
                          ).length
                        }{" "}
                        / {course.units.flatMap((u) => u.lessons).length}{" "}
                        mastered
                      </span>
                    </div>
                    <SkillTree
                      course={course}
                      completed={completed}
                      onSelect={setSelected}
                    />
                  </div>
                  <p className="muted">
                    Lines show recommended prerequisites. You can explore every
                    lesson freely. Use the controls to zoom and pan.
                  </p>
                </section>
                <aside className="card">
                  <div className="eyebrow">YOUR NEXT SMALL STEP</div>
                  <h2>
                    {course.units.find(
                      (u) => u.id === (selected || path.split("#")[1]),
                    )?.title || "Choose a concept"}
                  </h2>
                  <p>Click a node, or choose a unit below.</p>
                  <div className="stack">
                    {course.units.map((u) => (
                      <details key={u.id} open={selected === u.id}>
                        <summary>{u.title}</summary>
                        {u.lessons.map((l) => (
                          <Link
                            className="lesson-link"
                            href={"/lesson/" + l.id}
                            key={l.id}
                          >
                            {completed.includes(l.id) ? "✓" : "○"} {l.title}
                            <ArrowRight size={16} />
                          </Link>
                        ))}
                      </details>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <PageHeading
              title="This path is still growing."
              description="Visit Explore to find available lessons."
            />
          ))}
        {path.startsWith("/lesson/") &&
          (activeLesson ? (
            <>
              <Link className="text-link" href="/learn">
                ← Back to learning paths
              </Link>
              <PageHeading
                eyebrow={
                  completed.includes(activeLesson.id)
                    ? "MASTERED · 50 XP EARNED"
                    : "ONE CONCEPT. A LITTLE PRACTICE."
                }
                title={activeLesson.title}
                description={activeLesson.explanation}
              />
              <div className="learning-layout">
                <Practice
                  key={activeLesson.id}
                  lesson={activeLesson}
                  onAttempt={(q, a, c) => attempt(activeLesson, q, a, c)}
                />
                <aside className="card">
                  <span className="eyebrow">LET’S WORK THROUGH ONE</span>
                  <h2>A worked example</h2>
                  <p className="example">{activeLesson.example}</p>
                  <p>Take your time. Hints and retries are always available.</p>
                  <p className="notice">
                    Answer every question correctly to master this lesson. XP is
                    awarded once.
                  </p>
                </aside>
              </div>
            </>
          ) : (
            <PageHeading
              title="Lesson not found"
              description="Choose an available lesson from Explore."
            />
          ))}
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
                  Try one lesson in each domain. Your weakest areas appear below
                  as you learn.
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
        {path === "/dashboard" && (
          <>
            <PageHeading
              eyebrow="EVERY SMALL STEP COUNTS"
              title="Welcome to your learning space."
              description="Pick up a new idea, revisit a familiar one, or see how far you’ve come."
            />
            <div className="grid three">
              <div className="card stat">
                <span>LESSONS MASTERED</span>
                <strong>{completed.length}</strong>
              </div>
              <div className="card stat">
                <span>EXPERIENCE</span>
                <strong>
                  {xp} <small>XP</small>
                </strong>
              </div>
              <div className="card stat">
                <span>YOUR LEVEL</span>
                <strong>{Math.floor(xp / 250) + 1}</strong>
                <progress value={xp % 250} max={250} />
              </div>
            </div>
            <div className="section-heading left">
              <h2>Your learning paths</h2>
            </div>
            <div className="grid three">
              {courses.slice(0, 3).map((c) => (
                <Link className="card" href={"/course/" + c.id} key={c.id}>
                  <ProgressCircle
                    value={
                      (100 *
                        c.units
                          .flatMap((u) => u.lessons)
                          .filter((l) => completed.includes(l.id)).length) /
                      c.units.flatMap((u) => u.lessons).length
                    }
                  />
                  <h3>{c.title}</h3>
                  <p>Continue learning →</p>
                </Link>
              ))}
            </div>
            <section className="card section">
              <h2>My Assignments</h2>
              {assignmentCards()}
            </section>
            <section className="card character">
              <span className="avatar">✦</span>
              <div>
                <h2>A little room to grow</h2>
                <p>
                  Your character placeholder. Cosmetic inventory and outfit
                  slots are prepared for a future version.
                </p>
                <span className="badge">Explorer · Free starter style</span>
              </div>
            </section>
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
                    className={demoRole === "student" ? "primary" : "secondary"}
                    onClick={() => setDemoRole("student")}
                  >
                    Student view
                  </button>
                  <button
                    className={demoRole === "teacher" ? "primary" : "secondary"}
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
                    <select name="course">
                      {courses
                        .filter((c) => !c.planned)
                        .map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button className="primary">Create classroom</button>
                </form>
                <form className="card stack" onSubmit={assign}>
                  <h2>Create an assignment</h2>
                  <label>
                    Classroom
                    <select name="classroom" required>
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
                  <label>
                    Lesson / practice set
                    <select name="lesson">
                      {allLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({l.questions.length} questions)
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Due date
                    <input type="date" name="due" />
                  </label>
                  <button
                    className="primary"
                    disabled={!state.classrooms.length}
                  >
                    Assign lesson
                  </button>
                  <small>
                    V1 assignments use each lesson’s full practice set. Unit
                    quizzes and configurable sets are planned.
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
                    maxLength={12}
                  />
                </label>
                <button className="primary">
                  Join classroom <ArrowRight size={16} />
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
                                      completed.includes(a.lesson),
                                  ).length + " lessons completed"}
                            </p>
                          ))
                        ) : (
                          <p>No students enrolled yet.</p>
                        )}
                        {user && <TeacherReport classroom={c.id} />}
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
                    The existing game remains separate. No game has been rebuilt
                    or connected.
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
        {path === "/account" && (
          <>
            <PageHeading
              eyebrow="YOUR LEARNING, CONNECTED"
              title="Keep your discoveries close."
              description="Guest learning is always available. Connected accounts save progress across devices."
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
                  Supabase is not configured. Accounts are unavailable; use the
                  guest learning experience.
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
          "/sat",
          "/dashboard",
          "/classrooms",
          "/games",
          "/account",
        ].includes(path) &&
          !path.startsWith("/course/") &&
          !path.startsWith("/lesson/") && (
            <PageHeading
              title="Let’s find your path."
              description="Use Explore to discover available lessons."
            />
          )}
      </main>
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
function TeacherReport({ classroom }: { classroom: string }) {
  const [rows, setRows] = useState<
      { student_id: string; lesson_id: string; completed_at: string | null }[]
    >([]),
    [error, setError] = useState("");
  useEffect(() => {
    backend
      ?.rpc("assignment_report", { p_classroom: classroom })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data || []);
      });
  }, [classroom]);
  return (
    <div>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        rows.map((r, i) => (
          <p key={i}>
            Learner {r.student_id.slice(0, 8)} ·{" "}
            {allLessons.find((l) => l.id === r.lesson_id)?.title} ·{" "}
            {r.completed_at ? "Completed" : "Not yet completed"}
          </p>
        ))
      )}
    </div>
  );
}
