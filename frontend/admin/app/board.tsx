"use client";

import { useState } from "react";
import { DragDropProvider, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useProjects, useCreateProject, useUpdateProjectStatus } from "./hooks";

const COLUMNS = ["Pending", "In Progress", "Completed"];

function Card({ project }: { project: any }) {
  const { ref, isDragging } = useDraggable({ id: project.id });
  return (
    <div ref={ref} className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab ${isDragging ? "opacity-40" : ""}`}>
      <div className="font-semibold text-sm">{project.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">{project.client}</div>
      <div className="inline-block mt-2 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{project.deadline}</div>
    </div>
  );
}

function Column({ status, items, onAdd }: { status: string; items: any[]; onAdd: () => void }) {
  const { ref, isDropTarget } = useDroppable({ id: status });
  return (
    <div ref={ref} className={`bg-gray-50 rounded-xl border border-gray-200 p-3 flex flex-col gap-3 min-h-60 transition-colors ${isDropTarget ? "ring-2 ring-gray-300 bg-gray-100" : ""}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm text-gray-700">{status}</h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {items.map((p) => <Card key={p.id} project={p} />)}
      </div>
      <button onClick={onAdd} className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg py-2">+ New</button>
    </div>
  );
}

export function ProjectBoard() {
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const updateStatus = useUpdateProjectStatus();
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", client: "", deadline: "" });
  const [error, setError] = useState("");

  function openAdd(status: string) {
    setForm({ name: "", client: "", deadline: "" });
    setError("");
    setModalStatus(status);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createProject.mutateAsync({ ...form, status: modalStatus! });
      setModalStatus(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return;
    const id = event.operation.source?.id;
    const status = event.operation.target?.id;
    if (id == null || status == null) return;
    updateStatus.mutate({ id: Number(id), status: String(status) });
  }

  return (
    <div>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((status) => (
            <Column key={status} status={status} items={projects?.filter((p) => p.status === status) ?? []} onAdd={() => openAdd(status)} />
          ))}
        </div>
      </DragDropProvider>

      {modalStatus && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setModalStatus(null)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">Add Project</h2>
            <p className="text-xs text-gray-500 mb-4">Status: {modalStatus}</p>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required placeholder="Client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setModalStatus(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createProject.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createProject.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
