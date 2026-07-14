import Link from "next/link";
import { Coins, Package } from "lucide-react";
import { cases } from "@/data/cases";
import { formatCoins } from "@/lib/format";
import SteamImage from "@/components/SteamImage";

export const metadata = { title: "Cases — RustFight" };

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-6xl">
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
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="group flex flex-col items-center rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-accent"
          >
            <SteamImage src={c.image} alt={c.name} size={110} />
            <p className="mt-3 font-heading text-lg font-bold group-hover:text-accent">
              {c.name}
            </p>
            <p className="text-center text-xs text-zinc-500">{c.tagline}</p>
            <p className="mt-2 flex items-center gap-1 rounded-lg bg-surface2 px-3 py-1 text-sm font-semibold">
              <Coins size={14} className="text-accent" />
              {formatCoins(c.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
