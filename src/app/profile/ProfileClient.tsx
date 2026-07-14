"use client";

import Link from "next/link";
import { Coins, Gamepad2, Package, TrendingDown, TrendingUp, User } from "lucide-react";
import { formatCoins } from "@/lib/format";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import SkinCard from "@/components/SkinCard";

export default function ProfileClient() {
  const mounted = useMounted();
  const username = useUserStore((s) => s.username);
  const balance = useUserStore((s) => s.balance);
  const inventory = useUserStore((s) => s.inventory);
  const history = useUserStore((s) => s.history);

  if (!mounted) {
    return <p className="text-sm text-zinc-500">Loading profile…</p>;
  }

  const invValue =
    Math.round(inventory.reduce((s, it) => s + it.skin.price, 0) * 100) / 100;
  const totalWagered =
    Math.round(history.reduce((s, r) => s + r.wager, 0) * 100) / 100;
  const netProfit =
    Math.round(history.reduce((s, r) => s + r.profit, 0) * 100) / 100;
  const biggestWin = history.reduce((m, r) => Math.max(m, r.profit), 0);

  const stats = [
    { label: "Balance", value: formatCoins(balance), icon: Coins },
    { label: "Inventory value", value: formatCoins(invValue), icon: Package },
    { label: "Games played", value: String(history.length), icon: Gamepad2 },
    { label: "Total wagered", value: formatCoins(totalWagered), icon: Coins },
    {
      label: "Net profit",
      value: `${netProfit >= 0 ? "+" : ""}${formatCoins(netProfit)}`,
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      accent: netProfit >= 0,
    },
    { label: "Biggest win", value: `+${formatCoins(biggestWin)}`, icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface2">
          <User size={22} className="text-accent" />
        </span>
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
            {username}
          </h1>
          <p className="text-xs text-zinc-500">Demo account</p>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-edge bg-surface p-4 text-center"
            >
              <Icon
                size={18}
                className={`mx-auto ${
                  s.accent === false ? "text-rarity-covert" : "text-accent"
                }`}
              />
              <p className="mt-2 font-heading text-lg font-bold tabular-nums">
                {s.value}
              </p>
              <p className="text-[10px] uppercase text-zinc-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* inventory */}
      <h2 className="mt-10 font-heading text-xl font-bold uppercase tracking-wide">
        Inventory ({inventory.length})
      </h2>
      {inventory.length === 0 ? (
        <div className="mt-3 rounded-xl border border-edge bg-surface py-10 text-center">
          <Package className="mx-auto text-zinc-600" size={28} />
          <p className="mt-2 text-sm text-zinc-500">No skins yet.</p>
          <Link
            href="/cases"
            className="mt-1 inline-block text-sm font-semibold text-accent hover:text-accent-hover"
          >
            Open your first case →
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-3">
          {inventory.map((it) => (
            <SkinCard key={it.uid} skin={it.skin} size="sm" />
          ))}
        </div>
      )}

      {/* history */}
      <h2 className="mt-10 font-heading text-xl font-bold uppercase tracking-wide">
        Game history
      </h2>
      {history.length === 0 ? (
        <div className="mt-3 rounded-xl border border-edge bg-surface py-10 text-center">
          <Gamepad2 className="mx-auto text-zinc-600" size={28} />
          <p className="mt-2 text-sm text-zinc-500">
            You haven&apos;t played any games yet.
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-edge bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge text-xs uppercase text-zinc-500">
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3 text-right">Wager</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 50).map((r) => (
                <tr key={r.id} className="border-b border-edge/50 last:border-0">
                  <td className="px-4 py-2.5 font-semibold">{r.game}</td>
                  <td className="max-w-64 truncate px-4 py-2.5 text-zinc-400">
                    {r.detail}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatCoins(r.wager)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                      r.profit >= 0 ? "text-accent" : "text-rarity-covert"
                    }`}
                  >
                    {r.profit >= 0 ? "+" : ""}
                    {formatCoins(r.profit)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-zinc-500">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
