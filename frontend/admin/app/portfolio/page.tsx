"use client";

import { useState } from "react";
import { usePortfolioList, useCreatePortfolioItem } from "../hooks";
import { Field, fieldClass } from "../components";

export default function PortfolioPage() {
  const { data: items } = usePortfolioList();
  const createPortfolioItem = useCreatePortfolioItem();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", client: "", category: "", description: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createPortfolioItem.mutateAsync(form);
      setForm({ title: "", client: "", category: "", description: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Portfolio</h1>
          <p className="text-sm text-gray-500">Manage portfolio items</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ Add Item</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Client", "Category"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{items?.map((p) => <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{p.title}</td><td className="px-5 py-3 text-gray-600">{p.client}</td><td className="px-5 py-3 text-gray-600">{p.category}</td></tr>)}</tbody>
        </table>
        {items?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No portfolio items yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Portfolio Item</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} /></Field>
              <Field label="Client"><input required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className={fieldClass} /></Field>
              <Field label="Category"><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldClass} /></Field>
              <Field label="Description (optional)"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldClass} rows={3} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createPortfolioItem.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createPortfolioItem.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
