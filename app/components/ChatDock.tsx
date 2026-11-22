"use client";

import { useEffect, useRef, useState } from "react";
import type { AqiData, ChatMessage, Profile } from "@/lib/types";

const SUGGESTIONS = [
  "Is it safe for my kid to play outside now?",
  "Cheapest way to clean my indoor air?",
  "Should I wear a mask today?",
];

export default function ChatDock({
  profile,
  aqi,
}: {
  profile: Profile;
  aqi: AqiData;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // When the panel opens, move focus into it; when it closes, return focus to
  // the toggle. Escape closes the panel from anywhere inside it.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, aqi, messages: next }),
      });
      const data = await res.json();
      const reply =
        res.ok && data.reply
          ? data.reply
          : data.error || "Sorry, I couldn't answer that just now.";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      );
    }
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-20 sm:inset-x-auto sm:right-6 sm:bottom-6">
      {open && (
        <div
          id="airmitra-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Ask AirMitra"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          className="mb-3 w-full rounded-xl border border-line border-t-2 border-t-jade bg-surface p-5 sm:w-[360px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Ask AirMitra</h3>
            <button
              onClick={close}
              aria-label="Close chat"
              className="text-ink-soft hover:text-ink"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Follow-up questions, answered for your household and today&apos;s air.
          </p>

          {messages.length > 0 && (
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1"
            >
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <p
                    className={`inline-block max-w-[85%] rounded-lg px-3.5 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-ink text-paper"
                        : "bg-jade-soft text-ink"
                    }`}
                  >
                    <span className="sr-only">
                      {m.role === "user" ? "You: " : "AirMitra: "}
                    </span>
                    {m.content}
                  </p>
                </div>
              ))}
              {loading && (
                <p className="text-sm text-ink-soft">AirMitra is thinking…</p>
              )}
            </div>
          )}

          {messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-jade hover:text-jade"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex gap-3 border-b border-line pb-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              aria-label="Type your question for AirMitra"
              className="flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="text-sm font-semibold text-jade disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        ref={toggleRef}
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="airmitra-chat-panel"
        className="w-full rounded-full border border-line bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-jade sm:w-auto"
      >
        {open ? "Close" : "Ask AirMitra"}
      </button>
    </div>
  );
}
