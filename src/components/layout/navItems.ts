import {
  Bomb,
  CircleDollarSign,
  HelpCircle,
  Home,
  Package,
  ScrollText,
  ShieldCheck,
  Store,
  Swords,
  TrendingUp,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const gameNav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Cases", href: "/cases", icon: Package },
  { label: "Case Battles", href: "/battles", icon: Swords },
  { label: "Coinflip", href: "/coinflip", icon: CircleDollarSign },
  { label: "Upgrader", href: "/upgrader", icon: TrendingUp },
  { label: "Mines", href: "/mines", icon: Bomb },
  { label: "Jackpot", href: "/jackpot", icon: Trophy },
  { label: "Marketplace", href: "/marketplace", icon: Store },
];

export const otherNav: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Provably Fair", href: "/provably-fair", icon: ShieldCheck },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Terms", href: "/terms", icon: ScrollText },
];
