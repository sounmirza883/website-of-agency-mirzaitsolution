"use client";

import { useState } from "react";
import { useInvoices, useSubmitInvoicePayment } from "../hooks";

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  Paid: { background: "#dcfce7", color: "#166534" },
  Unpaid: { background: "#fef3c7", color: "#92400e" },
  PendingVerification: { background: "var(--accent-light)", color: "var(--accent)" },
};

export default function InvoicesPage() {
  const { data: invoices } = useInvoices();
  const submitPayment = useSubmitInvoicePayment();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  function handleSubmit(id: string) {
    const file = selectedFiles[id];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    submitPayment.mutate({ id, formData }, {
      onSuccess: () => setSelectedFiles((prev) => ({ ...prev, [id]: null })),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Invoices</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>View your invoices and submit proof of payment</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",overflow:"hidden"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"var(--soft)",textAlign:"left"}}>{["Invoice", "Project", "Amount", "Status", "Due Date", ""].map((h) => <th key={h} style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink-soft)"}}>{h}</th>)}</tr></thead>
          <tbody>
            {invoices?.map((inv) => {
              const badge = STATUS_STYLE[inv.status] || STATUS_STYLE.Unpaid;
              return (
                <tr key={inv.id} style={{borderTop:"1px solid var(--line)"}}>
                  <td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{inv.id}</td>
                  <td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{inv.project}</td>
                  <td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{inv.amount}</td>
                  <td style={{padding:"12px 20px"}}><span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:badge.background,color:badge.color}}>{inv.status === "PendingVerification" ? "Pending Verification" : inv.status}</span></td>
                  <td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{inv.due}</td>
                  <td style={{padding:"12px 20px"}}>
                    {inv.status === "Unpaid" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={(e) => setSelectedFiles((prev) => ({ ...prev, [inv.id]: e.target.files?.[0] ?? null }))}
                          style={{fontSize:"12px",color:"var(--ink-soft)",maxWidth:"160px"}}
                        />
                        <button
                          onClick={() => handleSubmit(inv.id)}
                          disabled={submitPayment.isPending || !selectedFiles[inv.id]}
                          style={{padding:"6px 16px",background:"var(--accent)",color:"var(--canvas)",fontSize:"12px",fontWeight:"500",borderRadius:"50px",border:0,cursor:"pointer",opacity:submitPayment.isPending || !selectedFiles[inv.id]?.6:1,whiteSpace:"nowrap"}}
                        >
                          {submitPayment.isPending && submitPayment.variables?.id === inv.id ? "Submitting…" : "Submit Payment Proof"}
                        </button>
                      </div>
                    )}
                    {inv.status === "PendingVerification" && inv.proofUrl && (
                      <a href={inv.proofUrl} target="_blank" rel="noreferrer" style={{fontSize:"12px",fontWeight:"500",color:"var(--accent)"}}>View submitted proof</a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
