"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { botNames } from "@/data/bots";
import { cannedChat } from "@/data/chatMessages";
import { randomOf } from "@/lib/rng";
import { useUserStore } from "@/store/useUserStore";
import { useMounted } from "@/lib/useMounted";

interface ChatMsg {
  id: number;
  author: string;
  text: string;
  isYou?: boolean;
}

let msgId = 0;

export default function ChatSidebar() {
  const mounted = useMounted();
  const username = useUserStore((s) => s.username);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // seed + rotating bot messages
  useEffect(() => {
    if (!mounted) return;
    setMessages(
      Array.from({ length: 6 }, () => ({
        id: msgId++,
        author: randomOf(botNames),
        text: randomOf(cannedChat),
      }))
    );
    const t = setInterval(() => {
      setMessages((ms) =>
        [
          ...ms,
          { id: msgId++, author: randomOf(botNames), text: randomOf(cannedChat) },
        ].slice(-40)
      );
    }, 6000);
    return () => clearInterval(t);
  }, [mounted]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((ms) =>
      [...ms, { id: msgId++, author: username, text, isYou: true }].slice(-40)
    );
    setInput("");
  }

  return (
    <>
      {/* toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        aria-label="Toggle chat"
      >
        <MessageSquare size={16} />
        Chat
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-96 w-80 flex-col rounded-xl border border-edge bg-surface">
          <div className="flex items-center justify-between border-b border-edge px-3 py-2">
            <p className="flex items-center gap-2 font-heading text-sm font-bold uppercase">
              <MessageSquare size={14} className="text-accent" /> Live chat
            </p>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-zinc-500 hover:text-zinc-200"
              aria-label="Close chat"
            >
              <X size={14} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3">
            {messages.map((m) => (
              <p key={m.id} className="mb-1.5 text-xs leading-snug">
                <span
                  className={`font-semibold ${
                    m.isYou ? "text-accent" : "text-zinc-400"
                  }`}
                >
                  {m.author}:
                </span>{" "}
                <span className="text-zinc-300">{m.text}</span>
              </p>
            ))}
          </div>
          <div className="flex gap-2 border-t border-edge p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say something…"
              className="flex-1 rounded-lg border border-edge bg-bg px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-accent"
            />
            <button
              onClick={send}
              className="rounded-lg bg-accent p-2 text-white transition-colors hover:bg-accent-hover"
              aria-label="Send message"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
