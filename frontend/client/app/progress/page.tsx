"use client";

import { useMilestones } from "../hooks";

export default function ProgressPage() {
  const { data: milestones } = useMilestones();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Track Progress</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Track progress of your project milestones</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",overflow:"hidden"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"var(--soft)",textAlign:"left"}}>{["Project", "Milestone", "Status", "Date"].map((h) => <th key={h} style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink-soft)"}}>{h}</th>)}</tr></thead>
          <tbody>{milestones?.map((m) => <tr key={m.id} style={{borderTop:"1px solid var(--line)"}}><td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{m.project}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{m.task}</td><td style={{padding:"12px 20px"}}><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:m.status==="Done"?"#dcfce7":m.status==="In Progress"?"var(--accent-light)":"#f3f4f6",color:m.status==="Done"?"#166534":m.status==="In Progress"?"var(--accent)":"#4b5563"}}>{m.status}</span></td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{m.date}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
