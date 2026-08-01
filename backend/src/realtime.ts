/**
 * Realtime fan-out for staff chat.
 *
 * The API runs on Vercel serverless, which can't hold open WebSocket
 * connections, so the socket lives between the browser and Supabase Realtime
 * instead. This module just pokes that hosted service over plain HTTP after a
 * write — a stateless call, which is what a serverless function can do well.
 *
 * The payload deliberately carries ONLY a conversation id, never message
 * content. Clients authenticate with this app's own JWTs rather than Supabase
 * Auth, so Supabase RLS can't identify them and the anon key is public in
 * browser JS. Anyone who guessed a topic would learn that a conversation had
 * activity and nothing more; the message itself is still fetched over the
 * authenticated API, which checks membership.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

/** Topic a given user listens on for activity in any of their conversations. */
export function userTopic(userId: number): string {
  return `chat-user-${userId}`;
}

export async function broadcastChatActivity(userIds: number[], conversationId: number): Promise<void> {
  if (!url || !key || userIds.length === 0) return;

  const messages = userIds.map((id) => ({
    topic: userTopic(id),
    event: "chat-activity",
    payload: { conversationId },
  }));

  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
  } catch (err) {
    // Clients keep a slow poll as a safety net, so a failed broadcast only
    // costs latency. Never let it fail the send that already succeeded.
    console.warn("chat broadcast failed:", err instanceof Error ? err.message : err);
  }
}
