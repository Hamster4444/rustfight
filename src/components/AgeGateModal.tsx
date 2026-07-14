"use client";

import { ShieldAlert } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";

export default function AgeGateModal() {
  const mounted = useMounted();
  const ageConfirmed = useUserStore((s) => s.ageConfirmed);
  const confirmAge = useUserStore((s) => s.confirmAge);

  if (!mounted || ageConfirmed) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-md rounded-xl border border-edge bg-surface p-6 text-center">
        <ShieldAlert className="mx-auto text-accent" size={36} />
        <h2 className="mt-3 font-heading text-2xl font-bold uppercase">
          18+ only
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          RustFight is a <span className="font-semibold text-zinc-200">demo
          project</span> that simulates skin-gambling mechanics with fake coins.
          No real money or items are involved — but the content is intended for
          adults. Please confirm you are 18 or older.
        </p>
        <div className="mt-5 flex gap-3">
          <a
            href="https://www.google.com"
            className="flex-1 rounded-xl border border-edge bg-surface2 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-accent"
          >
            I&apos;m under 18
          </a>
          <button
            onClick={confirmAge}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            I&apos;m 18 or older
          </button>
        </div>
      </div>
    </div>
  );
}
