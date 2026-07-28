"use client";

import { useState } from "react";
import { useLeaveRequests, useRequestLeave } from "../hooks";

export default function LeavePage() {
  const { data: requests } = useLeaveRequests();
  const requestLeave = useRequestLeave();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "Sick Leave", reason: "", from: "", to: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await requestLeave.mutateAsync(form);
      setForm({ type: "Sick Leave", reason: "", from: "", to: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Leave Requests</h1>
          <p className="text-sm text-gray-500">Request leave and view your leave history</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Request Leave</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Type", "Reason", "From", "To", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{requests?.map((l) => <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{l.type}</td><td className="px-5 py-3 text-gray-600">{l.reason}</td><td className="px-5 py-3 text-gray-600">{l.from}</td><td className="px-5 py-3 text-gray-600">{l.to}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${l.status === "Approved" ? "bg-green-100 text-green-700" : l.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{l.status}</span></td></tr>)}</tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Request Leave</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>Sick Leave</option>
                <option>Personal Leave</option>
                <option>Annual Leave</option>
              </select>
              <textarea required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
              <input required type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={requestLeave.isPending} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{requestLeave.isPending ? "Submitting…" : "Submit"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
