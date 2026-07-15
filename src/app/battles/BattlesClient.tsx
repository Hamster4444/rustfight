"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Crown, Minus, Plus, Swords, User, X } from "lucide-react";
import { cases, pickFromCase, type CaseDef } from "@/data/cases";
import { botNames } from "@/data/bots";
import type { Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { randomOf } from "@/lib/rng";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";
import SteamImage from "@/components/SteamImage";
import CaseArt from "@/components/CaseArt";
import { rarityText } from "@/components/SkinCard";

type Mode = "1v1" | "2v2";
type Phase = "setup" | "playing" | "done";

interface Player {
  name: string;
  isYou: boolean;
  team: 0 | 1;
}

interface Battle {
  mode: Mode;
  rounds: CaseDef[];
  players: Player[];
  drops: Skin[][]; // [playerIndex][roundIndex]
  cost: number;
}

interface OpenLobby {
  id: number;
  creator: string;
  mode: Mode;
  rounds: CaseDef[];
  cost: number;
}

const REEL_LEN = 22;
const REEL_WIN = 18;
const ITEM_H = 64; // px per reel row
const REEL_H = 128; // visible reel window
const SPIN_MS = 2200;
const REVEAL_MS = 2400;
const ROUND_MS = 4000;

function sum(skins: Skin[]): number {
  return Math.round(skins.reduce((s, k) => s + k.price, 0) * 100) / 100;
}

function buildBattle(mode: Mode, rounds: CaseDef[], creatorBot?: string): Battle {
  const bots = botNames.filter((b) => b !== creatorBot);
  const players: Player[] =
    mode === "1v1"
      ? [
          { name: "You", isYou: true, team: 0 },
          { name: creatorBot ?? randomOf(bots), isYou: false, team: 1 },
        ]
      : [
          { name: "You", isYou: true, team: 0 },
          { name: randomOf(bots), isYou: false, team: 0 },
          { name: creatorBot ?? randomOf(bots), isYou: false, team: 1 },
          { name: randomOf(bots), isYou: false, team: 1 },
        ];
  const drops = players.map(() => rounds.map((c) => pickFromCase(c)));
  const cost = Math.round(rounds.reduce((s, c) => s + c.price, 0) * 100) / 100;
  return { mode, rounds, players, drops, cost };
}

/** Vertical reel that decelerates onto the drawn item, like the case opener. */
function VerticalReel({
  caseDef,
  result,
  spinKey,
  withSound,
}: {
  caseDef: CaseDef;
  result: Skin;
  spinKey: number;
  withSound: boolean;
}) {
  const reel = useMemo(() => {
    const r = Array.from({ length: REEL_LEN }, () => pickFromCase(caseDef));
    r[REEL_WIN] = result;
    return r;
    // regenerate only when a new spin starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);
  const lastIdx = useRef(0);
  // land the winning row centered in the window
  const offset = REEL_WIN * ITEM_H + ITEM_H / 2 - REEL_H / 2;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-edge bg-bg/60"
      style={{ height: REEL_H }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-accent/40"
        style={{ height: ITEM_H }}
      />
      <motion.div
        key={spinKey}
        className="absolute inset-x-0 top-0"
        initial={{ y: 0 }}
        animate={{ y: -offset }}
        transition={{ duration: SPIN_MS / 1000, ease: [0.15, 0.85, 0.25, 1] }}
        onUpdate={(latest) => {
          if (!withSound || typeof latest.y !== "number") return;
          const idx = Math.floor(-latest.y / ITEM_H);
          if (idx !== lastIdx.current) {
            lastIdx.current = idx;
            sounds.tick();
          }
        }}
      >
        {reel.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{ height: ITEM_H }}
          >
            <SteamImage src={s.image} alt={s.name} size={52} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function BattlesClient() {
  const mounted = useMounted();
  const balance = useUserStore((s) => s.balance);
  const spendBalance = useUserStore((s) => s.spendBalance);
  const addSkins = useUserStore((s) => s.addSkins);
  const addRecord = useUserStore((s) => s.addRecord);

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("1v1");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [battle, setBattle] = useState<Battle | null>(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | "tie" | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<0 | 1 | null>(null);
  const [error, setError] = useState("");
  const awarded = useRef(false);

  const lobbies = useMemo<OpenLobby[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: 4 }, (_, i) => {
      const n = 1 + Math.floor(Math.random() * 3);
      const rounds = Array.from({ length: n }, () => randomOf(cases));
      return {
        id: i,
        creator: randomOf(botNames),
        mode: (Math.random() < 0.5 ? "1v1" : "2v2") as Mode,
        rounds,
        cost: Math.round(rounds.reduce((s, c) => s + c.price, 0) * 100) / 100,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const selectedRounds = useMemo(() => {
    const rounds: CaseDef[] = [];
    for (const c of cases) {
      const n = counts[c.id] ?? 0;
      for (let i = 0; i < n; i++) rounds.push(c);
    }
    return rounds;
  }, [counts]);
  const totalCost =
    Math.round(selectedRounds.reduce((s, c) => s + c.price, 0) * 100) / 100;
  const totalRounds = selectedRounds.length;

  function setCount(id: string, delta: number) {
    setCounts((c) => {
      const next = Math.max(0, Math.min(5, (c[id] ?? 0) + delta));
      return { ...c, [id]: next };
    });
  }

  function start(mode: Mode, rounds: CaseDef[], creatorBot?: string) {
    const cost = Math.round(rounds.reduce((s, c) => s + c.price, 0) * 100) / 100;
    if (rounds.length === 0) {
      setError("Add at least one case.");
      return;
    }
    if (!spendBalance(cost)) {
      setError("Not enough coins for this battle.");
      return;
    }
    setError("");
    awarded.current = false;
    sounds.spinStart();
    setBattle(buildBattle(mode, rounds, creatorBot));
    setRoundIdx(0);
    setRevealed(false);
    setResult(null);
    setWinnerTeam(null);
    setPhase("playing");
  }

  // round loop
  useEffect(() => {
    if (phase !== "playing" || !battle) return;
    if (roundIdx >= battle.rounds.length) {
      if (awarded.current) return;
      awarded.current = true;
      const teamTotal = (team: 0 | 1) =>
        sum(
          battle.players.flatMap((p, i) => (p.team === team ? battle.drops[i] : []))
        );
      const t0 = teamTotal(0);
      const t1 = teamTotal(1);
      const allItems = battle.drops.flat();
      const myItems = battle.players.flatMap((p, i) =>
        p.isYou ? battle.drops[i] : []
      );
      let profit: number;
      if (t0 > t1) {
        addSkins(allItems);
        profit = sum(allItems) - battle.cost;
        setResult("win");
        setWinnerTeam(0);
        sounds.win();
      } else if (t0 === t1) {
        addSkins(myItems);
        profit = sum(myItems) - battle.cost;
        setResult("tie");
        setWinnerTeam(null);
      } else {
        profit = -battle.cost;
        setResult("lose");
        setWinnerTeam(1);
        sounds.lose();
      }
      addRecord({
        game: "Battles",
        wager: battle.cost,
        profit: Math.round(profit * 100) / 100,
        detail: `${battle.mode} · ${battle.rounds.length} rounds`,
      });
      setPhase("done");
      return;
    }
    setRevealed(false);
    const t1 = setTimeout(() => setRevealed(true), REVEAL_MS);
    const t2 = setTimeout(() => setRoundIdx((i) => i + 1), ROUND_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, roundIdx, battle, addSkins, addRecord]);

  const revealedRounds = (playerRounds: Skin[]) =>
    playerRounds.slice(0, roundIdx + (revealed ? 1 : 0));

  if (phase !== "setup" && battle) {
    const currentCase =
      battle.rounds[Math.min(roundIdx, battle.rounds.length - 1)];
    const potSoFar = sum(
      battle.players.flatMap((_, i) => revealedRounds(battle.drops[i]))
    );
    const teamOf = (t: 0 | 1) =>
      battle.players.map((p, i) => ({ p, i })).filter(({ p }) => p.team === t);
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
            <Swords className="mr-2 inline text-accent" size={26} />
            {battle.mode} Battle
          </h1>
          <div className="flex items-center gap-4">
            {/* round progress dots */}
            <div className="flex items-center gap-1.5">
              {battle.rounds.map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < roundIdx
                      ? "bg-accent"
                      : i === roundIdx && phase === "playing"
                        ? "border border-accent bg-accent/40"
                        : "bg-edge"
                  }`}
                />
              ))}
            </div>
            <span className="flex items-center gap-1 rounded-xl border border-edge bg-surface px-3 py-1.5 text-sm font-bold tabular-nums">
              <Coins size={14} className="text-accent" />
              {formatCoins(potSoFar)}
              <span className="ml-1 text-[10px] font-normal uppercase text-zinc-500">
                pot
              </span>
            </span>
          </div>
        </div>

        {/* current round */}
        {phase === "playing" && roundIdx < battle.rounds.length && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-2.5">
            <CaseArt caseDef={currentCase} size={44} detail={false} />
            <p className="text-sm text-zinc-400">
              Round{" "}
              <span className="font-semibold text-zinc-100">
                {roundIdx + 1}/{battle.rounds.length}
              </span>{" "}
              — opening{" "}
              <span className="font-semibold" style={{ color: currentCase.color }}>
                {currentCase.name}
              </span>
            </p>
          </div>
        )}

        <div className={`mt-4 grid gap-4 ${battle.mode === "1v1" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
          {battle.players.map((p, i) => {
            const shown = revealedRounds(battle.drops[i]);
            const lastDrop = shown[shown.length - 1];
            const isWinner = phase === "done" && winnerTeam === p.team;
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  isWinner
                    ? "border-accent bg-accent-deep/15"
                    : p.isYou
                      ? "border-accent/60 bg-accent-deep/10"
                      : "border-edge bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {isWinner ? (
                      <Crown size={15} className="text-accent" />
                    ) : (
                      <User
                        size={14}
                        className={p.isYou ? "text-accent" : "text-zinc-500"}
                      />
                    )}
                    {p.name}
                  </p>
                  <span className="text-[10px] uppercase text-zinc-500">
                    Team {p.team + 1}
                  </span>
                </div>

                <div className="mt-3">
                  {phase === "playing" && roundIdx < battle.rounds.length ? (
                    <>
                      <VerticalReel
                        caseDef={currentCase}
                        result={battle.drops[i][roundIdx]}
                        spinKey={roundIdx}
                        withSound={p.isYou}
                      />
                      <div className="mt-1.5 h-8 text-center">
                        {revealed && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <p
                              className={`truncate text-[11px] ${rarityText[battle.drops[i][roundIdx].rarity]}`}
                            >
                              {battle.drops[i][roundIdx].name}
                            </p>
                            <p className="text-[11px] font-semibold text-zinc-300">
                              {formatCoins(battle.drops[i][roundIdx].price)}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center rounded-xl border border-edge bg-bg/60"
                      style={{ height: REEL_H + 38 }}
                    >
                      {lastDrop && (
                        <SteamImage
                          src={lastDrop.image}
                          alt={lastDrop.name}
                          size={56}
                        />
                      )}
                      <p className="mt-1 text-xs text-zinc-500">Battle over</p>
                    </div>
                  )}
                </div>

                <p className="mt-2 flex items-center justify-center gap-1 border-t border-edge pt-2 text-sm font-bold tabular-nums">
                  <Coins size={13} className="text-accent" />
                  {formatCoins(sum(shown))}
                </p>
                <div className="mt-2 flex min-h-7 flex-wrap justify-center gap-1">
                  {shown.map((s, j) => (
                    <SteamImage key={j} src={s.image} alt={s.name} size={26} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-edge bg-surface p-6 text-center"
          >
            <Crown
              size={32}
              className={`mx-auto ${result === "win" ? "text-accent" : "text-zinc-600"}`}
            />
            <p className="mt-2 font-heading text-2xl font-bold uppercase">
              {result === "win" && "You win the battle!"}
              {result === "lose" && "You lost the battle"}
              {result === "tie" && "Tie — everyone keeps their items"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {result === "win" &&
                `All ${battle.drops.flat().length} items (${formatCoins(sum(battle.drops.flat()))} coins) were added to your inventory.`}
              {result === "lose" && "Better luck next wipe."}
              {result === "tie" && "Your unboxed items were added to your inventory."}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => setPhase("setup")}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                New battle
              </button>
            </div>
          </motion.div>
        )}

        {/* team totals */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {([0, 1] as const).map((t) => (
            <div
              key={t}
              className={`rounded-xl border p-3 text-center ${
                phase === "done" && winnerTeam === t
                  ? "border-accent bg-accent-deep/15"
                  : "border-edge bg-surface"
              }`}
            >
              <p className="flex items-center justify-center gap-1.5 text-xs uppercase text-zinc-500">
                {phase === "done" && winnerTeam === t && (
                  <Crown size={12} className="text-accent" />
                )}
                Team {t + 1} {teamOf(t).some(({ p }) => p.isYou) && "(you)"}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 font-heading text-xl font-bold tabular-nums">
                <Coins size={16} className="text-accent" />
                {formatCoins(
                  sum(teamOf(t).flatMap(({ i }) => revealedRounds(battle.drops[i])))
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // setup phase
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <Swords className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Case Battles
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Everyone opens the same cases — the team with the most valuable loot
        takes everything.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-edge bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold uppercase">Create a battle</h2>
            <div className="flex gap-2">
              {(["1v1", "2v2"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    sounds.click();
                    setMode(m);
                  }}
                  className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors ${
                    mode === m
                      ? "bg-accent text-white"
                      : "border border-edge bg-surface2 text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cases.map((c) => {
              const n = counts[c.id] ?? 0;
              return (
                <div
                  key={c.id}
                  className={`flex flex-col items-center rounded-xl border p-3 ${
                    n > 0 ? "border-accent/60 bg-accent-deep/10" : "border-edge bg-surface2"
                  }`}
                >
                  <CaseArt caseDef={c} size={64} detail={false} />
                  <p className="mt-1 w-full truncate text-center text-xs font-semibold">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-zinc-500">{formatCoins(c.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setCount(c.id, -1)}
                      className="rounded-lg border border-edge p-1 text-zinc-400 hover:text-zinc-100"
                      aria-label={`Remove ${c.name}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold tabular-nums">{n}</span>
                    <button
                      onClick={() => setCount(c.id, 1)}
                      className="rounded-lg border border-edge p-1 text-zinc-400 hover:text-zinc-100"
                      aria-label={`Add ${c.name}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-edge pt-4">
            <button
              onClick={() => start(mode, selectedRounds)}
              disabled={totalRounds === 0 || (mounted && balance < totalCost)}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start {mode}
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Coins size={14} />
                {formatCoins(totalCost)}
              </span>
            </button>
            <p className="text-xs text-zinc-500">
              {totalRounds} round{totalRounds === 1 ? "" : "s"} selected
            </p>
            {totalRounds > 0 && (
              <button
                onClick={() => setCounts({})}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200"
              >
                <X size={12} /> clear
              </button>
            )}
            {error && <p className="text-sm text-rarity-covert">{error}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="font-heading text-xl font-bold uppercase">Open battles</h2>
          <div className="mt-3 flex flex-col gap-3">
            {lobbies.length === 0 && (
              <p className="text-sm text-zinc-500">Loading battles…</p>
            )}
            {lobbies.map((l) => (
              <div key={l.id} className="rounded-xl border border-edge bg-surface2 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{l.creator}</p>
                  <span className="rounded-md bg-bg px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                    {l.mode}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {l.rounds.map((c, i) => (
                    <CaseArt key={i} caseDef={c} size={36} detail={false} />
                  ))}
                  <span className="ml-1 text-[11px] text-zinc-500">
                    {l.rounds.length} round{l.rounds.length === 1 ? "" : "s"}
                  </span>
                </div>
                <button
                  onClick={() => start(l.mode, l.rounds, l.creator)}
                  disabled={mounted && balance < l.cost}
                  className="mt-2 w-full rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Join for {formatCoins(l.cost)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
