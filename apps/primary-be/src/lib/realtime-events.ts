type ChatEventPayload = {
  roomId: string;
  message: unknown;
};

const WS_INTERNAL_URL =
  process.env.WS_INTERNAL_URL ?? 'http://localhost:8090/internal/events/chat-message';
const WS_INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET ?? '';

export async function publishChatMessageEvent(payload: ChatEventPayload): Promise<void> {
  if (!WS_INTERNAL_SECRET) return;

  try {
    await fetch(WS_INTERNAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': WS_INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // Realtime delivery should not break the core chat transaction.
  }
}
