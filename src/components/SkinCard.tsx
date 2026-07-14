"use client";

import { Coins } from "lucide-react";
import type { Rarity, Skin } from "@/lib/types";
import { formatCoins } from "@/lib/format";
import SteamImage from "./SteamImage";

export const rarityBorder: Record<Rarity, string> = {
  Consumer: "border-rarity-consumer/60",
  Industrial: "border-rarity-industrial/60",
  Restricted: "border-rarity-restricted/60",
  Classified: "border-rarity-classified/60",
  Covert: "border-rarity-covert/60",
};

export const rarityText: Record<Rarity, string> = {
  Consumer: "text-rarity-consumer",
  Industrial: "text-rarity-industrial",
  Restricted: "text-rarity-restricted",
  Classified: "text-rarity-classified",
  Covert: "text-rarity-covert",
};

interface SkinCardProps {
  skin: Skin;
  size?: "sm" | "md";
  selected?: boolean;
  onClick?: () => void;
  showPrice?: boolean;
}

export default function SkinCard({
  skin,
  size = "md",
  selected = false,
  onClick,
  showPrice = true,
}: SkinCardProps) {
  const imgPx = size === "sm" ? 64 : 96;

  const inner = (
    <>
      <div className="flex items-center justify-center">
        <SteamImage src={skin.image} alt={skin.name} size={imgPx} />
      </div>
      <p
        className={`w-full truncate text-center font-medium text-zinc-200 ${
          size === "sm" ? "text-[11px]" : "text-xs"
        }`}
        title={skin.name}
      >
        {skin.name}
      </p>
      <p className={`text-center text-[10px] ${rarityText[skin.rarity]}`}>
        {skin.rarity}
      </p>
      {showPrice && (
        <p className="flex items-center justify-center gap-1 text-xs font-semibold text-zinc-300">
          <Coins size={12} className="text-accent" />
          {formatCoins(skin.price)}
        </p>
      )}
    </>
  );

  const classes = `flex flex-col gap-1 rounded-xl border-2 bg-surface p-2 ${
    selected ? "border-accent bg-accent-deep/20" : rarityBorder[skin.rarity]
  } ${onClick ? "cursor-pointer transition-colors hover:bg-surface2" : ""} ${
    size === "sm" ? "w-28" : "w-36"
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {inner}
      </button>
    );
  }
  return <div className={classes}>{inner}</div>;
}
