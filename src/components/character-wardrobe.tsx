"use client";
import { useState } from "react";
import { CharacterPreview } from "./character-preview";
import { ClothingIcon } from "./clothing-icon";
import { Check, LockKeyhole } from "lucide-react";
import type { Outfit } from "@/lib/curriculum";
import { cosmeticItems, type OutfitSlot } from "@/lib/cosmetics";

export { CharacterPreview } from "./character-preview";

const slots: { id: OutfitSlot; name: string }[] = [
  { id: "body", name: "Clothing" },
  { id: "head", name: "Hats" },
  { id: "accessory", name: "Accessories" },
];
export function CharacterWardrobe({
  outfit,
  unlocked,
  onEquip,
}: {
  outfit: Outfit;
  unlocked: string[];
  onEquip: (slot: OutfitSlot, item: string | null) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function equip(slot: OutfitSlot, item: string | null) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onEquip(slot, item);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save your outfit. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="profile-section wardrobe"
      aria-labelledby="wardrobe-title"
    >
      <h2 id="wardrobe-title">My character</h2>
      <p>
        Make your character your own. Finish lessons to earn new clothing—your
        rewards stay unlocked.
      </p>
      <div className="wardrobe-layout">
        <div className="character-stage">
          <CharacterPreview outfit={outfit} />
          <p className="character-stage-caption">
            Ready for your next adventure.
          </p>
        </div>
        <div>
          {slots.map((slot) => (
            <fieldset key={slot.id} disabled={busy}>
              <legend>{slot.name}</legend>
              <div className="wardrobe-items">
                {cosmeticItems
                  .filter((item) => item.slot === slot.id)
                  .map((item) => {
                    const available = unlocked.includes(item.id);
                    const wearing = outfit[item.slot] === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`wardrobe-item ${wearing ? "wearing" : ""}`}
                        aria-pressed={wearing}
                        disabled={!available || busy}
                        onClick={() => void equip(slot.id, item.id)}
                      >
                        <ClothingIcon slot={item.slot} itemId={item.id} />
                        <strong>{item.name}</strong>
                        <span>
                          {wearing ? (
                            <>
                              <Check size={15} aria-hidden="true" /> Wearing
                            </>
                          ) : available ? (
                            "Wear this"
                          ) : (
                            <>
                              <LockKeyhole size={14} aria-hidden="true" />{" "}
                              {item.lessons} finished lessons
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })}
                {slot.id !== "body" && (
                  <button
                    type="button"
                    className="wardrobe-item"
                    aria-pressed={!outfit[slot.id]}
                    onClick={() => void equip(slot.id, null)}
                    disabled={busy}
                  >
                    <strong>None</strong>
                    <span>{!outfit[slot.id] ? "Selected ✓" : "Remove"}</span>
                  </button>
                )}
              </div>
            </fieldset>
          ))}
          <div role="status">{busy ? "Saving your outfit…" : ""}</div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
