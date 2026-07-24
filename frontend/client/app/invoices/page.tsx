"use client";

import { useInvoices, usePayInvoice } from "../hooks";

export default function InvoicesPage() {
  const { data: invoices } = useInvoices();
  const payInvoice = usePayInvoice();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Invoices</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>View and pay your invoices</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",overflow:"hidden"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"var(--soft)",textAlign:"left"}}>{["Invoice", "Project", "Amount", "Status", "Due Date", ""].map((h) => <th key={h} style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink-soft)"}}>{h}</th>)}</tr></thead>
          <tbody>{invoices?.map((inv) => <tr key={inv.id} style={{borderTop:"1px solid var(--line)"}}><td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{inv.id}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{inv.project}</td><td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{inv.amount}</td><td style={{padding:"12px 20px"}}><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:inv.status==="Paid"?"#dcfce7":"#fef3c7",color:inv.status==="Paid"?"#166534":"#92400e"}}>{inv.status}</span></td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{inv.due}</td><td style={{padding:"12px 20px"}}>{inv.status!=="Paid" && <button onClick={() => payInvoice.mutate(inv.id)} disabled={payInvoice.isPending} style={{padding:"6px 16px",background:"var(--red)",color:"#fff",fontSize:"12px",fontWeight:"500",borderRadius:"50px",border:0,cursor:"pointer",opacity:payInvoice.isPending?.6:1}}>{payInvoice.isPending && payInvoice.variables===inv.id?"Paying…":"Pay"}</button>}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
