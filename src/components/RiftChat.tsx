"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTER: Message = {
  role: "assistant",
  content:
    "Hi — I’m the Rift assistant. Ask about swaps, deposit status, wallets, recovery links, or how the site works.",
};

export function RiftChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, sending]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(1),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Assistant unavailable");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply || "No response." },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant unavailable");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`rift-chat${open ? " is-open" : ""}`}>
      {open ? (
        <section className="rift-chat-panel" role="dialog" aria-label="Rift assistant">
          <header className="rift-chat-header">
            <div>
              <p className="rift-chat-kicker">Rift</p>
              <h2>Assistant</h2>
            </div>
            <button
              type="button"
              className="rift-chat-close"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="rift-chat-messages" ref={scrollRef}>
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`rift-chat-bubble is-${message.role}`}
              >
                {message.content}
              </p>
            ))}
            {sending ? <p className="rift-chat-bubble is-assistant is-typing">…</p> : null}
            {error ? <p className="rift-chat-error">{error}</p> : null}
          </div>

          <form className="rift-chat-form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about swaps, status, wallets…"
              maxLength={1200}
              autoComplete="off"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="rift-chat-launcher"
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}
