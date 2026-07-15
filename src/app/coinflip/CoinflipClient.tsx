"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CircleDollarSign, Coins, User } from "lucide-react";
import { botNames } from "@/data/bots";
import { formatCoins } from "@/lib/format";
import { randomOf } from "@/lib/rng";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";

type Side = "purple" | "black";

interface Lobby {
  id: number;
  creator: string;
  side: Side; // side taken by the creator
  bet: number;
}

interface Flip {
  bet: number;
  yourSide: Side;
  opponent: string;
  result: Side;
  key: number;
}

const other = (s: Side): Side => (s === "purple" ? "black" : "purple");

function SideBadge({ side, small }: { side: Side; small?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border-2 ${
        small ? "h-5 w-5" : "h-8 w-8"
      } ${
        side === "purple"
          ? "border-accent-deep bg-accent"
          : "border-edge bg-bg"
      }`}
      title={side}
    />
  );
}

export default function CoinflipClient() {
  const mounted = useMounted();
  const balance = useUserStore((s) => s.balance);
  const spendBalance = useUserStore((s) => s.spendBalance);
  const addBalance = useUserStore((s) => s.addBalance);
  const addRecord = useUserStore((s) => s.addRecord);

  const [betInput, setBetInput] = useState("100");
  const [side, setSide] = useState<Side>("purple");
  const [flip, setFlip] = useState<Flip | null>(null);
  const [phase, setPhase] = useState<"idle" | "waiting" | "flipping" | "done">(
    "idle"
  );
  const [error, setError] = useState("");
  const settled = useRef(false);

  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [recent, setRecent] = useState<
    { id: number; winner: string; side: Side; pot: number }[]
  >([]);
  useEffect(() => {
    if (!mounted) return;
    setLobbies(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        creator: randomOf(botNames),
        side: Math.random() < 0.5 ? "purple" : "black",
        bet: Math.round((25 + Math.random() * 975) * 100) / 100,
      }))
    );
    setRecent(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        winner: randomOf(botNames),
        side: (Math.random() < 0.5 ? "purple" : "black") as Side,
        pot: Math.round((50 + Math.random() * 1950) * 100) / 100,
      }))
    );
  }, [mounted]);

  const bet = useMemo(() => {
    const n = parseFloat(betInput);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }, [betInput]);

  function startFlip(yourSide: Side, betAmount: number, opponent: string) {
    if (phase === "waiting" || phase === "flipping") return;
    if (betAmount <= 0) {
      setError("Enter a valid bet.");
      return;
    }
    if (!spendBalance(betAmount)) {
      setError("Not enough coins.");
      return;
    }
    setError("");
    settled.current = false;
    const result: Side = Math.random() < 0.5 ? "purple" : "black";
    setFlip({ bet: betAmount, yourSide, opponent, result, key: Date.now() });
    setPhase("waiting");
  }

  // waiting → flipping after opponent "joins"
  useEffect(() => {
    if (phase !== "waiting") return;
    const t = setTimeout(() => setPhase("flipping"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  function onFlipDone() {
    if (!flip || settled.current) return;
    settled.current = true;
    const won = flip.result === flip.yourSide;
    if (won) {
      addBalance(flip.bet * 2);
      sounds.win();
    } else {
      sounds.lose();
    }
    addRecord({
      game: "Coinflip",
      wager: flip.bet,
      profit: won ? flip.bet : -flip.bet,
      detail: `${flip.yourSide} vs ${flip.opponent} → ${flip.result}`,
    });
    setPhase("done");
  }

  const won = flip && flip.result === flip.yourSide;
  // spins: full turns + half turn if it should land on black (back face)
  const finalRotation = flip
    ? 1800 + (flip.result === "black" ? 180 : 0)
    : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <CircleDollarSign className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Coinflip
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Pick purple or black — winner takes the whole pot.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* create / flip area */}
        <div className="rounded-xl border border-edge bg-surface p-5">
          {flip && phase !== "idle" ? (
            <div className="flex flex-col items-center py-4">
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-zinc-100">You</span> (
                {flip.yourSide}) vs{" "}
                <span className="font-semibold text-zinc-100">
                  {flip.opponent}
                </span>{" "}
                ({other(flip.yourSide)})
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold">
                <Coins size={14} className="text-accent" />
                Pot: {formatCoins(flip.bet * 2)}
              </p>

              <div className="my-10 h-44 w-44" style={{ perspective: 800 }}>
                {phase === "waiting" ? (
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-edge bg-surface2 text-sm text-zinc-500"
                  >
                    waiting…
                  </motion.div>
                ) : (
                  <motion.div
                    key={flip.key}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: finalRotation }}
                    transition={{ duration: 3, ease: [0.2, 0.7, 0.3, 1] }}
                    onAnimationComplete={onFlipDone}
                    className="relative h-44 w-44"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-accent-deep bg-accent font-heading text-2xl font-bold text-white"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      PURPLE
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full border-4 border-edge bg-bg font-heading text-2xl font-bold text-zinc-300"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      BLACK
                    </div>
                  </motion.div>
                )}
              </div>

              {phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p
                    className={`font-heading text-2xl font-bold uppercase ${
                      won ? "text-accent" : "text-rarity-covert"
                    }`}
                  >
                    {won
                      ? `You won ${formatCoins(flip.bet * 2)} coins!`
                      : "You lost the flip"}
                  </p>
                  <button
                    onClick={() => {
                      setFlip(null);
                      setPhase("idle");
                    }}
                    className="mt-3 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                  >
                    Back to lobbies
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold uppercase">
                Create a flip
              </h2>
              <div className="mt-4 flex items-center gap-3">
                {(["purple", "black"] as Side[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                      side === s
                        ? "border-accent bg-accent-deep/20 text-zinc-100"
                        : "border-edge bg-surface2 text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    <SideBadge side={s} small />
                    {s}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-xs uppercase text-zinc-500">
                Bet (coins)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={betInput}
                  onChange={(e) => setBetInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-edge bg-bg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent"
                />
              </label>
              <div className="mt-2 flex gap-2">
                {[50, 100, 250, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBetInput(String(v))}
                    className="rounded-lg border border-edge bg-surface2 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-100"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                onClick={() => startFlip(side, bet, randomOf(botNames))}
                disabled={bet <= 0 || (mounted && balance < bet)}
                className="mt-4 w-full rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create flip for {formatCoins(bet)}
              </button>
              {error && (
                <p className="mt-2 text-sm text-rarity-covert">{error}</p>
              )}

              {/* recent flips fill the panel */}
              <h3 className="mt-6 border-t border-edge pt-4 font-heading text-sm font-bold uppercase tracking-widest text-zinc-500">
                Recent flips
              </h3>
              <div className="mt-2 flex flex-col gap-1.5">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-surface2 px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2 text-zinc-300">
                      <SideBadge side={r.side} small />
                      {r.winner} won
                    </span>
                    <span className="flex items-center gap-1 font-semibold tabular-nums">
                      <Coins size={11} className="text-accent" />
                      {formatCoins(r.pot)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* lobby list */}
        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="font-heading text-xl font-bold uppercase">
            Open lobbies
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {lobbies.length === 0 && (
              <p className="text-sm text-zinc-500">Loading lobbies…</p>
            )}
            {lobbies.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border border-edge bg-surface2 p-3"
              >
                <div className="flex items-center gap-3">
                  <User size={16} className="text-zinc-500" />
                  <div>
                    <p className="text-sm font-semibold">{l.creator}</p>
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                      has <SideBadge side={l.side} small />{" "}
                      <span className="capitalize">{l.side}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="flex items-center gap-1 text-sm font-bold tabular-nums">
                    <Coins size={13} className="text-accent" />
                    {formatCoins(l.bet)}
                  </p>
                  <button
                    onClick={() => {
                      startFlip(other(l.side), l.bet, l.creator);
                      setLobbies((ls) => ls.filter((x) => x.id !== l.id));
                    }}
                    disabled={
                      (mounted && balance < l.bet) ||
                      phase === "waiting" ||
                      phase === "flipping"
                    }
                    className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Join as {other(l.side)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
