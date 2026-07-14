import type { Skin } from "@/lib/types";
import { weightedPick } from "@/lib/rng";
import { skins } from "./skins";

export interface CasePoolEntry {
  skin: Skin;
  weight: number;
}

export interface CaseDef {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string; // flagship skin image used as case art
  pool: CasePoolEntry[];
}

// weight by rarity: cheap items drop often, covert items are rare
const rarityWeight: Record<Skin["rarity"], number> = {
  Consumer: 45,
  Industrial: 30,
  Restricted: 16,
  Classified: 7,
  Covert: 2,
};

function match(pattern: RegExp): Skin[] {
  return skins.filter((s) => pattern.test(s.name));
}

function makeCase(
  id: string,
  name: string,
  tagline: string,
  pool: Skin[],
  flagship?: Skin
): CaseDef {
  const entries = pool.map((skin) => ({
    skin,
    weight: rarityWeight[skin.rarity],
  }));
  const total = entries.reduce((s, e) => s + e.weight, 0);
  const ev = entries.reduce((s, e) => s + (e.weight / total) * e.skin.price, 0);
  // price the case ~11% above expected value (house edge)
  const price = Math.max(0.25, Math.round(ev * 1.11 * 100) / 100);
  const top = flagship ?? [...pool].sort((a, b) => b.price - a.price)[0];
  return { id, name, tagline, price, image: top.image, pool: entries };
}

export const cases: CaseDef[] = [
  makeCase(
    "ak-arsenal",
    "AK Arsenal",
    "Assault rifle skins only",
    match(/AK-?47/i)
  ),
  makeCase(
    "face-off",
    "Face Off",
    "Metal facemasks for the front line",
    match(/Facemask/i)
  ),
  makeCase(
    "streetwear",
    "Streetwear",
    "Hoodies straight from the compound",
    match(/Hoodie/i)
  ),
  makeCase(
    "fort-knox",
    "Fort Knox",
    "Doors to keep the raiders out",
    match(/Door/i)
  ),
  makeCase(
    "boots-on-ground",
    "Boots on the Ground",
    "Footwear for every wipe",
    match(/Boots/i)
  ),
  makeCase("leg-day", "Leg Day", "Pants with personality", match(/Pants/i)),
  makeCase(
    "high-roller",
    "High Roller",
    "Only the most expensive loot",
    skins.filter((s) => s.price >= 3)
  ),
  makeCase(
    "scrap-bucket",
    "Scrap Bucket",
    "Cheap thrills for new survivors",
    skins.filter((s) => s.price <= 1.5)
  ),
];

export const casesById = new Map(cases.map((c) => [c.id, c]));

export function pickFromCase(c: CaseDef): Skin {
  return weightedPick(c.pool.map((e) => ({ item: e.skin, weight: e.weight })));
}

export function caseOdds(c: CaseDef): { skin: Skin; chance: number }[] {
  const total = c.pool.reduce((s, e) => s + e.weight, 0);
  return c.pool
    .map((e) => ({ skin: e.skin, chance: e.weight / total }))
    .sort((a, b) => b.skin.price - a.skin.price);
}
