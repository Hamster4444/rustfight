"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { gameNav, otherNav, type NavItem } from "./navItems";

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-accent-deep/30 text-accent border border-accent/40"
          : "text-zinc-400 hover:bg-surface2 hover:text-zinc-100 border border-transparent"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-6 border-r border-edge bg-surface px-3 py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-2 font-heading text-xs font-bold uppercase tracking-widest text-zinc-500">
          Games
        </p>
        {gameNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-2 font-heading text-xs font-bold uppercase tracking-widest text-zinc-500">
          More
        </p>
        {otherNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
