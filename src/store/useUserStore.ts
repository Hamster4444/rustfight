"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameRecord, InventoryItem, Skin } from "@/lib/types";
import { uid } from "@/lib/format";

interface UserState {
  signedIn: boolean;
  username: string;
  balance: number;
  inventory: InventoryItem[];
  history: GameRecord[];
  soundOn: boolean;
  ageConfirmed: boolean;

  signIn: () => void;
  signOut: () => void;
  addBalance: (amount: number) => void;
  /** Returns false (and does nothing) if the balance can't cover it. */
  spendBalance: (amount: number) => boolean;
  addSkins: (skins: Skin[]) => InventoryItem[];
  removeItems: (uids: string[]) => void;
  addRecord: (record: Omit<GameRecord, "id" | "timestamp">) => void;
  toggleSound: () => void;
  confirmAge: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      signedIn: false,
      username: "Survivor",
      balance: 5000,
      inventory: [],
      history: [],
      soundOn: true,
      ageConfirmed: false,

      signIn: () => set({ signedIn: true, username: "Survivor#4921" }),
      signOut: () => set({ signedIn: false, username: "Survivor" }),

      addBalance: (amount) =>
        set((s) => ({ balance: Math.round((s.balance + amount) * 100) / 100 })),

      spendBalance: (amount) => {
        if (get().balance < amount) return false;
        set((s) => ({ balance: Math.round((s.balance - amount) * 100) / 100 }));
        return true;
      },

      addSkins: (skins) => {
        const items = skins.map((skin) => ({
          uid: uid("inv"),
          skin,
          acquiredAt: Date.now(),
        }));
        set((s) => ({ inventory: [...items, ...s.inventory] }));
        return items;
      },

      removeItems: (uids) =>
        set((s) => ({
          inventory: s.inventory.filter((it) => !uids.includes(it.uid)),
        })),

      addRecord: (record) =>
        set((s) => ({
          history: [
            { ...record, id: uid("rec"), timestamp: Date.now() },
            ...s.history,
          ].slice(0, 200),
        })),

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      confirmAge: () => set({ ageConfirmed: true }),
    }),
    { name: "rustfight-user" }
  )
);
