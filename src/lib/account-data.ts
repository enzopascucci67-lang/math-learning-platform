import type { SupabaseClient } from "@supabase/supabase-js";
import { emptyState } from "./store";
import type { AccountData } from "./account-session";
import { normalizeOutfit } from "./cosmetics";

export async function loadAccount(
  client: SupabaseClient,
  id: string,
): Promise<AccountData> {
  const [profile, progress, rooms, assignments, inventory] = await Promise.all([
    client.from("profiles").select("role").eq("id", id).single(),
    client
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", id)
      .order("completed_at", { ascending: true })
      .order("lesson_id", { ascending: true }),
    client.rpc("classroom_overview"),
    client.from("assignments").select("*"),
    client.rpc("character_inventory"),
  ]);
  const error =
    profile.error ||
    progress.error ||
    rooms.error ||
    assignments.error ||
    inventory.error;
  if (error) throw Error(error.message);
  if (profile.data.role !== "student" && profile.data.role !== "teacher")
    throw Error("Your account role could not be verified.");
  return {
    role: profile.data.role,
    state: {
      ...structuredClone(emptyState),
      outfit: normalizeOutfit(
        inventory.data?.outfit,
        inventory.data?.unlocked || [],
      ),
      unlockedCosmetics: inventory.data?.unlocked || [],
      completed: progress.data.map((item) => item.lesson_id),
      classrooms: rooms.data || [],
      assignments: assignments.data.map((item) => ({
        id: item.id,
        classroom: item.classroom_id,
        lesson: item.lesson_id,
        additionalLessons: item.additional_lesson_ids,
        due: item.due_at || "",
        title: item.title,
      })),
    },
  };
}
