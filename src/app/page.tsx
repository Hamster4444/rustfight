import Link from "next/link";
import { Coins, Package, Swords, Users } from "lucide-react";
import { gameNav } from "@/components/layout/navItems";
import { skins } from "@/data/skins";
import { cases } from "@/data/cases";
import { formatCoins } from "@/lib/format";
import SteamImage from "@/components/SteamImage";
import LiveDrops from "@/components/LiveDrops";
import CaseArt from "@/components/CaseArt";
import Logo from "@/components/Logo";

const gameDescriptions: Record<string, string> = {
  "/cases": "Open themed cases and unbox Rust skins",
  "/battles": "Race case openings against other players",
  "/coinflip": "50/50 flips — winner takes the pot",
  "/upgrader": "Trade up your skins for something better",
  "/mines": "Dodge the mines, grow your multiplier",
  "/jackpot": "Deposit skins, one winner takes it all",
  "/marketplace": "Buy and sell skins with your coins",
};

export default function HomePage() {
  const games = gameNav.filter((g) => g.href !== "/");
  const topSkins = skins.slice(0, 4); // skins.ts is sorted by price desc

  const stats = [
    { label: "Rust skins", value: String(skins.length), icon: Package },
    { label: "Cases to open", value: String(cases.length), icon: Swords },
    {
      label: "Top item value",
      value: formatCoins(skins[0]?.price ?? 0),
      icon: Coins,
    },
    { label: "Players online", value: "1,337", icon: Users },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <LiveDrops />

      {/* hero with skin collage */}
      <section className="mt-6 flex items-center justify-between gap-6 overflow-hidden rounded-xl border border-edge bg-surface p-8 sm:p-12">
        <div className="max-w-xl">
          <h1>
            <Logo size="lg" />
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Open cases, battle other players and upgrade your Rust skins. This
            is a demo build — everything runs on simulated coins, so play as
            much as you like.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cases"
              className="rounded-xl bg-accent px-7 py-3.5 font-heading text-lg font-bold text-white transition-colors hover:bg-accent-hover"
            >
              Open Cases
            </Link>
            <Link
              href="/battles"
              className="rounded-xl border border-edge bg-surface2 px-7 py-3.5 font-heading text-lg font-bold text-zinc-200 transition-colors hover:border-accent"
            >
              Join a Battle
            </Link>
          </div>
        </div>
        <div className="hidden shrink-0 grid-cols-2 gap-4 md:grid">
          {topSkins.map((s, i) => (
            <div
              key={s.id}
              className={`rounded-xl border border-edge bg-surface2 p-3 ${
                i % 2 === 1 ? "translate-y-4" : ""
              }`}
              title={s.name}
            >
              <SteamImage src={s.image} alt={s.name} size={110} />
            </div>
          ))}
        </div>
      </section>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl border border-edge bg-surface p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-deep/30 text-accent">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-heading text-2xl font-bold tabular-nums">
                  {s.value}
                </p>
                <p className="text-xs uppercase text-zinc-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* games */}
      <h2 className="mt-10 font-heading text-2xl font-bold uppercase tracking-wide">
        Games
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game, gi) => {
          const Icon = game.icon;
          // deterministic per-tile skin previews (varied, no client randomness)
          const preview = [
            skins[(gi * 7 + 2) % skins.length],
            skins[(gi * 7 + 9) % skins.length],
            skins[(gi * 7 + 16) % skins.length],
          ];
          return (
            <Link
              key={game.href}
              href={game.href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-edge bg-surface p-6 transition-colors hover:border-accent"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-deep/30 text-accent">
                  <Icon size={24} />
                </span>
                <div>
                  <p className="font-heading text-xl font-bold group-hover:text-accent">
                    {game.label}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {gameDescriptions[game.href]}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 -space-x-3 xl:flex">
                {preview.map((s, i) => (
                  <span
                    key={i}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-surface2"
                  >
                    <SteamImage src={s.image} alt={s.name} size={36} />
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {/* featured cases strip */}
      <h2 className="mt-10 font-heading text-2xl font-bold uppercase tracking-wide">
        Featured cases
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="group flex flex-col items-center rounded-xl border border-edge bg-surface p-4 transition-colors hover:border-accent"
          >
            <CaseArt caseDef={c} size={104} />
            <p className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-accent">
              <Coins size={10} className="text-accent" />
              {formatCoins(c.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
