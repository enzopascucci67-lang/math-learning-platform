import { emptyState, type DemoState } from "./store";
import type { LearningPreferences } from "./student-learning";

export type AccountData = { role: "student" | "teacher"; state: DemoState };
export type AccountIdentity = { user: string | null; generation: number };
export type AccountSnapshot = AccountData & {
  user: string | null;
  status: "checking" | "loading" | "ready" | "error";
  preferences: LearningPreferences;
  error: string | null;
};
export type AuthSource = {
  getUser: () => Promise<string | null>;
  subscribe: (callback: (user: string | null) => void) => () => void;
};
type Dependencies = {
  connected: boolean;
  load: (user: string) => Promise<AccountData>;
  readDemo: () => DemoState;
  writeDemo: (state: DemoState) => void;
  readPreferences: (user: string | null) => LearningPreferences;
  writePreferences: (user: string | null, value: LearningPreferences) => void;
};
const blankPreferences = (): LearningPreferences => ({
  grade: null,
  lastLesson: null,
  started: [],
  positions: {},
});

// Each mounted platform owns a controller. No account state is shared across requests.
export class AccountSession {
  private generation = 0;
  private request = 0;
  private active = true;
  private source: AuthSource | null = null;
  private listeners = new Set<() => void>();
  private snapshot: AccountSnapshot;

  constructor(private dependencies: Dependencies) {
    this.snapshot = this.blank(
      null,
      dependencies.connected ? "checking" : "ready",
    );
    if (!dependencies.connected) this.snapshot = this.guest();
  }
  private blank(
    user: string | null,
    status: AccountSnapshot["status"],
  ): AccountSnapshot {
    return {
      user,
      status,
      role: "student",
      state: structuredClone(emptyState),
      preferences: blankPreferences(),
      error: null,
    };
  }
  private guest(): AccountSnapshot {
    return {
      ...this.blank(null, "ready"),
      state: this.dependencies.readDemo(),
      preferences: this.dependencies.readPreferences(null),
    };
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(snapshot: AccountSnapshot) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
  capture(): AccountIdentity {
    return { user: this.snapshot.user, generation: this.generation };
  }
  isCurrent(identity: AccountIdentity) {
    return (
      this.active &&
      identity.generation === this.generation &&
      identity.user === this.snapshot.user
    );
  }
  requireReady(): AccountIdentity {
    if (!this.active || this.snapshot.status !== "ready")
      throw Error("Wait for your account to finish loading before saving.");
    return this.capture();
  }
  start(source: AuthSource) {
    this.active = true;
    this.source = source;
    this.generation++;
    this.request++;
    this.publish(this.blank(null, "checking"));
    const identity = this.capture();
    let subscribed = true;
    const unsubscribe = source.subscribe((user) => {
      if (subscribed) this.changeUser(user);
    });
    // Subscribe first so an initial auth event takes precedence over a slower getUser.
    void this.resolveUser(source, identity);
    return () => {
      subscribed = false;
      this.active = false;
      this.generation++;
      this.request++;
      unsubscribe();
    };
  }
  private async resolveUser(source: AuthSource, identity: AccountIdentity) {
    try {
      const user = await source.getUser();
      if (this.isCurrent(identity)) this.changeUser(user);
    } catch (error) {
      if (this.isCurrent(identity)) this.fail(error);
    }
  }
  private changeUser(user: string | null) {
    if (!this.active) return;
    if (
      this.snapshot.user === user &&
      (this.snapshot.status === "ready" || this.snapshot.status === "loading")
    )
      return;
    this.generation++;
    this.request++;
    if (!user) {
      this.publish(this.guest());
      return;
    }
    this.publish(this.blank(user, "loading"));
    const identity = this.capture();
    // Do not call Supabase data methods inside its synchronous auth callback.
    void Promise.resolve()
      .then(() => this.refresh(identity))
      .catch(() => {});
  }
  private fail(error: unknown) {
    this.publish({
      ...this.blank(this.snapshot.user, "error"),
      error:
        error instanceof Error
          ? error.message
          : "Your account could not load. Please try again.",
    });
  }
  retry = () => {
    if (!this.source || !this.active) return;
    this.generation++;
    this.request++;
    this.publish(this.blank(null, "checking"));
    void this.resolveUser(this.source, this.capture());
  };
  async refresh(identity: AccountIdentity): Promise<boolean> {
    if (!identity.user || !this.isCurrent(identity)) return false;
    const request = ++this.request;
    try {
      const data = await this.dependencies.load(identity.user);
      if (!this.isCurrent(identity) || request !== this.request) return false;
      this.publish({
        ...data,
        user: identity.user,
        status: "ready",
        preferences:
          this.snapshot.status === "ready"
            ? this.snapshot.preferences
            : this.dependencies.readPreferences(identity.user),
        error: null,
      });
      return true;
    } catch (error) {
      if (!this.isCurrent(identity) || request !== this.request) return false;
      this.fail(error);
      throw error;
    }
  }
  saveDemo(state: DemoState, identity: AccountIdentity) {
    if (
      !this.isCurrent(identity) ||
      identity.user !== null ||
      this.snapshot.status !== "ready"
    )
      throw Error("Your account changed. Please try again.");
    this.dependencies.writeDemo(state);
    this.publish({ ...this.snapshot, state });
  }
  savePreferences(value: LearningPreferences, identity: AccountIdentity) {
    if (!this.isCurrent(identity) || this.snapshot.status !== "ready")
      throw Error("Your account changed. Please try again.");
    this.dependencies.writePreferences(identity.user, value);
    this.publish({ ...this.snapshot, preferences: value });
  }
}
