import Link from "next/link";
import { gameNav } from "@/components/layout/navItems";

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
  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-xl border border-edge bg-surface p-8 sm:p-12">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          <span className="text-accent">RUST</span>FIGHT
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Open cases, battle other players and upgrade your Rust skins. This is
          a demo build — everything runs on simulated coins, so play as much as
          you like.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/cases"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Open Cases
          </Link>
          <Link
            href="/battles"
            className="rounded-xl border border-edge bg-surface2 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-accent"
          >
            Join a Battle
          </Link>
        </div>
      </section>

      <h2 className="mt-10 font-heading text-2xl font-bold uppercase tracking-wide">
        Games
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.href}
              href={game.href}
              className="group rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-deep/30 text-accent">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold group-hover:text-accent">
                    {game.label}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {gameDescriptions[game.href]}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
