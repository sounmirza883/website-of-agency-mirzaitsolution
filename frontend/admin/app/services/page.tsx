"use client";

import { useState } from "react";
import { useServices, useCreateService } from "../hooks";
import { Field, fieldClass } from "../components";

export default function ServicesPage() {
  const { data: services } = useServices();
  const createService = useCreateService();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createService.mutateAsync(form);
      setForm({ name: "", price: "", duration: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Services</h1>
          <p className="text-sm text-gray-500">Manage your service offerings</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ Add Service</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Price", "Duration"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{services?.map((s) => <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{s.name}</td><td className="px-5 py-3 text-gray-600">{s.price}</td><td className="px-5 py-3 text-gray-600">{s.duration}</td></tr>)}</tbody>
        </table>
        {services?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No services yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Service</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} /></Field>
              <Field label="Price"><input required placeholder="e.g. $199" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={fieldClass} /></Field>
              <Field label="Duration"><input required placeholder="e.g. 3-5 days" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={fieldClass} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createService.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createService.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
