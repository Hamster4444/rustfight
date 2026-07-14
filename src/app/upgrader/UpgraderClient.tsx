"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Coins, Package, TrendingUp } from "lucide-react";
import { skins } from "@/data/skins";
import type { Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";
import SkinCard from "@/components/SkinCard";

const HOUSE_EDGE = 0.9; // win chance = value ratio × 0.9
const MAX_CHANCE = 0.9;

export default function UpgraderClient() {
  const mounted = useMounted();
  const inventory = useUserStore((s) => s.inventory);
  const removeItems = useUserStore((s) => s.removeItems);
  const addSkins = useUserStore((s) => s.addSkins);
  const addRecord = useUserStore((s) => s.addRecord);

  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState<Skin | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [outcome, setOutcome] = useState<"win" | "lose" | null>(null);
  const pendingWin = useRef(false);

  const selectedItems = inventory.filter((it) => selected.includes(it.uid));
  const selectedValue =
    Math.round(selectedItems.reduce((s, it) => s + it.skin.price, 0) * 100) /
    100;

  const chance = useMemo(() => {
    if (!target || selectedValue <= 0) return 0;
    return Math.min(MAX_CHANCE, (selectedValue / target.price) * HOUSE_EDGE);
  }, [target, selectedValue]);

  const targets = useMemo(
    () => [...skins].sort((a, b) => a.price - b.price),
    []
  );

  function toggle(uidStr: string) {
    if (spinning) return;
    setOutcome(null);
    setSelected((s) =>
      s.includes(uidStr) ? s.filter((x) => x !== uidStr) : [...s, uidStr]
    );
  }

  function upgrade() {
    if (!target || selectedItems.length === 0 || chance <= 0 || spinning)
      return;
    setOutcome(null);
    const roll = Math.random();
    const win = roll < chance;
    pendingWin.current = win;

    // land the pointer inside (win) or outside (lose) the chance arc
    const arcDeg = chance * 360;
    const landing = win
      ? Math.random() * (arcDeg - 6) + 3
      : arcDeg + Math.random() * (360 - arcDeg - 6) + 3;
    setRotation((r) => r + 1440 + (360 - (r % 360)) + landing);
    setSpinning(true);
  }

  function onSpinDone() {
    if (!target) return;
    const win = pendingWin.current;
    removeItems(selected);
    if (win) addSkins([target]);
    addRecord({
      game: "Upgrader",
      wager: selectedValue,
      profit: win
        ? Math.round((target.price - selectedValue) * 100) / 100
        : -selectedValue,
      detail: `${selectedItems.length} item(s) → ${target.name} (${(
        chance * 100
      ).toFixed(1)}%)`,
    });
    setSelected([]);
    setOutcome(win ? "win" : "lose");
    setSpinning(false);
    if (win) sounds.win();
    else sounds.lose();
  }

  const arc = chance * 360;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <TrendingUp className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Upgrader
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Risk items from your inventory for a shot at something better. Win
        chance = value ratio with a 10% house edge.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* your items */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="font-heading text-lg font-bold uppercase">
            Your items{" "}
            <span className="text-sm font-normal text-zinc-500">
              ({formatCoins(selectedValue)} selected)
            </span>
          </h2>
          <div className="mt-3 grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {!mounted ? (
              <p className="col-span-full text-sm text-zinc-500">Loading…</p>
            ) : inventory.length === 0 ? (
              <div className="col-span-full py-8 text-center">
                <Package className="mx-auto text-zinc-600" size={32} />
                <p className="mt-2 text-sm text-zinc-500">
                  Your inventory is empty.
                </p>
                <Link
                  href="/cases"
                  className="mt-2 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
                >
                  Open a case →
                </Link>
              </div>
            ) : (
              inventory.map((it) => (
                <SkinCard
                  key={it.uid}
                  skin={it.skin}
                  size="sm"
                  selected={selected.includes(it.uid)}
                  onClick={() => toggle(it.uid)}
                />
              ))
            )}
          </div>
        </div>

        {/* wheel */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-edge bg-surface p-6 lg:w-72">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#26232c"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="12"
                strokeDasharray={`${(arc / 360) * 439.8} 439.8`}
              />
            </svg>
            {/* pointer */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.15, 0.85, 0.25, 1] }}
              onAnimationComplete={onSpinDone}
            >
              <div className="absolute left-1/2 top-0 h-6 w-1 -translate-x-1/2 rounded-full bg-zinc-100" />
            </motion.div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-heading text-3xl font-bold tabular-nums">
                {(chance * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase text-zinc-500">win chance</p>
            </div>
          </div>

          {target && selectedValue > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              {formatCoins(selectedValue)} →{" "}
              <span className="font-semibold text-zinc-200">
                {formatCoins(target.price)}
              </span>{" "}
              ({(target.price / Math.max(selectedValue, 0.01)).toFixed(2)}x)
            </p>
          )}

          <button
            onClick={upgrade}
            disabled={!target || selectedItems.length === 0 || spinning}
            className="mt-4 w-full rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {spinning ? "Rolling…" : "Upgrade"}
          </button>

          {outcome === "win" && (
            <p className="mt-3 text-center text-sm font-bold text-accent">
              Upgrade successful — item added to your inventory!
            </p>
          )}
          {outcome === "lose" && (
            <p className="mt-3 text-center text-sm font-bold text-rarity-covert">
              Upgrade failed — items lost.
            </p>
          )}
        </div>

        {/* targets */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="font-heading text-lg font-bold uppercase">
            Target skin
          </h2>
          <div className="mt-3 grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {targets.map((s) => (
              <SkinCard
                key={s.id}
                skin={s}
                size="sm"
                selected={target?.id === s.id}
                onClick={() => {
                  if (!spinning) {
                    setOutcome(null);
                    setTarget(s);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-zinc-600">
        <Coins size={12} />
        Tip: you can sell unwanted skins on the marketplace to bet with coins
        instead.
      </p>
    </div>
  );
}
