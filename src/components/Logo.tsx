import { Swords } from "lucide-react";

interface LogoProps {
  size?: "sm" | "lg";
  /** Render only the square mark without the wordmark. */
  markOnly?: boolean;
  /** Hide the wordmark on very narrow screens (used in the top bar). */
  responsive?: boolean;
}

/** Site logo: flat purple mark + Rajdhani wordmark. Pure type + lucide icon. */
export default function Logo({
  size = "sm",
  markOnly = false,
  responsive = false,
}: LogoProps) {
  const mark = (
    <span
      className={`flex items-center justify-center rounded-lg bg-accent ${
        size === "lg" ? "h-12 w-12 rounded-xl" : "h-8 w-8"
      }`}
    >
      <Swords
        size={size === "lg" ? 26 : 18}
        strokeWidth={2.25}
        className="text-white"
      />
    </span>
  );
  if (markOnly) return mark;
  return (
    <span className="flex items-center gap-2.5">
      {mark}
      <span
        className={`font-heading font-bold leading-none tracking-wide ${
          size === "lg" ? "text-5xl sm:text-6xl" : "text-2xl"
        } ${responsive ? "hidden min-[520px]:inline" : ""}`}
      >
        <span className="text-accent">RUST</span>
        <span className="text-zinc-100">FIGHT</span>
      </span>
    </span>
  );
}
