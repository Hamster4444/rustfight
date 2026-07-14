"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Coins } from "lucide-react";
import type { CaseDef } from "@/data/cases";
import { caseOdds, pickFromCase } from "@/data/cases";
import type { Skin } from "@/lib/types";
import { formatCoins, formatPercent } from "@/lib/format";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";
import SkinCard, { rarityText } from "@/components/SkinCard";
import SteamImage from "@/components/SteamImage";

const REEL_SIZE = 60;
const WIN_INDEX = 52;
const CARD_PITCH = 152; // w-36 card (144px) + 8px gap

interface SpinState {
  reel: Skin[];
  offset: number;
  winner: Skin;
  key: number;
}

export default function CaseOpener({ caseDef }: { caseDef: CaseDef }) {
  const mounted = useMounted();
  const balance = useUserStore((s) => s.balance);
  const spendBalance = useUserStore((s) => s.spendBalance);
  const addBalance = useUserStore((s) => s.addBalance);
  const addSkins = useUserStore((s) => s.addSkins);
  const removeItems = useUserStore((s) => s.removeItems);
  const addRecord = useUserStore((s) => s.addRecord);

  const containerRef = useRef<HTMLDivElement>(null);
  const [spin, setSpin] = useState<SpinState | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<{ skin: Skin; uid: string } | null>(null);
  const [error, setError] = useState("");

  const odds = caseOdds(caseDef);

  function openCase() {
    if (spinning) return;
    if (!spendBalance(caseDef.price)) {
      setError("Not enough coins — top up with the + button in the top bar.");
      return;
    }
    setError("");
    setWon(null);

    const winner = pickFromCase(caseDef);
    const reel = Array.from({ length: REEL_SIZE }, () =>
      pickFromCase(caseDef)
    );
    reel[WIN_INDEX] = winner;

    const containerWidth = containerRef.current?.clientWidth ?? 800;
    const jitter = (Math.random() - 0.5) * 90;
    const offset =
      WIN_INDEX * CARD_PITCH + 72 - containerWidth / 2 + jitter;

    setSpinning(true);
    setSpin({ reel, offset, winner, key: Date.now() });
  }

  function onSpinDone() {
    if (!spin) return;
    const [item] = addSkins([spin.winner]);
    addRecord({
      game: "Cases",
      wager: caseDef.price,
      profit: Math.round((spin.winner.price - caseDef.price) * 100) / 100,
      detail: `${caseDef.name} → ${spin.winner.name}`,
    });
    setWon({ skin: spin.winner, uid: item.uid });
    setSpinning(false);
    if (spin.winner.price >= caseDef.price) sounds.win();
    else sounds.lose();
  }

  function sellWon() {
    if (!won) return;
    removeItems([won.uid]);
    addBalance(won.skin.price);
    setWon(null);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent"
      >
        <ArrowLeft size={16} /> All cases
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <SteamImage src={caseDef.image} alt={caseDef.name} size={72} />
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
            {caseDef.name}
          </h1>
          <p className="text-sm text-zinc-500">{caseDef.tagline}</p>
        </div>
      </div>

      {/* Spinner */}
      <div
        ref={containerRef}
        className="relative mt-6 h-52 overflow-hidden rounded-xl border border-edge bg-surface"
      >
        {/* center marker */}
        <div className="absolute left-1/2 top-0 z-10 h-full w-0.5 -translate-x-1/2 bg-accent" />
        {spin ? (
          <motion.div
            key={spin.key}
            className="absolute top-1/2 flex -translate-y-1/2 gap-2 pl-2"
            initial={{ x: 0 }}
            animate={{ x: -spin.offset }}
            transition={{ duration: 5.5, ease: [0.15, 0.85, 0.25, 1] }}
            onAnimationComplete={onSpinDone}
          >
            {spin.reel.map((skin, i) => (
              <div key={i} className="shrink-0">
                <SkinCard skin={skin} showPrice={false} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Hit “Open Case” to spin the reel
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={openCase}
          disabled={spinning || (mounted && balance < caseDef.price)}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Open Case
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Coins size={14} />
            {formatCoins(caseDef.price)}
          </span>
        </button>
        {error && <p className="text-sm text-rarity-covert">{error}</p>}
      </div>

      {/* Win reveal */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setWon(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="w-full max-w-sm rounded-xl border border-edge bg-surface p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-heading text-xl font-bold uppercase tracking-wide text-accent">
                You unboxed
              </p>
              <div className="mt-4 flex justify-center">
                <SteamImage
                  src={won.skin.image}
                  alt={won.skin.name}
                  size={140}
                />
              </div>
              <p className="mt-3 text-lg font-semibold">{won.skin.name}</p>
              <p className={`text-sm ${rarityText[won.skin.rarity]}`}>
                {won.skin.rarity}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 font-semibold">
                <Coins size={16} className="text-accent" />
                {formatCoins(won.skin.price)}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={sellWon}
                  className="flex-1 rounded-xl border border-edge bg-surface2 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
                >
                  Sell for {formatCoins(won.skin.price)}
                </button>
                <button
                  onClick={() => setWon(null)}
                  className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Keep it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contents & odds */}
      <h2 className="mt-10 font-heading text-xl font-bold uppercase tracking-wide">
        Case contents
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {odds.map(({ skin, chance }) => (
          <div key={skin.id} className="flex flex-col items-center gap-1">
            <SkinCard skin={skin} size="sm" />
            <span className="text-[11px] text-zinc-500">
              {formatPercent(chance)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
