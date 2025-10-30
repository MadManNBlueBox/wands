#!/usr/bin/env node
/**
 * make-ingredient-items.js
 * ------------------------------------------------------------
 * Generate Foundry v13 / dnd5e v3 ingredient Items AND per-year
 * "Potion Book" Items from a normalized potion-recipes.json.
 *
 * - Scans ./packs-json/items-wands for existing Potion Items to pull
 *   UUIDs and rarities.
 * - Ingredient rarity = least rare among potions it appears in.
 * - Ingredient price  = PRICE_BY_RARITY[rarity] (in gp).
 * - Deterministic IDs for:
 *     • Ingredients
 *     • "Ingredients" Folder
 *     • "Potion Books" Folder
 *     • Each Potion Book item
 * - Cross-references:
 *     • Ingredient descriptions list “Used in:” with @UUID links to potions.
 *     • Potion Books list each potion with @UUID, and its ingredients
 *       with @UUID to the ingredient items (plus quantities).
 * - Writes `_key` for **all** generated docs so Foundry preserves IDs.
 *
 * Usage:
 *   node scripts/make-ingredient-items.js ./potion-recipes.json ./packs-json/items-wands
 *
 * Then pack:
 *   fvtt package pack "items-wands" --inputDirectory "./packs-json/items-wands"
 * ------------------------------------------------------------
 */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { createHash } = require("crypto");

// ---------- CONFIG -----------------------------------------------------------

const PACKS_JSON_DIR = path.resolve("packs-json");
const POTIONS_PACK_DIR = path.join(PACKS_JSON_DIR, "items-wands");

const MODULE_SCOPE = "wands";
const PACK_KEY = "items-wands"; // same pack for potions, ingredients, and books

const DEFAULT_INGREDIENT_IMG = "icons/commodities/materials/herb-bundle-green.webp";
const DEFAULT_BOOK_IMG = "modules/wands/assets/parchment.webp";

const PRICE_BY_RARITY = {
  common: 0.5,
  uncommon: 2.5,
  rare: 25,
  "very rare": 125,
  legendary: 625,
  artifact: 3125
};

const RARITY_ORDER = ["common", "uncommon", "rare", "very rare", "legendary", "artifact"];
const RARITY_RANK = Object.fromEntries(RARITY_ORDER.map((r, i) => [r, i]));

const ING_FOLDER_NAME = "Ingredients";
const BOOKS_FOLDER_NAME = "Potion Books";

// ---------- CLI --------------------------------------------------------------

function usage() {
  console.log("Usage: node scripts/make-ingredient-items.js <potion-recipes.json> <output-dir>");
  process.exit(1);
}

if (process.argv.length < 4) usage();
const RECIPES_PATH = path.resolve(process.argv[2]);
const OUT_DIR = path.resolve(process.argv[3]);

// ---------- HELPERS ----------------------------------------------------------

function deterministicIdFrom(prefix, name) {
  const hex = createHash("sha1").update(`${prefix}:${name}`).digest("hex");
  return hex.slice(0, 16); // 16-char hex; valid Foundry ID
}
const ingredientId = (name) => deterministicIdFrom("ingredient", name);
const folderId = (name) => deterministicIdFrom("folder", name);
const bookId = (name) => deterministicIdFrom("book", name);

function sanitizeFilename(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-_. ]/gu, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeRarity(r) {
  const v = String(r || "").trim().toLowerCase();
  return RARITY_RANK.hasOwnProperty(v) ? v : "common";
}

function minRarity(rarities) {
  if (!rarities?.length) return "common";
  let min = "artifact";
  let minRank = RARITY_RANK[min];
  for (const r of rarities) {
    const rr = normalizeRarity(r);
    const rank = RARITY_RANK[rr];
    if (rank < minRank) { minRank = rank; min = rr; }
  }
  return min;
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

function isFolderDoc(obj) {
  return obj && typeof obj === "object" && String(obj._key || "").startsWith("!folders!");
}

async function findExistingFolder(outDir, name) {
  let files = [];
  try { files = (await fsp.readdir(outDir)).filter(f => f.toLowerCase().endsWith(".json")); }
  catch { return null; }

  for (const f of files) {
    try {
      const obj = JSON.parse(await fsp.readFile(path.join(outDir, f), "utf8"));
      if (isFolderDoc(obj) && obj.type === "Item" && String(obj.name).toLowerCase() === name.toLowerCase()) {
        return obj._id;
      }
    } catch { /* ignore */ }
  }
  return null;
}

async function ensureFolder(outDir, name) {
  const existing = await findExistingFolder(outDir, name);
  if (existing) return existing;

  const id = folderId(name);
  const folder = {
    name,
    sorting: "a",
    folder: null,
    type: "Item",
    _id: id,
    sort: 0,
    color: null,
    flags: {},
    _key: `!folders!${id}`
  };
  const fname = `${name.replace(/\s+/g, "_")}_${id}.json`;
  await fsp.writeFile(path.join(outDir, fname), JSON.stringify(folder, null, 2), "utf8");
  return id;
}

async function loadPotionIndex() {
  const idx = new Map();
  let files = [];
  try {
    files = (await fsp.readdir(POTIONS_PACK_DIR)).filter(f => f.toLowerCase().endsWith(".json"));
  } catch {
    console.warn(`[warn] Could not read ${POTIONS_PACK_DIR}. Did you unpack the "items-wands" pack?`);
    return idx;
  }

  for (const file of files) {
    const full = path.join(POTIONS_PACK_DIR, file);
    try {
      const obj = JSON.parse(await fsp.readFile(full, "utf8"));
      const isPotion =
        obj?.type === "consumable" &&
        (obj?.system?.type?.value === "potion" || /potion/i.test(obj?.name ?? ""));
      if (!isPotion) continue;

      const name = String(obj.name || "").trim();
      const id = String(obj._id || "").trim();
      const rarity = normalizeRarity(obj?.system?.rarity);
      if (name && id) {
        idx.set(name.toLowerCase(), { id, name, rarity });
      }
    } catch (e) {
      console.warn(`[warn] Skipping invalid JSON: ${file} (${e.message})`);
    }
  }
  return idx;
}

function invertRecipesToIngredientUse(recipes, potionIndex) {
  const map = new Map();

  for (const year of Object.keys(recipes)) {
    const potions = recipes[year] || {};
    for (const potionName of Object.keys(potions)) {
      const ingList = potions[potionName] || [];
      const pot = potionIndex.get(potionName.toLowerCase());
      const rarity = pot ? pot.rarity : "common";
      const uuidMarkup = pot
        ? `@UUID[Compendium.${MODULE_SCOPE}.${PACK_KEY}.Item.${pot.id}]{${pot.name}}`
        : potionName; // fallback if not found

      for (const ing of ingList) {
        const ingName = String(ing?.name || "").trim();
        if (!ingName) continue;
        if (!map.has(ingName)) map.set(ingName, { uses: [] });
        map.get(ingName).uses.push({ potionName, uuidMarkup, rarity });
      }
    }
  }

  // Dedup and compute min rarity per ingredient
  for (const [ing, data] of map.entries()) {
    const seen = new Set();
    const uniqueUses = [];
    const rarities = [];
    for (const u of data.uses) {
      const key = u.potionName.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueUses.push(u);
      rarities.push(u.rarity);
    }
    uniqueUses.sort((a, b) => a.potionName.localeCompare(b.potionName, undefined, { numeric: true }));
    map.set(ing, { uses: uniqueUses, rarity: minRarity(rarities) });
  }
  return map;
}

// ---------- ITEM BUILDERS ----------------------------------------------------

function buildIngredientItem(name, rarity, priceValue, usedInBlocks, folderIdForIngredients) {
  const _id = ingredientId(name);
  return {
    _id,
    _key: `!items!${_id}`,
    name,
    type: "loot",
    img: DEFAULT_INGREDIENT_IMG,
    effects: [],
    folder: folderIdForIngredients,
    flags: { core: {} },
    system: {
      description: {
        value:
          `<p>Alchemy ingredient.</p>` +
          `<p><strong>Rarity:</strong> ${rarity}</p>` +
          (usedInBlocks.length
            ? `<hr/><p><strong>Used in:</strong><br>${usedInBlocks.join("<br>")}</p>`
            : ""),
        chat: ""
      },
      source: { custom: "Generated from potion-recipes.json" },
      quantity: 1,
      weight: 0.1,
      price: { value: priceValue, denomination: "gp" },
      attunement: 0,
      equipped: false,
      rarity,
      identified: true,
      properties: []
    },
    ownership: { default: 0 }
  };
}

function buildPotionBookItem(yearName, recipesForYear, potionIndex, folderIdForBooks) {
  const lines = [];
  lines.push(`<h2>${escapeHtml(yearName)}</h2>`);
  lines.push(`<p>This book contains recipes and ingredients for the ${escapeHtml(yearName)} curriculum.</p>`);
  lines.push(`<hr/>`);

  const potionNames = Object.keys(recipesForYear).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const potionName of potionNames) {
    const pot = potionIndex.get(potionName.toLowerCase());
    const potionLink = pot
      ? `@UUID[Compendium.${MODULE_SCOPE}.${PACK_KEY}.Item.${pot.id}]{${escapeHtml(pot.name)}}`
      : escapeHtml(potionName);

    lines.push(`<h3>${potionLink}</h3>`);

    const ings = recipesForYear[potionName] || [];
    if (ings.length) {
      lines.push(`<ul>`);
      for (const ing of ings) {
        const ingName = String(ing.name || "").trim();
        const qty = Number(ing.quantity || 1);
        const ingId = ingredientId(ingName);
        const ingUUID = `@UUID[Compendium.${MODULE_SCOPE}.${PACK_KEY}.Item.${ingId}]{${escapeHtml(ingName)}}`;
        lines.push(`<li>${ingUUID} &times; ${qty}</li>`);
      }
      lines.push(`</ul>`);
    }
  }

  const html = lines.join("\n");
  const _id = bookId(yearName);

  return {
    _id,
    _key: `!items!${_id}`,
    name: `Potion Book — ${yearName}`,
    type: "loot",
    img: DEFAULT_BOOK_IMG,
    effects: [],
    folder: folderIdForBooks,
    flags: { core: {} },
    system: {
      description: { value: html, chat: "" },
      source: { custom: "Generated from potion-recipes.json" },
      quantity: 1,
      weight: 1,
      price: { value: 0, denomination: "gp" },
      attunement: 0,
      equipped: false,
      rarity: "common",
      identified: true,
      properties: []
    },
    ownership: { default: 0 }
  };
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- MAIN -------------------------------------------------------------

async function run() {
  if (!fs.existsSync(RECIPES_PATH)) {
    console.error(`Input not found: ${RECIPES_PATH}`);
    process.exit(1);
  }
  const recipes = JSON.parse(await fsp.readFile(RECIPES_PATH, "utf8"));

  const potionIndex = await loadPotionIndex();
  console.log(`[info] Indexed ${potionIndex.size} potion item(s) from ${POTIONS_PACK_DIR}`);

  const ingredientMap = invertRecipesToIngredientUse(recipes, potionIndex);

  await ensureDir(OUT_DIR);
  const INGREDIENTS_FOLDER_ID = await ensureFolder(OUT_DIR, ING_FOLDER_NAME);
  const BOOKS_FOLDER_ID = await ensureFolder(OUT_DIR, BOOKS_FOLDER_NAME);

  // Ingredients
  const ingredientNames = Array.from(ingredientMap.keys()).sort((a, b) => a.localeCompare(b));
  let writtenIngredients = 0;
  for (const ingName of ingredientNames) {
    const { uses, rarity } = ingredientMap.get(ingName);
    const usedInLines = (uses || []).map(u => u.uuidMarkup);
    const price = PRICE_BY_RARITY[rarity] ?? PRICE_BY_RARITY["common"];
    const item = buildIngredientItem(ingName, rarity, price, usedInLines, INGREDIENTS_FOLDER_ID);

    const fileName = `${sanitizeFilename(ingName)}---${item._id}.json`;
    const outPath = path.join(OUT_DIR, fileName);
    await fsp.writeFile(outPath, JSON.stringify(item, null, 2), "utf8");
    writtenIngredients++;
  }

  // Potion Books
  const years = Object.keys(recipes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  let writtenBooks = 0;
  for (const yearName of years) {
    const bookItem = buildPotionBookItem(yearName, recipes[yearName], potionIndex, BOOKS_FOLDER_ID);
    const fileName = `${sanitizeFilename(bookItem.name)}---${bookItem._id}.json`;
    const outPath = path.join(OUT_DIR, fileName);
    await fsp.writeFile(outPath, JSON.stringify(bookItem, null, 2), "utf8");
    writtenBooks++;
  }

  console.log(`[done] Created ${writtenIngredients} ingredient item(s) and ${writtenBooks} potion book(s) in: ${OUT_DIR}`);
  console.log(`Next: fvtt package pack "${PACK_KEY}" --inputDirectory "${OUT_DIR.replace(/\\/g, "/")}"`);
}

run().catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
