"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Coins, Package, Search, Store } from "lucide-react";
import { skins } from "@/data/skins";
import type { Rarity, Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import SkinCard from "@/components/SkinCard";

const SELL_RATE = 0.95; // you get 95% of value when selling

const rarities: Rarity[] = [
  "Consumer",
  "Industrial",
  "Restricted",
  "Classified",
  "Covert",
];

const rarityOrder: Record<Rarity, number> = {
  Consumer: 0,
  Industrial: 1,
  Restricted: 2,
  Classified: 3,
  Covert: 4,
};

type SortKey = "price-desc" | "price-asc" | "name" | "rarity";

const sortLabels: Record<SortKey, string> = {
  "price-desc": "Price: high → low",
  "price-asc": "Price: low → high",
  name: "Name A–Z",
  rarity: "Rarity",
};

function applyFilters<T>(
  items: T[],
  getSkin: (t: T) => Skin,
  search: string,
  rarity: Rarity | "all",
  minPrice: number,
  maxPrice: number,
  sort: SortKey
): T[] {
  const q = search.trim().toLowerCase();
  const filtered = items.filter((t) => {
    const s = getSkin(t);
    if (q && !s.name.toLowerCase().includes(q)) return false;
    if (rarity !== "all" && s.rarity !== rarity) return false;
    if (s.price < minPrice) return false;
    if (maxPrice > 0 && s.price > maxPrice) return false;
    return true;
  });
  return filtered.sort((a, b) => {
    const sa = getSkin(a);
    const sb = getSkin(b);
    switch (sort) {
      case "price-asc":
        return sa.price - sb.price;
      case "price-desc":
        return sb.price - sa.price;
      case "name":
        return sa.name.localeCompare(sb.name);
      case "rarity":
        return rarityOrder[sb.rarity] - rarityOrder[sa.rarity];
    }
  });
}

export default function MarketplaceClient() {
  const mounted = useMounted();
  const balance = useUserStore((s) => s.balance);
  const inventory = useUserStore((s) => s.inventory);
  const spendBalance = useUserStore((s) => s.spendBalance);
  const addBalance = useUserStore((s) => s.addBalance);
  const addSkins = useUserStore((s) => s.addSkins);
  const removeItems = useUserStore((s) => s.removeItems);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [sort, setSort] = useState<SortKey>("price-desc");
  const [message, setMessage] = useState("");

  const minPrice = parseFloat(minInput) || 0;
  const maxPrice = parseFloat(maxInput) || 0;

  const buyList = useMemo(
    () =>
      applyFilters(skins, (s) => s, search, rarity, minPrice, maxPrice, sort),
    [search, rarity, minPrice, maxPrice, sort]
  );
  const sellList = useMemo(
    () =>
      applyFilters(
        inventory,
        (it) => it.skin,
        search,
        rarity,
        minPrice,
        maxPrice,
        sort
      ),
    [inventory, search, rarity, minPrice, maxPrice, sort]
  );

  function buy(skin: Skin) {
    if (!spendBalance(skin.price)) {
      setMessage("Not enough coins for that skin.");
      return;
    }
    addSkins([skin]);
    setMessage(`Bought ${skin.name} for ${formatCoins(skin.price)} coins.`);
  }

  function sell(uidStr: string, skin: Skin) {
    const payout = Math.round(skin.price * SELL_RATE * 100) / 100;
    removeItems([uidStr]);
    addBalance(payout);
    setMessage(`Sold ${skin.name} for ${formatCoins(payout)} coins.`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <Store className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Marketplace
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Buy skins with coins or sell your inventory at {SELL_RATE * 100}% of
        value.
      </p>

      {/* tabs + filters */}
      <div className="mt-6 rounded-xl border border-edge bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(["buy", "sell"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                  tab === t
                    ? "bg-accent text-white"
                    : "border border-edge bg-surface2 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative min-w-40 flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skins…"
              className="w-full rounded-xl border border-edge bg-bg py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none focus:border-accent"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-edge bg-bg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-accent"
          >
            {Object.entries(sortLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRarity("all")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
              rarity === "all"
                ? "bg-accent text-white"
                : "border border-edge bg-surface2 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            All
          </button>
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                rarity === r
                  ? "bg-accent text-white"
                  : "border border-edge bg-surface2 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {r}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-20 rounded-lg border border-edge bg-bg px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent"
            />
            –
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-20 rounded-lg border border-edge bg-bg px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent"
            />
            coins
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-3 rounded-xl border border-edge bg-surface px-4 py-2 text-sm text-zinc-300">
          {message}
        </p>
      )}

      {/* listing */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tab === "buy" &&
          buyList.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <SkinCard skin={s} />
              <button
                onClick={() => buy(s)}
                disabled={mounted && balance < s.price}
                className="flex w-36 items-center justify-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Coins size={12} /> Buy {formatCoins(s.price)}
              </button>
            </div>
          ))}

        {tab === "sell" &&
          mounted &&
          sellList.map((it) => (
            <div key={it.uid} className="flex flex-col items-center gap-2">
              <SkinCard skin={it.skin} />
              <button
                onClick={() => sell(it.uid, it.skin)}
                className="flex w-36 items-center justify-center gap-1 rounded-xl border border-edge bg-surface2 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-colors hover:border-accent"
              >
                <Coins size={12} className="text-accent" /> Sell{" "}
                {formatCoins(Math.round(it.skin.price * SELL_RATE * 100) / 100)}
              </button>
            </div>
          ))}
      </div>

      {/* empty states */}
      {tab === "buy" && buyList.length === 0 && (
        <div className="mt-8 rounded-xl border border-edge bg-surface py-10 text-center">
          <Search className="mx-auto text-zinc-600" size={28} />
          <p className="mt-2 text-sm text-zinc-500">
            No skins match your filters.
          </p>
        </div>
      )}
      {tab === "sell" && mounted && sellList.length === 0 && (
        <div className="mt-8 rounded-xl border border-edge bg-surface py-10 text-center">
          <Package className="mx-auto text-zinc-600" size={28} />
          <p className="mt-2 text-sm text-zinc-500">
            {inventory.length === 0
              ? "Your inventory is empty."
              : "No inventory items match your filters."}
          </p>
          {inventory.length === 0 && (
            <Link
              href="/cases"
              className="mt-1 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
            >
              Open a case →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
