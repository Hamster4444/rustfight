"use client";

import { useUserStore } from "@/store/useUserStore";

// tiny WebAudio beeps — no external sound assets
let ctx: AudioContext | null = null;

function beep(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.06
) {
  if (typeof window === "undefined") return;
  if (!useUserStore.getState().soundOn) return;
  try {
    ctx = ctx ?? new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio unavailable — stay silent
  }
}

export const sounds = {
  click: () => beep(600, 0.06, "square", 0.03),
  tick: () => beep(880, 0.04, "square", 0.025),
  win: () => {
    beep(523, 0.12);
    setTimeout(() => beep(659, 0.12), 110);
    setTimeout(() => beep(784, 0.22), 220);
  },
  lose: () => {
    beep(311, 0.15, "sawtooth", 0.04);
    setTimeout(() => beep(208, 0.28, "sawtooth", 0.04), 140);
  },
};
