"use client";

import { useState } from "react";
import { useMyClients, useCreateClient } from "../hooks";

export default function ClientsPage() {
  const { data: clients } = useMyClients();
  const createClient = useCreateClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createClient.mutateAsync(form);
      setForm({ name: "", email: "", password: "", company: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clients</h1>
          <p className="text-sm text-gray-500">Clients you've onboarded</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Client</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Company", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{clients?.map((c) => <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{c.name}</td><td className="px-5 py-3 text-gray-600">{c.email}</td><td className="px-5 py-3 text-gray-600">{c.company}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span></td></tr>)}</tbody>
        </table>
        {clients?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">You haven't added any clients yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Client</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createClient.isPending} className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createClient.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
