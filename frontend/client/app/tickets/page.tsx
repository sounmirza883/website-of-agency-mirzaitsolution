"use client";

import { useTickets } from "../hooks";

export default function TicketsPage() {
  const { data: tickets } = useTickets();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Support Tickets</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Open and track support tickets</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",overflow:"hidden"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"var(--soft)",textAlign:"left"}}>{["Ticket", "Subject", "Priority", "Status", "Updated"].map((h) => <th key={h} style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink-soft)"}}>{h}</th>)}</tr></thead>
          <tbody>{tickets?.map((t) => <tr key={t.id} style={{borderTop:"1px solid var(--line)"}}><td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{t.id}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{t.subject}</td><td style={{padding:"12px 20px"}}><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:t.priority==="High"?"#fef2f2":"#fef3c7",color:t.priority==="High"?"#b91c1c":"#92400e"}}>{t.priority}</span></td><td style={{padding:"12px 20px"}}><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:t.status==="Open"?"var(--red-light)":"#f3f4f6",color:t.status==="Open"?"var(--red)":"#4b5563"}}>{t.status}</span></td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{t.updated}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
