"use client";

import { useEffect, useRef, useState } from "react";
import { useProjectConversations, useMarkProjectRead, useMessages, useSendMessage } from "../hooks";

const card: React.CSSProperties = { background: "var(--canvas)", borderRadius: "var(--radius)", border: "1px solid var(--line)" };

/**
 * One thread per project. The old page used a row of pills with no indication
 * of which conversation had something new in it — with several projects that
 * meant clicking through them to find out.
 */
export default function ChatPage() {
  const { data: conversations } = useProjectConversations();
  const markRead = useMarkProjectRead();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useMessages(activeId ? String(activeId) : undefined);
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (activeId == null && conversations?.length) setActiveId(conversations[0].projectId);
  }, [conversations, activeId]);

  const active = conversations?.find((c) => c.projectId === activeId);
  const unreadHere = active?.unread ?? 0;

  useEffect(() => {
    if (activeId && unreadHere > 0) markRead.mutate(activeId);
    // markRead is a stable mutation object; including it would re-fire the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, unreadHere]);

  const newestId = messages?.length ? messages[messages.length - 1].id : null;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newestId, activeId]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !activeId) return;
    sendMessage.mutate({ projectId: String(activeId), text }, { onSuccess: () => setDraft("") });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>Chat with Your Team</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>A conversation for each of your projects</p>

      {!conversations || conversations.length === 0 ? (
        <div style={{ ...card, padding: "32px", maxWidth: "640px", textAlign: "center" }}>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            You don&apos;t have any projects yet, so there&apos;s no team chat to show. Once a project is set up, a conversation thread will appear here.
          </p>
        </div>
      ) : (
        <div className="flex gap-4" style={{ alignItems: "flex-start" }}>
          <aside className="hidden md:block" style={{ ...card, width: "240px", flexShrink: 0, overflow: "auto", maxHeight: "540px" }}>
            {conversations.map((c) => (
              <button
                key={c.projectId}
                onClick={() => setActiveId(c.projectId)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: 0,
                  borderBottom: "1px solid var(--line)", cursor: "pointer",
                  background: c.projectId === activeId ? "var(--soft)" : "transparent",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{c.name}</span>
                  {c.unread > 0 && (
                    <span style={{ fontSize: "11px", fontWeight: 500, background: "var(--accent)", color: "var(--canvas)", borderRadius: "50px", padding: "1px 7px" }}>{c.unread}</span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--ink-soft)" }}>{c.lastMessage ?? "No messages yet"}</p>
              </button>
            ))}
          </aside>

          <section style={{ ...card, flex: 1, minWidth: 0, padding: "20px", maxWidth: "640px" }}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{active?.name ?? "Select a project"}</p>
              {/* The sidebar is hidden below md, so small screens still need a switcher. */}
              <select
                className="md:hidden"
                value={activeId ?? ""}
                onChange={(e) => setActiveId(Number(e.target.value))}
                aria-label="Project"
                style={{ padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "10px", fontSize: "12px", background: "var(--canvas)", color: "var(--ink)", maxWidth: "180px" }}
              >
                {conversations.map((c) => <option key={c.projectId} value={c.projectId}>{c.name}{c.unread ? ` (${c.unread})` : ""}</option>)}
              </select>
            </div>

            <div className="space-y-4 mb-4" style={{ maxHeight: "384px", overflow: "auto" }}>
              {messages?.map((m) => (
                <div key={m.id} className={`flex ${m.senderRole === "client" ? "justify-end" : "justify-start"}`}>
                  <div style={{ maxWidth: "300px", borderRadius: "12px", padding: "10px 16px", background: m.senderRole === "client" ? "var(--accent)" : "var(--soft)", color: m.senderRole === "client" ? "var(--canvas)" : "var(--ink)" }}>
                    <div className="text-sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                    <div className="text-xs mt-1" style={{ color: m.senderRole === "client" ? "rgba(15,23,42,.7)" : "var(--ink-soft)" }}>{m.time}</div>
                  </div>
                </div>
              ))}
              {activeId && messages?.length === 0 && (
                <p className="text-sm text-center" style={{ color: "var(--ink-soft)", padding: "24px 0" }}>No messages yet — say hello</p>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-2" style={{ borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
              <input
                type="text" placeholder="Type your message..." aria-label="Message"
                value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                style={{ flex: 1, padding: "10px 16px", border: "1px solid var(--line)", borderRadius: "12px", fontSize: "14px", outline: "none", background: "var(--canvas)", color: "var(--ink)" }}
              />
              <button
                onClick={handleSend} disabled={sendMessage.isPending || !draft.trim()}
                style={{ padding: "10px 20px", background: "var(--accent)", color: "var(--canvas)", fontSize: "14px", fontWeight: 500, borderRadius: "12px", border: 0, cursor: "pointer", opacity: sendMessage.isPending || !draft.trim() ? 0.6 : 1 }}
              >
                Send
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
