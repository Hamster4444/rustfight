"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, LogOut, Menu, Plus, User, Volume2, VolumeX, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";
import { formatCoins } from "@/lib/format";
import { gameNav, otherNav } from "./navItems";

function BalanceChip() {
  const balance = useUserStore((s) => s.balance);
  const addBalance = useUserStore((s) => s.addBalance);
  const mounted = useMounted();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-edge bg-surface2 pl-3 pr-1 py-1">
      <Coins size={16} className="text-accent" />
      <span className="text-sm font-semibold tabular-nums">
        {mounted ? formatCoins(balance) : "—"}
      </span>
      <button
        onClick={() => addBalance(1000)}
        title="Add 1,000 demo coins"
        className="ml-1 rounded-lg bg-accent p-1.5 text-white transition-colors hover:bg-accent-hover"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function SoundToggle() {
  const soundOn = useUserStore((s) => s.soundOn);
  const toggleSound = useUserStore((s) => s.toggleSound);
  const mounted = useMounted();
  return (
    <button
      onClick={toggleSound}
      title={mounted && !soundOn ? "Unmute sounds" : "Mute sounds"}
      className="hidden sm:block rounded-xl border border-edge bg-surface2 p-2 text-zinc-400 transition-colors hover:text-zinc-100"
    >
      {mounted && !soundOn ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}

function SteamButton() {
  const signedIn = useUserStore((s) => s.signedIn);
  const username = useUserStore((s) => s.username);
  const signIn = useUserStore((s) => s.signIn);
  const signOut = useUserStore((s) => s.signOut);
  const mounted = useMounted();

  if (mounted && signedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-2 text-sm text-zinc-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface2">
            <User size={16} className="text-accent" />
          </span>
          {username}
        </span>
        <button
          onClick={signOut}
          title="Sign out"
          className="rounded-xl border border-edge bg-surface2 p-2 text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={signIn}
      className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
    >
      Sign in with Steam
    </button>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 lg:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="h-full w-64 overflow-y-auto border-r border-edge bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-accent">
            RUSTFIGHT
          </span>
          <button onClick={onClose} className="p-1 text-zinc-400">
            <X size={20} />
          </button>
        </div>
        {[...gameNav, ...otherNav].map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                active
                  ? "bg-accent-deep/30 text-accent"
                  : "text-zinc-400 hover:bg-surface2 hover:text-zinc-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-edge bg-surface px-4">
      <button
        onClick={() => setMenuOpen(true)}
        className="rounded-xl border border-edge bg-surface2 p-2 text-zinc-300 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <Link href="/" className="font-heading text-2xl font-bold tracking-wide">
        <span className="text-accent">RUST</span>
        <span className="text-zinc-100">FIGHT</span>
      </Link>
      <span className="hidden md:inline rounded-md border border-edge bg-surface2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Demo — no real money
      </span>
      <div className="ml-auto flex items-center gap-3">
        <BalanceChip />
        <SoundToggle />
        <SteamButton />
      </div>
      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
