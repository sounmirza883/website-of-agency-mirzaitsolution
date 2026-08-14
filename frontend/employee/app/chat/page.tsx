"use client";

import { useEffect, useRef, useState } from "react";
import { useProjectConversations, useMarkProjectRead, useProjectMessages, useSendProjectMessage } from "../hooks";

/**
 * Multi-project chat. An employee can hold several projects at once, so this is
 * a thread list rather than the single-thread dropdown it replaces — that
 * dropdown only appeared at all when you had more than one project, and there
 * was no way to tell which thread had something new in it.
 */
export default function ChatPage() {
  const { data: conversations } = useProjectConversations();
  const markRead = useMarkProjectRead();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useProjectMessages(activeId ?? undefined);
  const sendMessage = useSendProjectMessage();

  useEffect(() => {
    if (activeId == null && conversations?.length) setActiveId(conversations[0].projectId);
  }, [conversations, activeId]);

  const active = conversations?.find((c: any) => c.projectId === activeId);
  const unreadHere = active?.unread ?? 0;

  // Opening a thread, or receiving into the open one, clears its badge.
  useEffect(() => {
    if (activeId && unreadHere > 0) markRead.mutate(activeId);
    // markRead is a stable mutation object; including it would re-fire the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, unreadHere]);

  const newestId = messages?.length ? messages[messages.length - 1].id : null;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newestId, activeId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    await sendMessage.mutateAsync({ projectId: activeId, text: text.trim() });
    setText("");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Chat</h1>
        <p className="text-sm text-gray-500">Message the client on each of your projects</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <aside className="w-64 shrink-0 bg-white border border-gray-200 rounded-xl overflow-auto hidden md:block">
          {(conversations ?? []).map((c: any) => (
            <button
              key={c.projectId}
              onClick={() => setActiveId(c.projectId)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 ${c.projectId === activeId ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                {c.unread > 0 && <span className="shrink-0 text-[11px] font-medium bg-accent-2 text-gray-50 rounded-full px-1.5 py-0.5">{c.unread}</span>}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage ?? "No messages yet"}</p>
            </button>
          ))}
          {(conversations ?? []).length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">No projects assigned</div>}
        </aside>

        <section className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl min-w-0">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{active?.name ?? "Select a project"}</p>
              {active?.client && <p className="text-xs text-gray-500 truncate">{active.client}</p>}
            </div>
            {/* The sidebar is hidden below md, so small screens still need a switcher. */}
            <select
              value={activeId ?? ""}
              onChange={(e) => setActiveId(Number(e.target.value))}
              className="md:hidden px-2 py-1 border border-gray-200 rounded-md text-xs max-w-40"
              aria-label="Project"
            >
              {(conversations ?? []).map((c: any) => <option key={c.projectId} value={c.projectId}>{c.name}{c.unread ? ` (${c.unread})` : ""}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {(messages ?? []).map((m: any) => {
              const mine = m.senderRole === "employee";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-xl px-3 py-2 ${mine ? "bg-accent-2 text-gray-50" : "bg-gray-100 text-gray-900"}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`text-[11px] mt-1 ${mine ? "text-gray-50/70" : "text-gray-500"}`}>{m.time}</p>
                  </div>
                </div>
              );
            })}
            {activeId && (messages ?? []).length === 0 && <p className="text-center text-sm text-gray-400 py-8">No messages yet — say hello</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              disabled={!activeId}
              aria-label="Message"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
            />
            <button type="submit" disabled={!activeId || !text.trim() || sendMessage.isPending} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
              {sendMessage.isPending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
