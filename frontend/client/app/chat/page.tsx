"use client";

import { useState } from "react";
import { useProjects, useMessages, useSendMessage } from "../hooks";

export default function ChatPage() {
  const { data: projects } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const projectId = selectedId ?? (projects && projects.length > 0 ? String(projects[0].id) : null);

  const { data: messages } = useMessages(projectId ?? undefined);
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState("");

  function handleSend() {
    const text = draft.trim();
    if (!text || !projectId) return;
    sendMessage.mutate({ projectId, text }, { onSuccess: () => setDraft("") });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Chat with Your Team</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Communicate directly with the Zephtrix team</p>

      {!projects || projects.length === 0 ? (
        <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"32px",maxWidth:"640px",textAlign:"center"}}>
          <p className="text-sm" style={{color:"var(--ink-soft)"}}>You don&apos;t have any projects yet, so there&apos;s no team chat to show. Once a project is set up, a conversation thread will appear here.</p>
        </div>
      ) : (
        <div style={{maxWidth:"640px"}}>
          {projects.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {projects.map((p) => (
                <button key={p.id} onClick={() => setSelectedId(String(p.id))} style={{
                  padding:"8px 18px",borderRadius:"50px",border:0,fontSize:"13px",fontWeight:"500",cursor:"pointer",
                  background: projectId === String(p.id) ? "var(--red)" : "var(--soft)",
                  color: projectId === String(p.id) ? "#fff" : "var(--ink-soft)",
                }}>{p.name}</button>
              ))}
            </div>
          )}
          <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
            <div className="space-y-4 mb-4" style={{maxHeight:"384px",overflow:"auto"}}>
              {messages?.map((m) => (
                <div key={m.id} className={`flex ${m.senderRole === "client" ? "justify-end" : "justify-start"}`}>
                  <div style={{maxWidth:"300px",borderRadius:"12px",padding:"10px 16px",background:m.senderRole==="client"?"var(--red)":"var(--soft)",color:m.senderRole==="client"?"#fff":"var(--ink)"}}>
                    <div className="text-sm">{m.text}</div>
                    <div className="text-xs mt-1" style={{color:m.senderRole==="client"?"rgba(255,255,255,.7)":"var(--ink-soft)"}}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2" style={{borderTop:"1px solid var(--line)",paddingTop:"16px"}}>
              <input type="text" placeholder="Type your message..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} style={{flex:1,padding:"10px 16px",border:"1px solid var(--line)",borderRadius:"12px",fontSize:"14px",outline:"none",background:"var(--canvas)",color:"var(--ink)"}} />
              <button onClick={handleSend} disabled={sendMessage.isPending || !draft.trim()} style={{padding:"10px 20px",background:"var(--red)",color:"#fff",fontSize:"14px",fontWeight:"500",borderRadius:"12px",border:0,cursor:"pointer",opacity:sendMessage.isPending || !draft.trim()?.6:1}}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
