"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

/**
 * Realtime for staff chat.
 *
 * The websocket runs browser -> Supabase Realtime directly, not through our
 * API, because the API is deployed serverless and can't hold a socket open.
 *
 * Broadcasts carry only a conversation id. Message content is always fetched
 * over the authenticated API, which checks membership — this app uses its own
 * JWTs rather than Supabase Auth, so Supabase RLS can't identify our users and
 * nothing sensitive may travel on this channel.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null when the env vars aren't configured (e.g. a deploy that hasn't had them
// added yet). Both hooks below then no-op and the queries' polling carries the
// feature on its own, just with more latency.
export const realtime =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

/** Fires whenever any conversation this user belongs to receives a message. */
export function useChatActivity(userId: number | undefined, onActivity: (conversationId: number) => void) {
  // Held in a ref so a new inline callback each render doesn't tear down and
  // rebuild the websocket. Assigned in an effect, never during render, which
  // React forbids under concurrent rendering.
  const callback = useRef(onActivity);
  useEffect(() => {
    callback.current = onActivity;
  }, [onActivity]);

  useEffect(() => {
    if (!realtime || !userId) return;
    const channel = realtime
      .channel(`chat-user-${userId}`)
      .on("broadcast", { event: "chat-activity" }, (msg) => {
        const id = (msg.payload as { conversationId?: number } | undefined)?.conversationId;
        if (typeof id === "number") callback.current(id);
      })
      .subscribe();
    return () => {
      realtime.removeChannel(channel);
    };
  }, [userId]);
}

/**
 * Who is online, and who is typing where — both from one Supabase Presence
 * channel (no DB writes, no schema).
 *
 * Typing rides presence rather than the server broadcast helper on purpose: the
 * API is serverless, so routing keystrokes through it would cost two network
 * hops each. Presence is already open, already keyed per user, and already
 * cleans itself up when a tab closes.
 *
 * `typingIn` is published by the browser, so like everything else on this
 * channel it is spoofable by anyone holding the public anon key. That is
 * acceptable for "someone is typing" and is exactly why message content still
 * never travels over the socket.
 */
export function useStaffPresence(userId: number | undefined, typingIn?: number | null) {
  const [online, setOnline] = useState<Set<number>>(new Set());
  const [typingByConversation, setTypingByConversation] = useState<Map<number, number[]>>(new Map());
  const channelRef = useRef<ReturnType<NonNullable<typeof realtime>["channel"]> | null>(null);

  useEffect(() => {
    if (!realtime || !userId) return;
    const channel = realtime.channel("staff-presence", { config: { presence: { key: String(userId) } } });
    channelRef.current = channel;
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, Array<{ userId?: number; typingIn?: number | null }>>;
        const ids: number[] = [];
        const typing = new Map<number, number[]>();
        for (const [key, entries] of Object.entries(state)) {
          const id = Number(key);
          if (!Number.isFinite(id)) continue;
          ids.push(id);
          const conv = entries[0]?.typingIn;
          if (typeof conv === "number") typing.set(conv, [...(typing.get(conv) ?? []), id]);
        }
        setOnline(new Set(ids));
        setTypingByConversation(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ userId });
      });
    return () => {
      channelRef.current = null;
      realtime.removeChannel(channel);
    };
  }, [userId]);

  // Re-published whenever the typing target changes; the caller debounces so
  // this isn't one network message per keystroke.
  useEffect(() => {
    if (!userId) return;
    channelRef.current?.track({ userId, typingIn: typingIn ?? null });
  }, [userId, typingIn]);

  return { online, typingByConversation };
}
