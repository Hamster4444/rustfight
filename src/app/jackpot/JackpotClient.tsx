"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Coins, Trophy, User } from "lucide-react";
import { skins } from "@/data/skins";
import { botNames } from "@/data/bots";
import type { Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { randomOf } from "@/lib/rng";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { sounds } from "@/lib/sounds";
import SkinCard from "@/components/SkinCard";
import SteamImage from "@/components/SteamImage";

const ROUND_SECONDS = 25;
const MAX_BOTS = 5;
const REEL_SIZE = 55;
const WIN_INDEX = 47;
const ENTRY_PITCH = 104; // w-24 (96px) + 8px gap

const entryColors = [
  "#8b5cf6",
  "#6d28d9",
  "#a78bfa",
  "#4c1d95",
  "#52525b",
  "#3f3f46",
  "#7c3aed",
];

interface Participant {
  name: string;
  isYou: boolean;
  items: Skin[];
  color: string;
}

interface HistoryRound {
  id: number;
  winner: string;
  pot: number;
  chance: number;
  youWon: boolean;
}

const value = (items: Skin[]) =>
  Math.round(items.reduce((s, k) => s + k.price, 0) * 100) / 100;

export default function JackpotClient() {
  const mounted = useMounted();
  const inventory = useUserStore((s) => s.inventory);
  const removeItems = useUserStore((s) => s.removeItems);
  const addSkins = useUserStore((s) => s.addSkins);
  const addRecord = useUserStore((s) => s.addRecord);

  const [phase, setPhase] = useState<"open" | "spinning" | "done">("open");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [selected, setSelected] = useState<string[]>([]);
  const [reel, setReel] = useState<Participant[]>([]);
  const [offset, setOffset] = useState(0);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [history, setHistory] = useState<HistoryRound[]>([]);
  const reelRef = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  const roundId = useRef(1);

  const pot = value(participants.flatMap((p) => p.items));
  const you = participants.find((p) => p.isYou);
  const yourValue = you ? value(you.items) : 0;
  const yourChance = pot > 0 ? yourValue / pot : 0;

  // countdown
  useEffect(() => {
    if (phase !== "open") return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // bots join while the round is open
  useEffect(() => {
    if (phase !== "open") return;
    const t = setInterval(() => {
      setParticipants((ps) => {
        const bots = ps.filter((p) => !p.isYou);
        if (bots.length >= MAX_BOTS) return ps;
        const name = randomOf(
          botNames.filter((b) => !ps.some((p) => p.name === b))
        );
        const items = Array.from(
          { length: 1 + Math.floor(Math.random() * 3) },
          () => randomOf(skins)
        );
        return [
          ...ps,
          {
            name,
            isYou: false,
            items,
            color: entryColors[ps.length % entryColors.length],
          },
        ];
      });
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, [phase]);

  const beginSpin = useCallback(() => {
    const ps = participants;
    if (ps.length < 2) {
      setSeconds(ROUND_SECONDS); // not enough players — restart timer
      return;
    }
    const total = value(ps.flatMap((p) => p.items));
    // ticket-weighted winner
    let roll = Math.random() * total;
    let win = ps[ps.length - 1];
    for (const p of ps) {
      roll -= value(p.items);
      if (roll <= 0) {
        win = p;
        break;
      }
    }
    const strip = Array.from({ length: REEL_SIZE }, () => {
      let r = Math.random() * total;
      for (const p of ps) {
        r -= value(p.items);
        if (r <= 0) return p;
      }
      return ps[ps.length - 1];
    });
    strip[WIN_INDEX] = win;
    const width = reelRef.current?.clientWidth ?? 700;
    setReel(strip);
    setOffset(WIN_INDEX * ENTRY_PITCH + 48 - width / 2 + (Math.random() - 0.5) * 60);
    setWinner(win);
    settled.current = false;
    setPhase("spinning");
  }, [participants]);

  useEffect(() => {
    if (phase === "open" && seconds <= 0) beginSpin();
  }, [phase, seconds, beginSpin]);

  function onSpinDone() {
    if (settled.current || !winner) return;
    settled.current = true;
    const allItems = participants.flatMap((p) => p.items);
    const potValue = value(allItems);
    const winChance = potValue > 0 ? value(winner.items) / potValue : 0;

    if (winner.isYou) {
      addSkins(allItems);
      sounds.win();
    } else if (you) {
      sounds.lose();
    }
    if (you) {
      addRecord({
        game: "Jackpot",
        wager: yourValue,
        profit: winner.isYou
          ? Math.round((potValue - yourValue) * 100) / 100
          : -yourValue,
        detail: winner.isYou
          ? `Won the ${formatCoins(potValue)} pot`
          : `${winner.name} won the ${formatCoins(potValue)} pot`,
      });
    }
    setHistory((h) =>
      [
        {
          id: roundId.current++,
          winner: winner.name,
          pot: potValue,
          chance: winChance,
          youWon: winner.isYou,
        },
        ...h,
      ].slice(0, 10)
    );
    setPhase("done");
    setTimeout(() => {
      setParticipants([]);
      setSelected([]);
      setWinner(null);
      setReel([]);
      setSeconds(ROUND_SECONDS);
      setPhase("open");
    }, 4000);
  }

  function deposit() {
    if (phase !== "open" || selected.length === 0) return;
    const items = inventory
      .filter((it) => selected.includes(it.uid))
      .map((it) => it.skin);
    removeItems(selected);
    setSelected([]);
    setParticipants((ps) => {
      const existing = ps.find((p) => p.isYou);
      if (existing) {
        return ps.map((p) =>
          p.isYou ? { ...p, items: [...p.items, ...items] } : p
        );
      }
      return [
        ...ps,
        {
          name: "You",
          isYou: true,
          items,
          color: "#c4b5fd",
        },
      ];
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <Trophy className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Jackpot
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Deposit skins into the pot — more value means more tickets. One winner
        takes everything.
      </p>

      {/* pot header */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-edge bg-surface p-4 text-center">
          <p className="text-xs uppercase text-zinc-500">Pot value</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-heading text-2xl font-bold tabular-nums">
            <Coins size={18} className="text-accent" />
            {formatCoins(pot)}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-surface p-4 text-center">
          <p className="text-xs uppercase text-zinc-500">
            {phase === "open" ? "Drawing in" : "Round status"}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 font-heading text-2xl font-bold tabular-nums">
            <Clock size={18} className="text-accent" />
            {phase === "open" ? `${Math.max(seconds, 0)}s` : phase === "spinning" ? "Rolling…" : "Done"}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-surface p-4 text-center">
          <p className="text-xs uppercase text-zinc-500">Your chance</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-accent">
            {(yourChance * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* winner reel */}
      <div
        ref={reelRef}
        className="relative mt-4 h-28 overflow-hidden rounded-xl border border-edge bg-surface"
      >
        <div className="absolute left-1/2 top-0 z-10 h-full w-0.5 -translate-x-1/2 bg-accent" />
        {phase === "open" ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-zinc-500">
            {participants.length < 2
              ? "Waiting for players to deposit…"
              : "Round closes soon — winner will be drawn here."}
          </div>
        ) : (
          <motion.div
            className="absolute top-1/2 flex -translate-y-1/2 gap-2 pl-2"
            initial={{ x: 0 }}
            animate={{ x: -offset }}
            transition={{ duration: 5, ease: [0.15, 0.85, 0.25, 1] }}
            onAnimationComplete={onSpinDone}
          >
            {reel.map((p, i) => (
              <div
                key={i}
                className="flex h-20 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-edge"
                style={{ backgroundColor: p.color + "33" }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full font-heading text-sm font-bold text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name[0]}
                </span>
                <p className="mt-1 w-20 truncate text-center text-[10px] text-zinc-300">
                  {p.name}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {phase === "done" && winner && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 text-center font-heading text-xl font-bold uppercase ${
            winner.isYou ? "text-accent" : "text-zinc-300"
          }`}
        >
          {winner.isYou
            ? `You won the ${formatCoins(pot)} pot!`
            : `${winner.name} takes the ${formatCoins(pot)} pot`}
        </motion.p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* participants */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="font-heading text-lg font-bold uppercase">
            Players ({participants.length})
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {participants.length === 0 && (
              <p className="text-sm text-zinc-500">No deposits yet.</p>
            )}
            {participants.map((p, i) => {
              const v = value(p.items);
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 ${
                    p.isYou ? "border-accent/60 bg-accent-deep/10" : "border-edge bg-surface2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </p>
                    <p className="text-xs tabular-nums text-zinc-400">
                      {formatCoins(v)} ·{" "}
                      {pot > 0 ? ((v / pot) * 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.items.map((s, j) => (
                      <SteamImage key={j} src={s.image} alt={s.name} size={26} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* your deposit */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="font-heading text-lg font-bold uppercase">
            Deposit skins
          </h2>
          <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {!mounted ? (
              <p className="col-span-full text-sm text-zinc-500">Loading…</p>
            ) : inventory.length === 0 ? (
              <div className="col-span-full py-6 text-center">
                <User className="mx-auto text-zinc-600" size={28} />
                <p className="mt-2 text-sm text-zinc-500">
                  No skins to deposit.
                </p>
                <Link
                  href="/cases"
                  className="mt-1 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
                >
                  Unbox some →
                </Link>
              </div>
            ) : (
              inventory.map((it) => (
                <SkinCard
                  key={it.uid}
                  skin={it.skin}
                  size="sm"
                  selected={selected.includes(it.uid)}
                  onClick={() =>
                    setSelected((s) =>
                      s.includes(it.uid)
                        ? s.filter((x) => x !== it.uid)
                        : [...s, it.uid]
                    )
                  }
                />
              ))
            )}
          </div>
          <button
            onClick={deposit}
            disabled={phase !== "open" || selected.length === 0}
            className="mt-3 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deposit {selected.length} item{selected.length === 1 ? "" : "s"}
          </button>
        </div>

        {/* history */}
        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="font-heading text-lg font-bold uppercase">
            Round history
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {history.length === 0 && (
              <p className="text-sm text-zinc-500">
                No rounds finished yet this session.
              </p>
            )}
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-edge bg-surface2 px-3 py-2 text-sm"
              >
                <span className={h.youWon ? "font-bold text-accent" : ""}>
                  {h.winner}
                </span>
                <span className="text-xs text-zinc-500">
                  {(h.chance * 100).toFixed(0)}% ·{" "}
                  <span className="font-semibold text-zinc-300">
                    {formatCoins(h.pot)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
