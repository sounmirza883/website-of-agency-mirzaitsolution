"use client";

import { useState } from "react";
import { useStatusUpdates, usePostStatusUpdate, useAssignedProjects } from "../hooks";

export default function StatusPage() {
  const { data: updates } = useStatusUpdates();
  const { data: projects } = useAssignedProjects();
  const postUpdate = usePostStatusUpdate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ project: "", update: "", progress: 0 });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await postUpdate.mutateAsync(form);
      setForm({ project: "", update: "", progress: 0 });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Update Project Status</h1>
          <p className="text-sm text-gray-500">Report progress on your assigned projects</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Post Update</button>
      </div>

      <div className="grid gap-4">
        {updates?.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-semibold text-gray-900">{s.project}</h3><p className="text-sm text-gray-500 mt-0.5">{s.date}</p></div>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{s.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.progress}%` }} /></div>
            <p className="text-sm text-gray-600">{s.update}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Post Update</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              {projects && projects.length > 0 ? (
                <select required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              ) : (
                <input required placeholder="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              )}
              <textarea required placeholder="Update" value={form.update} onChange={(e) => setForm({ ...form, update: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
              <input required type="number" min={0} max={100} placeholder="Progress (%)" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={postUpdate.isPending} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{postUpdate.isPending ? "Posting…" : "Post"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
