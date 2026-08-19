import { NextResponse } from "next/server";
import { fallbackRiftReply } from "@/lib/rift-chat-fallback";
import { RIFT_CHAT_SYSTEM_PROMPT } from "@/lib/rift-knowledge";
import {
  assertSameOrigin,
  clientIp,
  rateLimit,
  rateLimitedResponse,
  readJsonBody,
} from "@/lib/security";

type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

type ChatBody = {
  messages?: unknown;
};

const MAX_MESSAGES = 12;
const MAX_CONTENT = 1_200;

function sanitizeMessages(raw: unknown) {
  if (!Array.isArray(raw)) return null;
  const messages = raw
    .slice(-MAX_MESSAGES)
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const message = entry as ChatMessage;
      if (message.role !== "user" && message.role !== "assistant") return null;
      if (typeof message.content !== "string") return null;
      const content = message.content.trim().slice(0, MAX_CONTENT);
      if (!content) return null;
      return { role: message.role, content };
    })
    .filter(Boolean) as Array<{ role: "user" | "assistant"; content: string }>;

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return null;
  }
  return messages;
}

async function askOpenAi(
  apiKey: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 450,
      messages: [{ role: "system", content: RIFT_CHAT_SYSTEM_PROMPT }, ...messages],
    }),
    signal: AbortSignal.timeout(25_000),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "Assistant unavailable");
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty assistant response");
  return reply;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`chat:${ip}`, 20, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const parsed = await readJsonBody<ChatBody>(request, 16_384);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const messages = sanitizeMessages(parsed.data.messages);
  if (!messages) {
    return NextResponse.json({ error: "Invalid chat messages" }, { status: 400 });
  }

  const latest = messages[messages.length - 1]?.content ?? "";
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const reply = apiKey
      ? await askOpenAi(apiKey, messages)
      : fallbackRiftReply(latest);

    return NextResponse.json(
      { reply },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { reply: fallbackRiftReply(latest) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
