"use client";

import { useState } from "react";
import { useProjectMessages, useSendProjectMessage } from "./hooks";

export function ProjectChatModal({ projectId, projectName, onClose }: { projectId: number; projectName: string; onClose: () => void }) {
  const { data: messages } = useProjectMessages(projectId);
  const sendMessage = useSendProjectMessage();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    try {
      await sendMessage.mutateAsync({ projectId, text });
      setText("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-xl p-6 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Chat — {projectName}</h2>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">Close</button>
        </div>
        <div className="flex-1 overflow-auto space-y-2 mb-4 pr-1">
          {messages?.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No messages yet</div>}
          {messages?.map((m: any) => (
            <div key={m.id} className={`flex ${m.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.senderRole === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
                <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">{m.senderRole}</div>
                <div>{m.text}</div>
                <div className="text-[10px] opacity-60 mt-1">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="mb-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSend} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <button type="submit" disabled={sendMessage.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}
