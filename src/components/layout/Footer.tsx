import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-surface px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg font-bold">
            <span className="text-accent">RUST</span>FIGHT
          </p>
          <p className="mt-1 max-w-md text-xs text-zinc-500">
            Demo project for portfolio purposes. All balances, items and games
            are simulated — no real money, skins, or trades are involved. 18+.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs text-zinc-400">
          <Link href="/provably-fair" className="hover:text-accent">
            Provably Fair
          </Link>
          <Link href="/faq" className="hover:text-accent">
            FAQ
          </Link>
          <Link href="/terms" className="hover:text-accent">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
