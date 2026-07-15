import Link from "next/link";
import { Coins, Package } from "lucide-react";
import { cases } from "@/data/cases";
import { formatCoins } from "@/lib/format";
import CaseArt from "@/components/CaseArt";

export const metadata = { title: "Cases — RustFight" };

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <Package className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Cases
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Pick a case, spin the reel, keep what you unbox.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cases.map((c) => {
          const topItems = [...c.pool]
            .sort((a, b) => b.skin.price - a.skin.price)
            .slice(0, 3);
          return (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="group flex flex-col items-center rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-accent"
            >
              <CaseArt caseDef={c} size={168} />
              <p className="mt-3 text-center text-xs text-zinc-500">
                {c.tagline}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                <span>{c.pool.length} items</span>
                <span className="text-zinc-700">·</span>
                <span>
                  top item {formatCoins(topItems[0]?.skin.price ?? 0)}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1 rounded-lg bg-surface2 px-3 py-1 text-sm font-semibold group-hover:text-accent">
                <Coins size={14} className="text-accent" />
                {formatCoins(c.price)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
