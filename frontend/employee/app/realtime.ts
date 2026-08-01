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

/** Ids of staff currently connected, via Supabase Presence (no DB writes). */
export function useStaffPresence(userId: number | undefined): Set<number> {
  const [online, setOnline] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!realtime || !userId) return;
    const channel = realtime.channel("staff-presence", { config: { presence: { key: String(userId) } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const ids = Object.keys(channel.presenceState())
          .map(Number)
          .filter((n) => Number.isFinite(n));
        setOnline(new Set(ids));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ userId });
      });
    return () => {
      realtime.removeChannel(channel);
    };
  }, [userId]);

  return online;
}
