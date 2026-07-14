import { ScrollText } from "lucide-react";

export const metadata = { title: "Terms of Service — RustFight" };

const sections = [
  {
    title: "1. Demo project",
    body: "RustFight is a non-commercial demonstration project. It simulates the structure of a skin-gaming website for educational and portfolio purposes only. No real money, cryptocurrency, or tradable items are ever involved.",
  },
  {
    title: "2. No gambling services",
    body: "Nothing on this site constitutes gambling, betting, or a game of chance for value. All balances are fictional numbers stored in your own browser, and all outcomes are generated locally with no stakes of any kind.",
  },
  {
    title: "3. Age requirement",
    body: "Although no real wagering takes place, the content depicts gambling mechanics and is intended for users aged 18 or older.",
  },
  {
    title: "4. Third-party content",
    body: "Skin names and images are the property of Facepunch Studios and are loaded from Valve's Steam content delivery network. RustFight is not affiliated with or endorsed by Facepunch Studios or Valve Corporation.",
  },
  {
    title: "5. No warranty",
    body: "The site is provided \"as is\", without warranty of any kind. The authors are not liable for any damages arising from its use.",
  },
  {
    title: "6. Responsible play",
    body: "If you or someone you know struggles with real gambling, help is available — for example the National Problem Gambling Helpline (1-800-GAMBLER in the US) or your local equivalent.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <ScrollText className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          Terms of Service
        </h1>
      </div>
      <p className="mt-1 text-xs text-zinc-500">Last updated: July 14, 2026</p>
      <div className="mt-6 flex flex-col gap-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-xl border border-edge bg-surface p-5">
            <h2 className="font-heading text-lg font-bold">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
