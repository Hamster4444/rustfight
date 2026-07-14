# RustFight

A **demo/prototype** Rust skin gaming site — cases, case battles, coinflip, upgrader, mines, jackpot and a marketplace — built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion and Zustand.

> ⚠️ **This is a portfolio demo.** Everything runs client-side with mock data: fake user, fake coin balance, simulated outcomes. There is **no real Steam login, no trading, and no payments** — and there never will be.

## Features

- 🎁 **Cases** — 8 themed cases with weighted drop odds and a horizontal spinner reel that lands on your unboxed skin
- ⚔️ **Case Battles** — 1v1 / 2v2 battles vs bots with simultaneous animated openings; winning team takes every item
- 🪙 **Coinflip** — create or join lobbies vs bots, pick purple or black, animated 3D flip, winner takes the pot
- 📈 **Upgrader** — risk inventory items for a better skin; win chance = value ratio × 0.9 (10% house edge) on an animated wheel
- 💣 **Mines** — 5×5 grid, 1–24 mines, fair-odds multiplier that grows per safe tile, cash out or bust
- 🏆 **Jackpot** — bots deposit skins into a live pot, tickets proportional to value, countdown + ticket-weighted winner reel, round history
- 🛒 **Marketplace** — buy skins with coins or sell inventory at 95% value, with search, rarity/price filters and sorting
- 👤 **Profile** — inventory, stats (wagered, net profit, biggest win) and full game history
- 🔒 **Extras** — provably-fair explainer (mock hashes), FAQ, Terms, 18+ age gate, live chat with bot messages, sound effects toggle

All skin names, images and approximate prices are **real Rust items** loaded from the Steam CDN (fetched via the public Steam market API). Balance, inventory and history persist in `localStorage`.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) — flat purple & black theme
- [Framer Motion](https://www.framer.com/motion/) — spinner reels, coin flips, reveals
- [Zustand](https://zustand-demo.pmnd.rs/) — persisted user/balance/inventory state
- [lucide-react](https://lucide.dev/) — all icons

## Screenshots

<!-- Add screenshots here, e.g.:
![Home](docs/screenshots/home.png)
![Case opening](docs/screenshots/case.png)
-->

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You start with 5,000 demo coins — use the **+** button in the top bar to add more.

## Disclaimer

RustFight is not affiliated with Facepunch Studios or Valve Corporation. Skin imagery is served from Valve's Steam content delivery network and belongs to its respective owners. This project depicts gambling mechanics for demonstration purposes only and is intended for viewers aged 18+.
