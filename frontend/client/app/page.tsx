"use client";

import { Icon } from "./components";
import { useProjects, useInvoices, useTickets } from "./hooks";

export default function ClientDashboard() {
  const { data: projects } = useProjects();
  const { data: invoices } = useInvoices();
  const { data: tickets } = useTickets();

  const stats = [
    { label: "Active Projects", value: String(projects?.filter(p => p.status === "In Progress").length ?? 0), icon: "fa-folder-open" },
    { label: "Completed Projects", value: String(projects?.filter(p => p.status === "Completed").length ?? 0), icon: "fa-check-circle" },
    { label: "Open Tickets", value: String(tickets?.filter(t => t.status === "Open").length ?? 0), icon: "fa-ticket-alt" },
    { label: "Pending Invoices", value: String(invoices?.filter(i => i.status !== "Paid").length ?? 0), icon: "fa-file-invoice" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Dashboard</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Welcome back to your client portal</p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
            <div className="flex items-center gap-3">
              <div style={{width:"40px",height:"40px",borderRadius:"12px",background:"var(--accent-light)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)"}}><Icon name={s.icon} /></div>
              <div><div className="text-2xl font-bold" style={{color:"var(--ink)"}}>{s.value}</div><div className="text-sm" style={{color:"var(--ink-soft)"}}>{s.label}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
          <h2 className="font-semibold mb-3" style={{color:"var(--ink)"}}>Your Projects</h2>
          {projects?.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2" style={{borderBottom:"1px solid var(--line)"}}>
              <div className="flex-1"><div className="text-sm font-medium" style={{color:"var(--ink)"}}>{p.name}</div><div className="text-xs" style={{color:"var(--ink-soft)"}}>Deadline: {p.deadline}</div></div>
              <span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:p.status==="Completed"?"#dcfce7":"var(--accent-light)",color:p.status==="Completed"?"#166534":"var(--accent)"}}>{p.status}</span>
            </div>
          ))}
        </div>
        <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
          <h2 className="font-semibold mb-3" style={{color:"var(--ink)"}}>Recent Invoices</h2>
          {invoices?.slice(0, 3).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2" style={{borderBottom:"1px solid var(--line)"}}>
              <div><div className="text-sm font-medium" style={{color:"var(--ink)"}}>{inv.id}</div><div className="text-xs" style={{color:"var(--ink-soft)"}}>{inv.project}</div></div>
              <div className="text-right"><div className="text-sm font-medium" style={{color:"var(--ink)"}}>{inv.amount}</div><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:inv.status==="Paid"?"#dcfce7":"#fef3c7",color:inv.status==="Paid"?"#166534":"#92400e"}}>{inv.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
