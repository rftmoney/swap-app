"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LUMEN_GREETING } from "@/lib/rift-chat-fallback";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTER: Message = {
  role: "assistant",
  content: LUMEN_GREETING,
};

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v7A2.5 2.5 0 0117.5 15H10l-4.8 3.2a.75.75 0 01-1.15-.64V15H6.5A2.5 2.5 0 014 12.5v-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      if (!response.ok) throw new Error(data.error || "Could not get a reply");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply || "No response." },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`rift-chat${open ? " is-open" : ""}`}>
      {open ? (
        <section className="rift-chat-panel" role="dialog" aria-label="Lumen support chat">
          <header className="rift-chat-header">
            <div>
              <p className="rift-chat-kicker">Rift support</p>
              <h2>Lumen</h2>
            </div>
            <button
              type="button"
              className="rift-chat-close"
              aria-label="Close chat"
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
              placeholder="Ask Lumen anything about Rift…"
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
        aria-label={open ? "Close chat with Lumen" : "Chat with Lumen"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : <ChatIcon />}
      </button>
    </div>
  );
}
