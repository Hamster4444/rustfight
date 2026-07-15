"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { skins } from "@/data/skins";
import { botNames } from "@/data/bots";
import type { Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import { randomOf } from "@/lib/rng";
import { rarityText } from "@/components/SkinCard";
import SteamImage from "@/components/SteamImage";

interface Drop {
  id: number;
  skin: Skin;
  player: string;
}

let dropId = 0;

/** Fake "live drops" feed — random skins unboxed by bots, updating live. */
export default function LiveDrops() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    setDrops(
      Array.from({ length: 12 }, () => ({
        id: dropId++,
        skin: randomOf(skins),
        player: randomOf(botNames),
      }))
    );
    const t = setInterval(() => {
      setDrops((d) =>
        [
          { id: dropId++, skin: randomOf(skins), player: randomOf(botNames) },
          ...d,
        ].slice(0, 12)
      );
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-xl border border-edge bg-surface p-3">
      <p className="flex items-center gap-2 px-1 pb-2 font-heading text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Radio size={13} className="text-accent" /> Live drops
      </p>
      <div className="flex gap-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {drops.map((d) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-32 shrink-0 flex-col items-center rounded-xl border border-edge bg-surface2 p-2"
              title={`${d.player} unboxed ${d.skin.name}`}
            >
              <SteamImage src={d.skin.image} alt={d.skin.name} size={56} />
              <p className="w-full truncate text-center text-[10px] text-zinc-300">
                {d.skin.name}
              </p>
              <p className={`text-[10px] font-semibold ${rarityText[d.skin.rarity]}`}>
                {formatCoins(d.skin.price)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {drops.length === 0 && (
          <p className="py-6 text-sm text-zinc-600">Loading drops…</p>
        )}
      </div>
    </div>
  );
}
