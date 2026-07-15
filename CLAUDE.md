# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

RustFight is a **demo/prototype** Rust skin gambling site (Next.js 14 App Router + TypeScript + Tailwind 3 + Framer Motion + Zustand). Everything is client-side with mock data: no backend, no auth, no real money. All game outcomes come from `Math.random()`; balance/inventory/history persist in localStorage.

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build — must pass with zero errors/warnings
npx next lint        # ESLint (next/core-web-vitals)
```

There are no tests. Verification is `npm run build` + exercising the affected game in the browser. Playwright-driven screenshot audits have been used via `playwright-core` with the system Edge browser (`chromium.launch({ channel: "msedge" })`) — no browser download needed on this machine.

## Hard constraints (from the project brief)

- **No hand-drawn/generated SVG artwork.** All icons come from `lucide-react`; all item imagery is real Rust skins served from the Steam CDN (`community.cloudflare.steamstatic.com`, allowlisted in `next.config.mjs`).
- Steam CDN image URLs contain opaque hashes that **cannot be fabricated** — `src/data/skins.ts` was generated from the public Steam market search API (`steamcommunity.com/market/search/render/?appid=252490&norender=1`). To add skins, fetch real `icon_url` hashes the same way.
- If an image fails to load, show a neutral dark box with the item name (`src/components/SteamImage.tsx` does this) — never substitute generated art.
- **Theme is flat purple & black — no glows, no neon shadows, no gradients.** Tokens live in `tailwind.config.ts`: `bg` #0a0a0c, `surface` #141317, `surface2`, `edge` (borders), `accent` #8b5cf6 (+ `accent-hover`, `accent-deep`), and `rarity-*` colors (Consumer gray / Industrial blue / Restricted purple / Classified pink / Covert red — these stay standard). Fonts: Inter (`font-sans`) and Rajdhani (`font-heading`) via `next/font/google`.

## Architecture

- `src/store/useUserStore.ts` — single Zustand store (persisted as `rustfight-user`): balance, inventory (`InventoryItem` = unique `uid` + `Skin`), game history, sign-in flag, sound toggle, age-gate flag. All games mutate state only through its actions (`spendBalance` returns false on insufficient funds; `addSkins` returns the created items).
- `src/data/skins.ts` — 49 real skins sorted by price desc (games rely on this ordering, e.g. home page `skins.slice(0, 4)` and `skins[0]`). `src/data/cases.ts` derives 8 cases from it by name pattern; case price is auto-computed as EV × 1.11 (house edge), so editing skins reprices cases automatically. Each case has an identity `color` and an `icon` **string key** (not a component — `CaseDef` must stay serializable because server pages pass it to client components; `src/components/CaseArt.tsx` maps the key to the lucide icon and renders the flat crate artwork).
- `src/lib/rng.ts` (weighted picks, mock hashes), `src/lib/format.ts` (`formatCoins`, `uid()`), `src/lib/sounds.ts` (synthesized WebAudio kit gated on the store's `soundOn` — no audio assets; `tick` is rate-limited and reels fire it from framer-motion `onUpdate` when a card crosses the marker; `reveal(rarity)` scales the fanfare), `src/lib/useMounted.ts`.
- Each game page is a thin server `page.tsx` (metadata) + one `*Client.tsx` client component holding the whole game state machine. Bots come from `src/data/bots.ts`; simulated opponents/lobbies are generated **after mount** (see hydration note below).
- Layout (`src/app/layout.tsx`): TopBar (balance chip with +1000 demo-coin button, sound toggle, mock Steam sign-in) → sidebar + main column → floating ChatSidebar + AgeGateModal. Nav lives in `src/components/layout/navItems.ts`.
- House-edge convention: every game applies ~10% (upgrader chance × 0.9, mines multiplier × 0.9, case price EV × 1.11, marketplace sell at 95%).

## Recurring gotchas (each has caused a real bug here)

- **Hydration:** persisted store values and any randomness must not render during SSR. Use `useMounted()` and render placeholders until mounted; generate mock lobbies/bots inside `useEffect`.
- **Framer Motion overrides Tailwind transforms.** Animating `x` clobbers class-based `-translate-y-1/2`; pass the other axis through motion (`style={{ y: "-50%" }}`) so they compose. Reel landing math must include the strip's left padding (see `CaseOpener.tsx` / `JackpotClient.tsx`).
- **Flexbox min-width:** the main column has `min-w-0` in `layout.tsx`; without it, wide fixed-width strips (e.g. LiveDrops) force horizontal overflow on mobile.
- Effects that award winnings guard against double-fire (React StrictMode) with a `settled`/`awarded` ref before mutating the store.
- The floating chat button occupies the bottom-right corner — the footer reserves space for it (`sm:pr-28`, `pb-20`); keep new fixed-position UI clear of it.
- Money math is rounded with `Math.round(x * 100) / 100` at every mutation to avoid float drift.
