import {
  Crosshair,
  DoorClosed,
  Flame,
  Footprints,
  Gem,
  Recycle,
  Ruler,
  Shield,
  Shirt,
  Skull,
  Swords,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CaseDef, CaseIcon } from "@/data/cases";
import SteamImage from "./SteamImage";

const caseIcons: Record<CaseIcon, LucideIcon> = {
  crosshair: Crosshair,
  shield: Shield,
  shirt: Shirt,
  door: DoorClosed,
  footprints: Footprints,
  ruler: Ruler,
  gem: Gem,
  recycle: Recycle,
  skull: Skull,
  zap: Zap,
  flame: Flame,
  swords: Swords,
};

interface CaseArtProps {
  caseDef: CaseDef;
  size?: number;
  /** Full crate design (strap, rivets, name plate). Falls back to a simple
   *  tinted box below 96px where the details would be unreadable. */
  detail?: boolean;
}

/** Flat "crate" artwork composed from the case identity color, its lucide
 *  icon and real Steam skin images — no custom SVG artwork. */
export default function CaseArt({
  caseDef,
  size = 128,
  detail = true,
}: CaseArtProps) {
  const Icon = caseIcons[caseDef.icon];

  if (!detail || size < 96) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg border"
        style={{
          width: size,
          height: size,
          borderColor: caseDef.color + "66",
          backgroundColor: caseDef.color + "14",
        }}
        title={caseDef.name}
      >
        <SteamImage
          src={caseDef.image}
          alt={caseDef.name}
          size={Math.round(size * 0.78)}
        />
      </div>
    );
  }

  const sorted = [...caseDef.pool].sort((a, b) => b.skin.price - a.skin.price);
  const side = [sorted[1]?.skin, sorted[2]?.skin].filter(Boolean);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border-2"
      style={{
        width: size,
        height: size,
        borderColor: caseDef.color + "59",
        backgroundColor: caseDef.color + "0f",
      }}
      title={caseDef.name}
    >
      {/* top strap with icon + rivets */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between"
        style={{
          height: "19%",
          paddingLeft: "8%",
          paddingRight: "8%",
          backgroundColor: caseDef.color + "26",
          borderBottom: `1px solid ${caseDef.color}40`,
        }}
      >
        <Icon
          style={{
            color: caseDef.color,
            width: size * 0.11,
            height: size * 0.11,
          }}
        />
        <span className="flex items-center" style={{ gap: size * 0.045 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: size * 0.035,
                height: size * 0.035,
                backgroundColor: caseDef.color + "80",
              }}
            />
          ))}
        </span>
      </div>

      {/* faded side items behind the flagship */}
      {side[0] && (
        <div
          className="absolute opacity-35"
          style={{ left: "4%", bottom: "18%" }}
        >
          <SteamImage
            src={side[0].image}
            alt={side[0].name}
            size={Math.round(size * 0.3)}
          />
        </div>
      )}
      {side[1] && (
        <div
          className="absolute opacity-35"
          style={{ right: "4%", bottom: "18%" }}
        >
          <SteamImage
            src={side[1].image}
            alt={side[1].name}
            size={Math.round(size * 0.3)}
          />
        </div>
      )}

      {/* flagship item */}
      <div className="absolute inset-0 flex items-center justify-center pt-[6%]">
        <SteamImage
          src={caseDef.image}
          alt={caseDef.name}
          size={Math.round(size * 0.52)}
        />
      </div>

      {/* bottom name plate */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-bg/80"
        style={{ height: "17%", borderTop: `1px solid ${caseDef.color}40` }}
      >
        <p
          className="truncate px-1 font-heading font-bold uppercase tracking-wider text-zinc-200"
          style={{ fontSize: Math.max(9, size * 0.075) }}
        >
          {caseDef.name}
        </p>
      </div>
    </div>
  );
}
