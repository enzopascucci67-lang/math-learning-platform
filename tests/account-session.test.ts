import { test } from "node:test";
import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import {
  AccountSession,
  type AccountData,
  type AuthSource,
} from "../src/lib/account-session";
import { emptyState } from "../src/lib/store";
import type { LearningPreferences } from "../src/lib/student-learning";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const preferences = (grade: number | null): LearningPreferences => ({
  grade,
  lastLesson: null,
  started: [],
  positions: {},
});
const accountData = (
  lesson: string,
  role: "student" | "teacher" = "student",
): AccountData => ({
  role,
  state: { ...structuredClone(emptyState), completed: [lesson] },
});
function setup(connected = true) {
  const initial = deferred<string | null>();
  const loads: {
    user: string;
    result: ReturnType<typeof deferred<AccountData>>;
  }[] = [];
  const demoWrites: string[][] = [];
  const preferenceWrites: (string | null)[] = [];
  let emit: (user: string | null) => void = () => {};
  const source: AuthSource = {
    getUser: () => initial.promise,
    subscribe: (callback) => {
      emit = callback;
      return () => {};
    },
  };
  const session = new AccountSession({
    connected,
    load: (user) => {
      const result = deferred<AccountData>();
      loads.push({ user, result });
      return result.promise;
    },
    readDemo: () => ({
      ...structuredClone(emptyState),
      completed: ["guest-only"],
    }),
    writeDemo: (state) => {
      demoWrites.push(state.completed);
    },
    readPreferences: (user) => preferences(user ? 9 : 3),
    writePreferences: (user) => {
      preferenceWrites.push(user);
    },
  });
  return {
    session,
    initial,
    loads,
    source,
    emit: (user: string | null) => emit(user),
    demoWrites,
    preferenceWrites,
  };
}

test("guest mode preserves demo data and saves without connecting an account", () => {
  const h = setup(false);
  assert.equal(h.session.getSnapshot().status, "ready");
  assert.deepEqual(h.session.getSnapshot().state.completed, ["guest-only"]);
  const identity = h.session.requireReady();
  h.session.saveDemo(accountData("addition").state, identity);
  h.session.savePreferences(preferences(4), identity);
  assert.deepEqual(h.demoWrites, [["addition"]]);
  assert.deepEqual(h.preferenceWrites, [null]);
  assert.equal(h.session.getSnapshot().preferences.grade, 4);
});

test("connected startup and account loading never expose guest data or permit writes", async () => {
  const h = setup();
  assert.deepEqual(h.session.getSnapshot().state.completed, []);
  assert.throws(() => h.session.requireReady(), /finish loading/);
  const stop = h.session.start(h.source);
  h.initial.resolve("student-a");
  await setImmediate();
  assert.equal(h.session.getSnapshot().status, "loading");
  assert.throws(
    () => h.session.saveDemo(accountData("bad").state, h.session.capture()),
    /account changed/,
  );
  h.loads[0].result.resolve(accountData("addition"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().status, "ready");
  assert.equal(h.session.getSnapshot().preferences.grade, 9);
  assert.deepEqual(h.demoWrites, []);
  stop();
});

test("switching teacher to student clears old data and ignores delayed teacher results", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("teacher-a");
  await setImmediate();
  h.loads[0].result.resolve(accountData("teacher-lesson", "teacher"));
  await setImmediate();
  const teacher = h.session.requireReady();
  const refresh = h.session.refresh(teacher);
  h.emit("student-b");
  assert.deepEqual(h.session.getSnapshot().state.completed, []);
  assert.equal(h.session.getSnapshot().role, "student");
  assert.throws(() => h.session.requireReady(), /finish loading/);
  assert.throws(
    () => h.session.savePreferences(preferences(12), teacher),
    /account changed/,
  );
  await setImmediate();
  h.loads[2].result.resolve(accountData("student-lesson"));
  await setImmediate();
  h.loads[1].result.resolve(accountData("stale-teacher-lesson", "teacher"));
  assert.equal(await refresh, false);
  assert.equal(h.session.getSnapshot().user, "student-b");
  assert.deepEqual(h.session.getSnapshot().state.completed, ["student-lesson"]);
  assert.deepEqual(h.preferenceWrites, []);
  stop();
});

test("sign-out restores the guest and rejects pending account results and writes", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("student-a");
  await setImmediate();
  const old = h.session.capture();
  h.emit(null);
  assert.equal(h.session.getSnapshot().status, "ready");
  assert.equal(h.session.getSnapshot().preferences.grade, 3);
  h.loads[0].result.resolve(accountData("account-only"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().user, null);
  assert.deepEqual(h.session.getSnapshot().state.completed, ["guest-only"]);
  assert.throws(
    () => h.session.savePreferences(preferences(12), old),
    /account changed/,
  );
  assert.equal(await h.session.refresh(old), false);
  stop();
});

test("an initial identity response cannot override a newer auth event", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("student-b");
  h.initial.resolve("student-a");
  await setImmediate();
  assert.deepEqual(
    h.loads.map((load) => load.user),
    ["student-b"],
  );
  h.loads[0].result.resolve(accountData("b"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().user, "student-b");
  stop();
});

test("latest refresh wins, preserves preference edits, and ignores outdated failures", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("student-a");
  await setImmediate();
  h.loads[0].result.resolve(accountData("first"));
  await setImmediate();
  const identity = h.session.requireReady();
  const older = h.session.refresh(identity);
  const newer = h.session.refresh(identity);
  h.session.savePreferences(preferences(10), identity);
  h.loads[2].result.resolve(accountData("latest"));
  assert.equal(await newer, true);
  h.loads[1].result.reject(Error("Old request failed"));
  assert.equal(await older, false);
  assert.deepEqual(h.session.getSnapshot().state.completed, ["latest"]);
  assert.equal(h.session.getSnapshot().preferences.grade, 10);
  stop();
});

test("load failure stays closed and retry rechecks identity before recovering", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.initial.resolve("student-a");
  await setImmediate();
  h.loads[0].result.reject(Error("Database unavailable"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().status, "error");
  assert.equal(h.session.getSnapshot().error, "Database unavailable");
  assert.deepEqual(h.session.getSnapshot().state.completed, []);
  assert.throws(() => h.session.requireReady(), /finish loading/);
  h.session.retry();
  await setImmediate();
  h.loads[1].result.resolve(accountData("recovered"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().status, "ready");
  assert.deepEqual(h.session.getSnapshot().state.completed, ["recovered"]);
  stop();
});

test("authentication failure does not silently enable guest writes", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.initial.reject(Error("Cannot verify session"));
  await setImmediate();
  assert.equal(h.session.getSnapshot().status, "error");
  assert.throws(() => h.session.requireReady());
  assert.deepEqual(h.demoWrites, []);
  stop();
});

test("cleanup invalidates pending responses and callbacks, including after restart", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("student-a");
  await setImmediate();
  const oldIdentity = h.session.capture();
  // Capture the old callback itself, since a restarted source replaces the harness emitter.
  let staleCallback: ((user: string | null) => void) | undefined;
  const source: AuthSource = {
    getUser: () => new Promise(() => {}),
    subscribe: (callback) => {
      staleCallback = callback;
      return () => {};
    },
  };
  stop();
  assert.equal(h.session.isCurrent(oldIdentity), false);
  h.loads[0].result.resolve(accountData("stale"));
  await setImmediate();
  assert.deepEqual(h.session.getSnapshot().state.completed, []);
  const stopAgain = h.session.start(source);
  stopAgain();
  const stopThird = h.session.start(h.source);
  staleCallback?.("old-teacher");
  assert.equal(h.session.getSnapshot().user, null);
  h.emit("student-b");
  await setImmediate();
  assert.equal(h.session.getSnapshot().user, "student-b");
  stopThird();
});

test("token refresh keeps ready data but returning to the same account invalidates old work", async () => {
  const h = setup();
  const stop = h.session.start(h.source);
  h.emit("student-a");
  await setImmediate();
  h.loads[0].result.resolve(accountData("first"));
  await setImmediate();
  const original = h.session.requireReady();
  h.emit("student-a");
  assert.equal(h.session.getSnapshot().status, "ready");
  assert.equal(h.loads.length, 1);
  assert.equal(h.session.isCurrent(original), true);
  h.emit(null);
  h.emit("student-a");
  await setImmediate();
  h.loads[1].result.resolve(accountData("second"));
  await setImmediate();
  assert.equal(h.session.isCurrent(original), false);
  assert.throws(
    () => h.session.savePreferences(preferences(12), original),
    /account changed/,
  );
  assert.deepEqual(h.session.getSnapshot().state.completed, ["second"]);
  stop();
});
