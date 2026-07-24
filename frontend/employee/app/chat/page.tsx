"use client";

import { useState } from "react";
import { useAssignedProjects, useProjectMessages, useSendProjectMessage } from "../hooks";

export default function ChatPage() {
  const { data: projects } = useAssignedProjects();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [text, setText] = useState("");

  // If there's exactly one assigned project, default straight to its thread
  // without a picker; otherwise fall back to whatever the user picked.
  const projectId = selectedId ?? (projects && projects.length === 1 ? projects[0].id : undefined);

  const { data: messages } = useProjectMessages(projectId);
  const sendMessage = useSendProjectMessage();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !text.trim()) return;
    await sendMessage.mutateAsync({ projectId, text: text.trim() });
    setText("");
  }

  if (!projects || projects.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Chat</h1>
        <p className="text-sm text-gray-500 mb-6">Message the client on your assigned projects</p>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          No projects assigned yet — you&apos;ll be able to chat with the client once an admin assigns you a project.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Chat</h1>
          <p className="text-sm text-gray-500">Message the client on your assigned projects</p>
        </div>
        {projects.length > 1 && (
          <select
            value={projectId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="" disabled>Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
            ))}
          </select>
        )}
      </div>

      {!projectId ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          Select a project above to view its conversation.
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 min-h-0">
          <div className="flex-1 overflow-auto p-5 space-y-3">
            {messages?.length ? messages.map((m) => {
              const isMe = m.senderRole === "employee";
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-gray-400 mb-1">{isMe ? "You" : m.senderRole === "client" ? "Client" : "Admin"} · {m.time}</span>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-emerald-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm text-gray-400 text-center mt-8">No messages yet. Say hello!</div>
            )}
          </div>
          <form onSubmit={handleSend} className="border-t border-gray-200 p-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <button
              type="submit"
              disabled={sendMessage.isPending || !text.trim()}
              className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {sendMessage.isPending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
