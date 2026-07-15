"use client";

import type { Rarity } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

// Small synthesized sound kit (WebAudio only — no audio assets).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!useUserStore.getState().soundOn) return null;
  try {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  {
    type = "sine",
    volume = 0.06,
    delay = 0,
    slideTo,
  }: {
    type?: OscillatorType;
    volume?: number;
    delay?: number;
    slideTo?: number;
  } = {}
) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

// note frequencies used by the little fanfares
const N = {
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
  C6: 1046.5,
  E6: 1318.5,
  G6: 1568,
};

let lastTick = 0;

export const sounds = {
  /** UI button press. */
  click: () => tone(680, 0.05, { type: "square", volume: 0.025 }),

  /** Reel card passing the marker — rate-limited so fast reels don't clip. */
  tick: () => {
    const now = Date.now();
    if (now - lastTick < 35) return;
    lastTick = now;
    tone(1150, 0.03, { type: "square", volume: 0.02 });
  },

  /** Safe tile in mines. */
  gem: () => tone(N.A5, 0.07, { type: "triangle", volume: 0.04 }),

  /** Coins credited (deposit button, marketplace sale). */
  coin: () => {
    tone(N.B5, 0.07, { type: "triangle", volume: 0.045 });
    tone(N.E6, 0.09, { type: "triangle", volume: 0.045, delay: 0.07 });
  },

  /** Cashout jingle. */
  cashout: () => {
    tone(N.B5, 0.08, { type: "triangle", volume: 0.05 });
    tone(N.E6, 0.08, { type: "triangle", volume: 0.05, delay: 0.08 });
    tone(N.G6, 0.16, { type: "triangle", volume: 0.05, delay: 0.16 });
  },

  /** Unboxing reveal — bigger fanfare for rarer items. */
  reveal: (rarity: Rarity) => {
    const runs: Record<Rarity, number[]> = {
      Consumer: [N.C5, N.E5],
      Industrial: [N.C5, N.E5, N.G5],
      Restricted: [N.C5, N.E5, N.G5, N.C6],
      Classified: [N.E5, N.G5, N.C6, N.E6],
      Covert: [N.G5, N.C6, N.E6, N.G6, N.C6, N.G6],
    };
    runs[rarity].forEach((f, i) =>
      tone(f, 0.12, { type: "triangle", volume: 0.05, delay: i * 0.09 })
    );
  },

  /** Generic win. */
  win: () => {
    tone(N.C5, 0.1, { type: "triangle", volume: 0.05 });
    tone(N.E5, 0.1, { type: "triangle", volume: 0.05, delay: 0.1 });
    tone(N.G5, 0.2, { type: "triangle", volume: 0.05, delay: 0.2 });
  },

  /** Generic loss. */
  lose: () => {
    tone(311, 0.14, { type: "sawtooth", volume: 0.035 });
    tone(208, 0.26, { type: "sawtooth", volume: 0.035, delay: 0.13 });
  },

  /** Mine explosion — low descending thud. */
  boom: () => {
    tone(180, 0.3, { type: "sawtooth", volume: 0.06, slideTo: 55 });
    tone(90, 0.35, { type: "square", volume: 0.04, slideTo: 40, delay: 0.02 });
  },

  /** Something starts spinning. */
  spinStart: () => tone(320, 0.12, { type: "square", volume: 0.03, slideTo: 520 }),
};
