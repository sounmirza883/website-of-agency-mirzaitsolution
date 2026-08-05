"use client";

import { useState } from "react";
import { Icon, Field, inputStyle } from "./components";
import { useTickets, useCreateTicket } from "./hooks";

const STATUSES = ["Open", "Closed"];

function priorityColor(priority: string) {
  if (priority === "High") return { background: "#fef2f2", color: "#b91c1c" };
  if (priority === "Medium") return { background: "#fef3c7", color: "#92400e" };
  return { background: "var(--soft)", color: "var(--ink-soft)" };
}

function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createTicket = useCreateTicket();
  const [form, setForm] = useState({ subject: "", priority: "Medium", description: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createTicket.mutateAsync(form);
      setForm({ subject: "", priority: "Medium", description: "" });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!open) return null;

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"16px"}}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{width:"100%",maxWidth:"420px",background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"24px"}}>
        <h2 style={{fontSize:"18px",fontWeight:"700",color:"var(--ink)",marginBottom:"16px"}}>New Ticket</h2>
        {error && <div style={{marginBottom:"16px",fontSize:"13px",color:"#b91c1c",background:"#fef2f2",padding:"8px 12px",borderRadius:"12px"}}>{error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <Field label="Subject"><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} /></Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </Field>
          <Field label="Description"><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} /></Field>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginTop:"20px"}}>
          <button type="button" onClick={onClose} style={{padding:"10px 20px",background:"none",border:0,fontSize:"14px",color:"var(--ink-soft)",cursor:"pointer"}}>Cancel</button>
          <button type="submit" disabled={createTicket.isPending} style={{padding:"10px 20px",background:"var(--accent)",color:"var(--canvas)",fontSize:"14px",fontWeight:"500",borderRadius:"50px",border:0,cursor:"pointer",opacity:createTicket.isPending?.6:1}}>{createTicket.isPending ? "Creating…" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: any }) {
  const badge = priorityColor(ticket.priority);

  return (
    <div style={{
      background:"var(--canvas)",border:"1px solid var(--line)",borderRadius:"16px",padding:"14px",
      marginBottom:"10px",
    }}>
      <div style={{fontSize:"12px",fontFamily:"var(--mono)",color:"var(--ink-soft)",marginBottom:"6px"}}>{ticket.id}</div>
      <div style={{fontSize:"14px",fontWeight:"700",color:"var(--ink)",marginBottom:"8px"}}>{ticket.subject}</div>
      <span style={{fontSize:"11px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",...badge}}>{ticket.priority}</span>
    </div>
  );
}

function TicketColumn({ status, tickets, onNew }: { status: string; tickets: any[]; onNew?: () => void }) {
  return (
    <div style={{flex:1,minWidth:"260px",background:"var(--soft)",borderRadius:"var(--radius)",padding:"16px",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <span style={{fontSize:"14px",fontWeight:"700",color:"var(--ink)"}}>{status}</span>
        <span style={{fontSize:"12px",fontWeight:"500",color:"var(--ink-soft)",background:"var(--canvas)",borderRadius:"50px",padding:"2px 10px",border:"1px solid var(--line)"}}>{tickets.length}</span>
      </div>
      <div style={{flex:1,minHeight:"120px",borderRadius:"16px",padding:"4px"}}>
        {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
      </div>
      {onNew && <button onClick={onNew} style={{marginTop:"8px",padding:"8px 12px",background:"none",border:"1px dashed var(--line)",borderRadius:"12px",fontSize:"13px",color:"var(--ink-soft)",cursor:"pointer",textAlign:"left"}}><Icon name="fa-plus" /> New</button>}
    </div>
  );
}

export function TicketBoard() {
  const { data: tickets } = useTickets();
  const [modalOpen, setModalOpen] = useState(false);

  const byStatus = (status: string) => (tickets ?? []).filter((t) => t.status === status);
  const known = new Set(STATUSES);
  const other = (tickets ?? []).filter((t) => !known.has(t.status));

  return (
    <div>
      <div style={{display:"flex",gap:"16px",overflowX:"auto",paddingBottom:"8px"}}>
        {STATUSES.map((status) => (
          <TicketColumn key={status} status={status} tickets={byStatus(status)} onNew={status === "Open" ? () => setModalOpen(true) : undefined} />
        ))}
        {other.length > 0 && <TicketColumn status="Other" tickets={other} />}
      </div>
      <NewTicketModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
