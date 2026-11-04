import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { cosmeticItems } from "../src/lib/cosmetics";
import { allLessons, type Lesson } from "../src/lib/curriculum";

test("cosmetic migrations enforce unlocks and account isolation in PostgreSQL", async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  t.after(() => db.close());
  const alice = "00000000-0000-4000-8000-000000000001";
  const bob = "00000000-0000-4000-8000-000000000002";
  // Supabase supplies these roles, users and JWT identity in production.
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
  `);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/001_foundation.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(
    await readFile(new URL("../supabase/seed.sql", import.meta.url), "utf8"),
  );
  await db.query("insert into auth.users values ($1), ($2)", [alice, bob]);
  async function signIn(user: string) {
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      user,
    ]);
  }
  async function finish(lesson: Lesson) {
    for (const question of lesson.questions) {
      const result = await db.query<{ correct: boolean }>(
        "select public.submit_answer($1, $2, $3) as correct",
        [lesson.id, question.id, question.answer],
      );
      assert.equal(result.rows[0].correct, true);
    }
  }
  async function inventory() {
    const result = await db.query<{
      inventory: { outfit: Record<string, string>; unlocked: string[] };
    }>("select public.character_inventory() as inventory");
    return result.rows[0].inventory;
  }
  await signIn(alice);
  await finish(allLessons[0]);
  await db.exec("reset role");
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/002_cosmetic_rewards.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );

  await t.test(
    "database catalog matches the app's stable IDs, slots and thresholds",
    async () => {
      await db.exec(
        await readFile(
          new URL(
            "../supabase/migrations/005_more_clothing.sql",
            import.meta.url,
          ),
          "utf8",
        ),
      );
      const catalog = await db.query(
        "select id, slot, required_lessons from public.cosmetic_catalog order by id",
      );
      assert.deepEqual(
        catalog.rows,
        cosmeticItems
          .map((item) => ({
            id: item.id,
            slot: item.slot,
            required_lessons: item.lessons,
          }))
          .sort((a, b) => a.id.localeCompare(b.id)),
      );
    },
  );
  await t.test(
    "anonymous callers cannot access inventory or equip clothing",
    async () => {
      await db.exec("set role anon");
      await assert.rejects(
        db.query("select public.character_inventory()"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select public.equip_cosmetic('head', 'star-crown')"),
        /permission denied/,
      );
    },
  );
  await t.test(
    "authenticated callers cannot forge unlocks, catalog entries or profiles",
    async () => {
      await signIn(bob);
      await assert.rejects(
        db.query(
          "insert into public.cosmetic_unlocks(user_id, item_id) values ($1, 'star-crown')",
          [bob],
        ),
        /permission denied/,
      );
      await assert.rejects(
        db.query(
          'update public.profiles set outfit = \'{"head":"star-crown"}\' where id = $1',
          [bob],
        ),
        /permission denied/,
      );
      await assert.rejects(
        db.query("update public.cosmetic_catalog set required_lessons = 0"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select public.grant_earned_cosmetics($1)", [alice]),
        /permission denied/,
      );
    },
  );
  await t.test(
    "starter inventory rejects locked, unknown and wrong-slot items",
    async () => {
      await signIn(bob);
      assert.deepEqual((await inventory()).unlocked, ["starter-shirt"]);
      for (const [slot, item] of [
        ["head", "star-crown"],
        ["head", "starter-shirt"],
        ["head", "unknown"],
        ["body", "forest-hoodie"],
      ]) {
        await assert.rejects(
          db.query("select public.equip_cosmetic($1, $2)", [slot, item]),
          /not unlocked/,
        );
      }
      await assert.rejects(
        db.query("select public.equip_cosmetic('role', null)"),
        /Invalid clothing slot/,
      );
      await db.query("select public.equip_cosmetic('body', 'starter-shirt')");
      assert.equal((await inventory()).outfit.body, "starter-shirt");
    },
  );
  await t.test("existing progress backfills rewards idempotently", async () => {
    await signIn(alice);
    const expected = ["explorer-cap", "star-badge", "starter-shirt"];
    assert.deepEqual((await inventory()).unlocked, expected);
    assert.deepEqual((await inventory()).unlocked, expected);
    await finish(allLessons[0]);
    assert.deepEqual((await inventory()).unlocked, expected);
    const xp = await db.query<{ count: number }>(
      "select count(*)::int as count from public.xp_events",
    );
    assert.equal(xp.rows[0].count, 1);
  });
  await t.test(
    "verified completion triggers rewards; equipping and removal persist",
    async () => {
      await signIn(alice);
      const unfinished = allLessons[1];
      await db.query("select public.submit_answer($1, $2, 'wrong')", [
        unfinished.id,
        unfinished.questions[0].id,
      ]);
      await db.query("select public.submit_answer($1, $2, $3)", [
        unfinished.id,
        unfinished.questions[0].id,
        unfinished.questions[0].answer,
      ]);
      assert.equal(
        (await inventory()).unlocked.includes("forest-hoodie"),
        false,
      );
      await finish(allLessons[1]);
      await finish(allLessons[2]);
      // Read the trigger's output before inventory's backfill can run.
      const triggerReward = await db.query(
        "select item_id from public.cosmetic_unlocks where item_id = 'forest-hoodie'",
      );
      assert.equal(triggerReward.rows.length, 1);
      await db.query("select public.equip_cosmetic('body', 'forest-hoodie')");
      await db.query("select public.equip_cosmetic('head', 'explorer-cap')");
      assert.deepEqual((await inventory()).outfit, {
        body: "forest-hoodie",
        head: "explorer-cap",
      });
      await db.query("select public.equip_cosmetic('head', null)");
      assert.deepEqual((await inventory()).outfit, { body: "forest-hoodie" });
      await db.query("select public.equip_cosmetic('body', null)");
      assert.deepEqual((await inventory()).outfit, { body: "starter-shirt" });
    },
  );
  await t.test(
    "another learner cannot read or equip the first learner's earned clothing",
    async () => {
      await signIn(bob);
      assert.deepEqual((await inventory()).unlocked, ["starter-shirt"]);
      const visible = await db.query(
        "select id from public.profiles where id = $1",
        [alice],
      );
      assert.equal(visible.rows.length, 0);
      const unlocks = await db.query(
        "select item_id from public.cosmetic_unlocks where user_id = $1",
        [alice],
      );
      assert.equal(unlocks.rows.length, 0);
      await assert.rejects(
        db.query("select public.equip_cosmetic('body', 'forest-hoodie')"),
        /not unlocked/,
      );
    },
  );
  await t.test(
    "five and ten completed lessons unlock the higher milestone rewards",
    async () => {
      await signIn(alice);
      for (const lesson of allLessons.slice(3, 5)) await finish(lesson);
      assert.equal(
        (await inventory()).unlocked.includes("scholar-scarf"),
        true,
      );
      assert.equal((await inventory()).unlocked.includes("star-crown"), false);
      for (const lesson of allLessons.slice(5, 10)) await finish(lesson);
      assert.equal((await inventory()).unlocked.includes("star-crown"), true);
      await db.query("select public.equip_cosmetic('head', 'star-crown')");
      assert.equal((await inventory()).outfit.head, "star-crown");
    },
  );
  await t.test(
    "later clothing milestones remain locked until verified progress earns them",
    async () => {
      await signIn(alice);
      for (const lesson of allLessons.slice(10, 15)) await finish(lesson);
      assert.ok((await inventory()).unlocked.includes("sunset-sweater"));
      assert.equal(
        (await inventory()).unlocked.includes("stargazer-beanie"),
        false,
      );
      await db.query("select public.equip_cosmetic('body','sunset-sweater')");
      for (const lesson of allLessons.slice(15, 20)) await finish(lesson);
      assert.ok((await inventory()).unlocked.includes("stargazer-beanie"));
      assert.equal(
        (await inventory()).unlocked.includes("explorer-satchel"),
        false,
      );
      await db.query("select public.equip_cosmetic('head','stargazer-beanie')");
      for (const lesson of allLessons.slice(20, 30)) await finish(lesson);
      assert.ok((await inventory()).unlocked.includes("explorer-satchel"));
      await db.query(
        "select public.equip_cosmetic('accessory','explorer-satchel')",
      );
      assert.deepEqual((await inventory()).outfit, {
        body: "sunset-sweater",
        head: "stargazer-beanie",
        accessory: "explorer-satchel",
      });
    },
  );
});
