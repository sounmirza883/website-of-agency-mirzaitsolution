"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth";
import { useChatActivity, useStaffPresence } from "../realtime";
import { useChatContacts, useChatConversations, useChatMessages, useSendChatMessage, useOpenChatDm, useMarkChatRead } from "../hooks";

interface Conversation {
  id: number;
  kind: "dm" | "channel";
  name: string;
  otherUserId: number | null;
  members: Array<{ id: number; name: string; role: string }>;
  unreadCount: number;
  lastMessage: { text: string; createdAt: string } | null;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [text, setText] = useState("");
  // Employees can take part in channels but not create them — the backend
  // restricts channel creation to admins, so there is no channel form here.
  const [pickerOpen, setPickerOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useChatConversations();
  const { data: contacts } = useChatContacts();
  const { data: messages, isLoading: loadingMessages } = useChatMessages(activeId);
  const sendMessage = useSendChatMessage();
  const openDm = useOpenChatDm();
  const markRead = useMarkChatRead();

  const list: Conversation[] = conversations ?? [];
  const active = list.find((c) => c.id === activeId) ?? null;
  const channels = list.filter((c) => c.kind === "channel");
  const dms = list.filter((c) => c.kind === "dm");

  // Realtime: a broadcast only says "conversation N changed", so refetch it
  // over the authenticated API rather than trusting anything off the socket.
  const queryClient = useQueryClient();
  const onlineIds = useStaffPresence(user?.id);
  useChatActivity(user?.id, (conversationId) => {
    queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    queryClient.invalidateQueries({ queryKey: ["chatMessages", conversationId] });
  });

  // Opening a thread (or receiving into the open one) clears its badge.
  const unreadForActive = active?.unreadCount ?? 0;
  useEffect(() => {
    if (activeId && unreadForActive > 0) markRead.mutate(activeId);
    // markRead is a stable mutation object; including it would re-fire the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, unreadForActive]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, activeId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    await sendMessage.mutateAsync({ conversationId: activeId, text: text.trim() });
    setText("");
  }

  async function handleStartDm(userId: number) {
    const conv = await openDm.mutateAsync(userId);
    setPickerOpen(false);
    setActiveId(conv.id);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Messages</h1>
        <p className="text-sm text-gray-500">Direct messages and channels with your team</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <aside className="w-64 shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-200">
            <button onClick={() => setPickerOpen(true)} className="w-full bg-accent-2 text-gray-50 text-xs font-medium px-3 py-2 rounded-lg">+ New DM</button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-4">
            <Section title="Channels" items={channels} activeId={activeId} onSelect={setActiveId} prefix="#" />
            <Section title="Direct Messages" items={dms} activeId={activeId} onSelect={setActiveId} onlineIds={onlineIds} />
            {list.length === 0 && (
              <p className="text-xs text-gray-400 text-center px-2 py-6">No conversations yet. Start a DM to get going.</p>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 min-h-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <header className="px-5 py-3 border-b border-gray-200 shrink-0">
                <div className="font-semibold text-gray-900">{active.kind === "channel" ? `# ${active.name}` : active.name}</div>
                <div className="text-xs text-gray-500">
                  {active.kind === "channel"
                    ? `${active.members.length} member${active.members.length === 1 ? "" : "s"}`
                    : active.otherUserId != null && onlineIds.has(active.otherUserId)
                      ? "Online"
                      : "Offline"}
                </div>
              </header>

              <div className="flex-1 overflow-auto p-5 space-y-3">
                {loadingMessages ? (
                  <p className="text-sm text-gray-400 text-center mt-8">Loading…</p>
                ) : messages?.length ? (
                  messages.map((m: any) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-400 mb-1">
                          {isMe ? "You" : m.sender?.name ?? "Deleted user"} · {timeLabel(m.createdAt)}
                        </span>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-accent-2 text-gray-50 rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center mt-8">No messages yet. Say hello!</p>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-gray-200 p-4 flex gap-2 shrink-0">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={active.kind === "channel" ? `Message # ${active.name}` : `Message ${active.name}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <button type="submit" disabled={sendMessage.isPending || !text.trim()} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                  {sendMessage.isPending ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setPickerOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6 max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4">Start a conversation</h2>
            <div className="space-y-1">
              {contacts?.length ? contacts.map((c: any) => (
                <button key={c.id} onClick={() => handleStartDm(c.id)} disabled={openDm.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left disabled:opacity-50">
                  <Avatar name={c.name} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900 truncate">{c.name}</span>
                    <span className="block text-xs text-gray-500 truncate">{c.position || c.role}</span>
                  </span>
                </button>
              )) : <p className="text-sm text-gray-500">No other staff accounts yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, online }: { name: string; online?: boolean }) {
  return (
    <span className="relative w-8 h-8 shrink-0">
      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-xs font-bold">
        {initials(name)}
      </span>
      {online !== undefined && (
        <span
          title={online ? "Online" : "Offline"}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-gray-300"}`}
        />
      )}
    </span>
  );
}

function Section({ title, items, activeId, onSelect, prefix = "", onlineIds }: {
  title: string;
  items: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  prefix?: string;
  onlineIds?: Set<number>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-0.5">
        {items.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${c.id === activeId ? "bg-gray-100" : "hover:bg-gray-50"}`}>
            {prefix
              ? <span className="w-8 text-center text-gray-400">{prefix}</span>
              : <Avatar name={c.name} online={onlineIds ? (c.otherUserId != null && onlineIds.has(c.otherUserId)) : undefined} />}
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-900 truncate">{c.name}</span>
              {c.lastMessage && <span className="block text-xs text-gray-500 truncate">{c.lastMessage.text}</span>}
            </span>
            {c.unreadCount > 0 && (
              <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-accent-2 text-gray-50 text-[11px] font-bold flex items-center justify-center">
                {c.unreadCount > 99 ? "99+" : c.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
