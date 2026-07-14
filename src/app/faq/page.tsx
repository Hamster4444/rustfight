import { HelpCircle } from "lucide-react";

export const metadata = { title: "FAQ — RustFight" };

const faqs = [
  {
    q: "Is this a real gambling site?",
    a: "No. RustFight is a demo/portfolio project. Every coin, skin, and game outcome is simulated in your browser — there is no real money, no Steam login, and no trading.",
  },
  {
    q: "Where do the coins come from?",
    a: "You start with 5,000 demo coins. You can add more at any time with the + button next to your balance in the top bar.",
  },
  {
    q: "Are the skins real?",
    a: "The skin names, images and approximate prices are real Rust items loaded from the Steam CDN, but the copies in your inventory are just demo data.",
  },
  {
    q: "How do case odds work?",
    a: "Each case has a weighted pool — cheaper items drop often, rarer items drop rarely. Case prices are set about 11% above the expected value, which mirrors how real sites take a house edge.",
  },
  {
    q: "How is the upgrader chance calculated?",
    a: "Win chance = (your items' value ÷ target value) × 0.9, capped at 90%. The ×0.9 is a simulated 10% house edge.",
  },
  {
    q: "Why did my balance reset / persist?",
    a: "Your balance, inventory and history are stored in your browser's localStorage. Clearing site data resets the demo.",
  },
  {
    q: "Is anything sent to a server?",
    a: "No game data leaves your browser. The only network requests are for fonts and skin images.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <HelpCircle className="text-accent" size={28} />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
          FAQ
        </h1>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-edge bg-surface p-4 open:border-accent/50"
          >
            <summary className="cursor-pointer list-none font-semibold text-zinc-200 group-open:text-accent">
              {f.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
