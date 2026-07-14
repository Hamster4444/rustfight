import { ShieldCheck } from "lucide-react";
import FairnessTable from "./FairnessTable";

export const metadata = { title: "Provably Fair — RustFight" };

export default function ProvablyFairPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Provably Fair
        </h1>
      </div>
      <div className="mt-4 rounded-xl border border-edge bg-surface p-6 text-sm leading-relaxed text-zinc-400">
        <p>
          On a real provably-fair site, every round outcome is derived from a{" "}
          <span className="font-semibold text-zinc-200">server seed</span>{" "}
          (hashed and shown before the round), a{" "}
          <span className="font-semibold text-zinc-200">client seed</span> you
          control, and an incrementing{" "}
          <span className="font-semibold text-zinc-200">nonce</span>. After the
          round, the server seed is revealed so you can recompute the result
          and verify nothing was tampered with.
        </p>
        <p className="mt-3 rounded-xl border border-edge bg-surface2 p-3 text-xs">
          <span className="font-bold text-accent">Demo note:</span> RustFight
          is a prototype — outcomes come from your browser&apos;s random number
          generator and the hashes below are mock values for illustration only.
        </p>
      </div>
      <FairnessTable />
    </div>
  );
}
