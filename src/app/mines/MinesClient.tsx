"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bomb, Coins, Gem } from "lucide-react";
import { formatCoins } from "@/lib/format";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";

const GRID = 25;
const HOUSE_EDGE = 0.9;

function multiplierFor(mines: number, revealed: number): number {
  let m = 1;
  for (let i = 0; i < revealed; i++) {
    m *= (GRID - i) / (GRID - mines - i);
  }
  return m * HOUSE_EDGE;
}

type Phase = "idle" | "playing" | "busted" | "cashed";

export default function MinesClient() {
  const mounted = useMounted();
  const balance = useUserStore((s) => s.balance);
  const spendBalance = useUserStore((s) => s.spendBalance);
  const addBalance = useUserStore((s) => s.addBalance);
  const addRecord = useUserStore((s) => s.addRecord);

  const [betInput, setBetInput] = useState("100");
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [bustTile, setBustTile] = useState<number | null>(null);
  const [error, setError] = useState("");

  const bet = useMemo(() => {
    const n = parseFloat(betInput);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }, [betInput]);

  const currentMult = multiplierFor(mineCount, revealed.size);
  const nextMult = multiplierFor(mineCount, revealed.size + 1);
  const cashout = Math.round(bet * currentMult * 100) / 100;

  function start() {
    if (bet <= 0) {
      setError("Enter a valid bet.");
      return;
    }
    if (!spendBalance(bet)) {
      setError("Not enough coins.");
      return;
    }
    setError("");
    const set = new Set<number>();
    while (set.size < mineCount) {
      set.add(Math.floor(Math.random() * GRID));
    }
    setMines(set);
    setRevealed(new Set());
    setBustTile(null);
    setPhase("playing");
  }

  function clickTile(i: number) {
    if (phase !== "playing" || revealed.has(i)) return;
    if (mines.has(i)) {
      setBustTile(i);
      setPhase("busted");
      sounds.lose();
      addRecord({
        game: "Mines",
        wager: bet,
        profit: -bet,
        detail: `${mineCount} mines · busted after ${revealed.size} safe tiles`,
      });
      return;
    }
    sounds.tick();
    const next = new Set(revealed);
    next.add(i);
    setRevealed(next);
    if (next.size === GRID - mineCount) {
      // cleared the whole board
      doCashout(next.size);
    }
  }

  function doCashout(revealedCount = revealed.size) {
    const mult = multiplierFor(mineCount, revealedCount);
    const win = Math.round(bet * mult * 100) / 100;
    addBalance(win);
    sounds.win();
    addRecord({
      game: "Mines",
      wager: bet,
      profit: Math.round((win - bet) * 100) / 100,
      detail: `${mineCount} mines · ${revealedCount} tiles · ${mult.toFixed(2)}x`,
    });
    setPhase("cashed");
  }

  const gameOver = phase === "busted" || phase === "cashed";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <Bomb className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Mines
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Reveal safe tiles to grow your multiplier — hit a mine and lose it all.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* controls */}
        <div className="h-fit rounded-xl border border-edge bg-surface p-5">
          <label className="block text-xs uppercase text-zinc-500">
            Bet (coins)
            <input
              type="number"
              min="1"
              step="1"
              value={betInput}
              disabled={phase === "playing"}
              onChange={(e) => setBetInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-edge bg-bg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent disabled:opacity-50"
            />
          </label>
          <label className="mt-4 block text-xs uppercase text-zinc-500">
            Mines: <span className="font-bold text-zinc-100">{mineCount}</span>
            <input
              type="range"
              min="1"
              max="24"
              value={mineCount}
              disabled={phase === "playing"}
              onChange={(e) => setMineCount(parseInt(e.target.value))}
              className="mt-2 w-full accent-[#8b5cf6]"
            />
          </label>

          <div className="mt-4 rounded-xl border border-edge bg-surface2 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Current multiplier</span>
              <span className="font-bold tabular-nums">
                {currentMult.toFixed(2)}x
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-zinc-500">Next tile</span>
              <span className="font-bold tabular-nums text-accent">
                {nextMult.toFixed(2)}x
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-zinc-500">Safe tiles found</span>
              <span className="font-bold tabular-nums">{revealed.size}</span>
            </div>
          </div>

          {/* payout ladder for the current settings */}
          <div className="mt-4 rounded-xl border border-edge bg-surface2 p-3">
            <p className="text-xs uppercase text-zinc-500">Payout ladder</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }, (_, i) => {
                const tiles = revealed.size + i + 1;
                if (tiles > GRID - mineCount) return null;
                const mult = multiplierFor(mineCount, tiles);
                return (
                  <div
                    key={tiles}
                    className="rounded-lg bg-bg px-2 py-1.5 text-center"
                  >
                    <p className="text-[10px] text-zinc-500">{tiles} tiles</p>
                    <p className="text-xs font-bold tabular-nums text-accent">
                      {mult.toFixed(2)}x
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {phase === "playing" ? (
            <button
              onClick={() => doCashout()}
              disabled={revealed.size === 0}
              className="mt-4 w-full rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cash out {formatCoins(cashout)}
            </button>
          ) : (
            <button
              onClick={start}
              disabled={bet <= 0 || (mounted && balance < bet)}
              className="mt-4 w-full rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {gameOver ? "Play again" : "Start game"} ({formatCoins(bet)})
            </button>
          )}
          {error && <p className="mt-2 text-sm text-rarity-covert">{error}</p>}

          {phase === "busted" && (
            <p className="mt-3 text-center text-sm font-bold text-rarity-covert">
              Boom — you hit a mine and lost {formatCoins(bet)}.
            </p>
          )}
          {phase === "cashed" && (
            <p className="mt-3 text-center text-sm font-bold text-accent">
              Cashed out {formatCoins(cashout)} coins!
            </p>
          )}
        </div>

        {/* grid */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-edge bg-surface p-4 sm:p-6">
          <div className="grid w-full max-w-xl grid-cols-5 gap-2.5">
            {Array.from({ length: GRID }, (_, i) => {
              const isMine = mines.has(i);
              const isRevealed = revealed.has(i);
              const showMine = gameOver && isMine;
              const showSafe = isRevealed || (gameOver && !isMine);
              return (
                <motion.button
                  key={`${i}-${phase === "idle"}`}
                  whileTap={phase === "playing" ? { scale: 0.92 } : undefined}
                  onClick={() => clickTile(i)}
                  disabled={phase !== "playing" || isRevealed}
                  className={`flex aspect-square items-center justify-center rounded-xl border text-zinc-300 transition-colors ${
                    showMine
                      ? i === bustTile
                        ? "border-rarity-covert bg-rarity-covert/30"
                        : "border-rarity-covert/50 bg-surface2"
                      : isRevealed
                        ? "border-accent/60 bg-accent-deep/25"
                        : showSafe
                          ? "border-edge bg-surface2 opacity-50"
                          : `border-edge bg-surface2 ${
                              phase === "playing" ? "hover:border-accent/50" : ""
                            }`
                  } disabled:cursor-default`}
                >
                  {showMine && (
                    <Bomb
                      size={28}
                      className={
                        i === bustTile ? "text-rarity-covert" : "text-zinc-500"
                      }
                    />
                  )}
                  {isRevealed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Gem size={28} className="text-accent" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {phase === "idle" && (
            <p className="mt-4 flex items-center justify-center gap-1 text-xs text-zinc-600">
              <Coins size={12} /> Place a bet and press Start to begin
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
