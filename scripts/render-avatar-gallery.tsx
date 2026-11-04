/* eslint-disable @next/next/no-head-element -- Standalone static QA document, not a Next route. */
// Temporary local visual-QA page. It grants no inventory and changes no saves.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { CharacterPreview } from "../src/components/character-preview";
import { ClothingIcon } from "../src/components/clothing-icon";
import { AtlasPawn } from "../src/components/path-rewards";
import { cosmeticItems } from "../src/lib/cosmetics";
const looks = [
  { name: "Sky shirt", outfit: { body: "starter-shirt" } },
  {
    name: "Explorer",
    outfit: {
      body: "starter-shirt",
      head: "explorer-cap",
      accessory: "star-badge",
    },
  },
  {
    name: "Forest hoodie",
    outfit: { body: "forest-hoodie", accessory: "scholar-scarf" },
  },
  { name: "Crown", outfit: { body: "forest-hoodie", head: "star-crown" } },
  {
    name: "Sunset + beanie",
    outfit: { body: "sunset-sweater", head: "stargazer-beanie" },
  },
  {
    name: "Explorer satchel",
    outfit: {
      body: "sunset-sweater",
      head: "explorer-cap",
      accessory: "explorer-satchel",
    },
  },
];
const markup = renderToStaticMarkup(
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <title>Math Atlas · Artwork quality check</title>
      <style>{`*{box-sizing:border-box}body{margin:0;padding:32px;background:#f2f7fc;color:#203652;font:16px 'Trebuchet MS',sans-serif}h1{margin-top:0}.looks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.look{padding:20px;background:white;border:2px solid #dce6ef;border-radius:24px;text-align:center}.character-preview{width:220px;max-width:100%;height:260px;display:block;margin:auto}.icons{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.icons figure{width:115px;text-align:center;margin:0;padding:10px;background:white;border-radius:18px}.clothing-icon{width:80px;height:80px}.icons figcaption{font-size:12px}.atlas-pawn{width:70px;height:90px}.look:last-child{background:#203652;color:white}@media(max-width:700px){.looks{grid-template-columns:repeat(2,minmax(0,1fr))}}`}</style>
    </head>
    <body>
      <h1>Math Atlas · Character & clothing study</h1>
      <p>Art previews only. The app still requires earned rewards.</p>
      <div className="looks">
        {looks.map(({ name, outfit }) => (
          <article className="look" key={name}>
            <CharacterPreview outfit={outfit} />
            <h2>{name}</h2>
          </article>
        ))}
      </div>
      <div className="icons">
        {cosmeticItems.map((item) => (
          <figure key={item.id}>
            <ClothingIcon slot={item.slot} itemId={item.id} />
            <figcaption>{item.name}</figcaption>
          </figure>
        ))}
        <figure>
          <AtlasPawn />
          <figcaption>Atlas pawn</figcaption>
        </figure>
      </div>
    </body>
  </html>,
);
mkdirSync("public", { recursive: true });
mkdirSync("verification", { recursive: true });
writeFileSync("public/avatar-quality-check.html", "<!doctype html>" + markup);
writeFileSync("verification/avatar-gallery.html", "<!doctype html>" + markup);
