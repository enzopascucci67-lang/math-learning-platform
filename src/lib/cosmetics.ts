import { allLessons, type Outfit } from "./curriculum";

export type OutfitSlot = "head" | "body" | "accessory";
export const cosmeticItems = [
  { id: "starter-shirt", name: "Sky shirt", slot: "body", lessons: 0 },
  { id: "explorer-cap", name: "Explorer cap", slot: "head", lessons: 1 },
  { id: "star-badge", name: "First star badge", slot: "accessory", lessons: 1 },
  { id: "forest-hoodie", name: "Forest hoodie", slot: "body", lessons: 3 },
  { id: "scholar-scarf", name: "Scholar scarf", slot: "accessory", lessons: 5 },
  { id: "star-crown", name: "Star crown", slot: "head", lessons: 10 },
  { id: "sunset-sweater", name: "Sunset sweater", slot: "body", lessons: 15 },
  {
    id: "stargazer-beanie",
    name: "Stargazer beanie",
    slot: "head",
    lessons: 20,
  },
  {
    id: "explorer-satchel",
    name: "Explorer satchel",
    slot: "accessory",
    lessons: 30,
  },
] as const;
export const starterOutfit: Outfit = { body: "starter-shirt" };
export function unlockedItems(completed: string[]): string[] {
  const known = new Set(allLessons.map((lesson) => lesson.id));
  const count = new Set(completed.filter((id) => known.has(id))).size;
  return cosmeticItems
    .filter((item) => item.lessons <= count)
    .map((item) => item.id);
}
export function normalizeOutfit(value: unknown, unlocked: string[]): Outfit {
  const outfit: Outfit = { ...starterOutfit };
  if (!value || typeof value !== "object") return outfit;
  for (const item of cosmeticItems) {
    if (
      (value as Record<string, unknown>)[item.slot] === item.id &&
      unlocked.includes(item.id)
    )
      outfit[item.slot] = item.id;
  }
  return outfit;
}
export function changeOutfit(
  current: unknown,
  unlocked: string[],
  slot: OutfitSlot,
  id: string | null,
): Outfit {
  const outfit = normalizeOutfit(current, unlocked);
  if (id === null) {
    delete outfit[slot];
    return { ...starterOutfit, ...outfit };
  }
  const item = cosmeticItems.find((item) => item.id === id);
  if (!item || item.slot !== slot)
    throw Error("Choose clothing for the correct slot.");
  if (!unlocked.includes(id))
    throw Error("Complete more lessons to unlock this item.");
  return { ...outfit, [slot]: id };
}
