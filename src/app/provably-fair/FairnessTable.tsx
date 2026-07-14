"use client";

import { useEffect, useState } from "react";
import { randomHash } from "@/lib/rng";
import { randomOf } from "@/lib/rng";

interface MockRound {
  id: number;
  game: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  result: string;
}

const games = ["Cases", "Coinflip", "Mines", "Jackpot", "Upgrader", "Battles"];

export default function FairnessTable() {
  const [rounds, setRounds] = useState<MockRound[]>([]);

  useEffect(() => {
    setRounds(
      Array.from({ length: 10 }, (_, i) => ({
        id: 48120 - i,
        game: randomOf(games),
        serverSeedHash: randomHash(64),
        clientSeed: randomHash(16),
        nonce: Math.floor(Math.random() * 5000),
        result: (Math.random() * 100).toFixed(4),
      }))
    );
  }, []);

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-edge bg-surface">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b border-edge uppercase text-zinc-500">
            <th className="px-4 py-3">Round</th>
            <th className="px-4 py-3">Game</th>
            <th className="px-4 py-3">Server seed (SHA-256)</th>
            <th className="px-4 py-3">Client seed</th>
            <th className="px-4 py-3 text-right">Nonce</th>
            <th className="px-4 py-3 text-right">Roll</th>
          </tr>
        </thead>
        <tbody>
          {rounds.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                Generating mock rounds…
              </td>
            </tr>
          ) : (
            rounds.map((r) => (
              <tr key={r.id} className="border-b border-edge/50 font-mono last:border-0">
                <td className="px-4 py-2.5 text-zinc-400">#{r.id}</td>
                <td className="px-4 py-2.5 font-sans font-semibold">{r.game}</td>
                <td className="max-w-56 truncate px-4 py-2.5 text-zinc-500" title={r.serverSeedHash}>
                  {r.serverSeedHash}
                </td>
                <td className="px-4 py-2.5 text-zinc-500">{r.clientSeed}</td>
                <td className="px-4 py-2.5 text-right text-zinc-400">{r.nonce}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-accent">
                  {r.result}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
