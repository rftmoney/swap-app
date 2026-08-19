"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  CHAT_LOCALE_CODES,
  CHAT_LOCALE_LABELS,
  DEFAULT_CHAT_LOCALE,
  getChatCopy,
  lumenGreeting,
  normalizeChatLocale,
  type ChatLocale,
} from "@/lib/rift-chat-locales";

const LOCALE_STORAGE_KEY = "rift-chat-locale";

type Message = {
  role: "user" | "assistant";
  content: string;
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

function readStoredLocale(): ChatLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored) return normalizeChatLocale(stored);
  } catch {
    /* storage blocked */
  }
  return DEFAULT_CHAT_LOCALE;
}

export function RiftChat() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<ChatLocale>(DEFAULT_CHAT_LOCALE);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const copy = getChatCopy(locale);

  useEffect(() => {
    setLocale(readStoredLocale());
  }, []);

  useEffect(() => {
    setMessages([{ role: "assistant", content: lumenGreeting(locale) }]);
    setError(null);
  }, [locale]);

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

  function changeLocale(next: ChatLocale) {
    setLocale(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage blocked */
    }
  }

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
          locale,
          messages: nextMessages.slice(1),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok) throw new Error(data.error || copy.error);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply || "…" },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
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
            <div className="rift-chat-header-actions">
              <label className="rift-chat-lang">
                <span className="sr-only">{copy.language}</span>
                <select
                  value={locale}
                  onChange={(event) => changeLocale(event.target.value as ChatLocale)}
                  aria-label={copy.language}
                >
                  {CHAT_LOCALE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {CHAT_LOCALE_LABELS[code].native}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rift-chat-close"
                aria-label={copy.close}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
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
            {sending ? (
              <p className="rift-chat-bubble is-assistant is-typing">{copy.typing}</p>
            ) : null}
            {error ? <p className="rift-chat-error">{error}</p> : null}
          </div>

          <form className="rift-chat-form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              maxLength={1200}
              autoComplete="off"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              {copy.send}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="rift-chat-launcher"
        aria-expanded={open}
        aria-label={open ? copy.launcherClose : copy.launcherOpen}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : <ChatIcon />}
      </button>
    </div>
  );
}
