"use client";

import { useState } from "react";
import { useInvoices, useCreateInvoice, useClientsList, useVerifyInvoice } from "../hooks";

function statusBadgeClass(status: string) {
  if (status === "Paid") return "bg-green-100 text-green-700";
  if (status === "PendingVerification") return "bg-amber-100 text-amber-700";
  return "bg-yellow-100 text-yellow-700"; // Unpaid
}

export default function InvoicesPage() {
  const { data: invoices } = useInvoices();
  const { data: clients } = useClientsList();
  const createInvoice = useCreateInvoice();
  const verifyInvoice = useVerifyInvoice();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientUserId: "", project: "", amount: "", date: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const selected = clients?.find((c) => String(c.id) === form.clientUserId);
      if (!selected) throw new Error("Please select a client");
      await createInvoice.mutateAsync({
        client: selected.name,
        clientUserId: selected.id,
        project: form.project,
        amount: Number(form.amount),
        date: form.date,
      });
      setForm({ clientUserId: "", project: "", amount: "", date: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Invoices</h1>
          <p className="text-sm text-gray-500">Generate and manage invoices</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Invoice</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Invoice", "Client", "Amount", "Status", "Date", "Proof / Verification"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{invoices?.map((inv) => (
            <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{inv.id}</td>
              <td className="px-5 py-3 text-gray-600">{inv.client}</td>
              <td className="px-5 py-3 font-medium">{inv.amount}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${statusBadgeClass(inv.status)}`}>{inv.status}</span></td>
              <td className="px-5 py-3 text-gray-600">{inv.date}</td>
              <td className="px-5 py-3">
                {inv.status === "PendingVerification" && (
                  <div className="flex items-center gap-2">
                    {inv.proofUrl && <a href={inv.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Proof</a>}
                    <button onClick={() => verifyInvoice.mutate({ id: inv.id, approve: true })} disabled={verifyInvoice.isPending} className="text-xs text-green-700 hover:text-green-900 border border-green-200 rounded-md px-2 py-1 disabled:opacity-50">Verify</button>
                    <button onClick={() => verifyInvoice.mutate({ id: inv.id, approve: false })} disabled={verifyInvoice.isPending} className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2 py-1 disabled:opacity-50">Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {invoices?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No invoices yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Invoice</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <select required value={form.clientUserId} onChange={(e) => setForm({ ...form, clientUserId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select client</option>
                {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input required placeholder="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createInvoice.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createInvoice.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
