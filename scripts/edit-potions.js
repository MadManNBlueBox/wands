#!/usr/bin/env node
/**
 * Edit potions in an unpacked compendium folder (packs-json/<PACK>/).
 * - Sets reasonable weight (default 0.5)
 * - Sets price based on rarity map
 *
 * Usage:
 *   node scripts/edit-potions.js <pack-folder-name> [--force]
 * Example:
 *   node scripts/edit-potions.js items-wands
 *   node scripts/edit-potions.js spells-wands --force
 */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKS_JSON_DIR = path.join(ROOT, "packs-json");

// ---- tweakable defaults -----------------------------------------------------
const DEFAULT_WEIGHT = 0.5; // lbs per potion bottle

// Price map by rarity (gp). Adjust to your taste.
const PRICE_BY_RARITY = {
  common: 50,
  uncommon: 250,
  rare: 2500,
  "very rare": 12500,
  legendary: 62500,
  artifact: 312500 // just in case
};
// ----------------------------------------------------------------------------

function getArgFlag(flag) {
  return process.argv.includes(flag);
}

async function pathExists(p) {
  try { await fsp.access(p, fs.constants.F_OK); return true; }
  catch { return false; }
}

async function run() {
  const packName = process.argv[2];
  const force = getArgFlag("--force");

  if (!packName) {
    console.error("Usage: node scripts/edit-potions.js <pack-folder-name> [--force]");
    process.exit(1);
  }

  const dir = path.join(PACKS_JSON_DIR, packName);
  if (!(await pathExists(dir))) {
    console.error(`Missing folder: ${path.relative(ROOT, dir)} (did you run 'fvtt package unpack "${packName}"'?)`);
    process.exit(1);
  }

  const files = (await fsp.readdir(dir)).filter(n => n.toLowerCase().endsWith(".json"));
  if (!files.length) {
    console.log(`[edit] No JSON files found in ${path.relative(ROOT, dir)}`);
    return;
  }

  let touched = 0, skipped = 0, errors = 0;
  for (const file of files) {
    const full = path.join(dir, file);
    try {
      const data = JSON.parse(await fsp.readFile(full, "utf8"));

      const isConsumable = (data.type === "consumable");
      const isPotion = data?.system?.type?.value === "potion";
      if (!isConsumable || !isPotion) { skipped++; continue; }

      const sys = data.system ?? (data.system = {});
      const rarity = String(sys.rarity ?? "").toLowerCase();

      // --- weight
      if (force || !sys.weight || Number(sys.weight) === 0) {
        sys.weight = DEFAULT_WEIGHT;
      }

      // --- price
      const price = sys.price ?? (sys.price = { value: 0, denomination: "gp" });
      const hasPrice = typeof price.value === "number" && price.value > 0;
      if (force || !hasPrice) {
        const gp = PRICE_BY_RARITY[rarity] ?? PRICE_BY_RARITY["uncommon"]; // sensible fallback
        price.value = gp;
        price.denomination = price.denomination || "gp";
      }

      await fsp.writeFile(full, JSON.stringify(data, null, 2), "utf8");
      touched++;
    } catch (e) {
      console.error(`[edit:ERROR] ${file}: ${e.message}`);
      errors++;
    }
  }

  console.log(`[edit] Done. Updated ${touched}, skipped ${skipped}, errors ${errors}.`);
}

run();
