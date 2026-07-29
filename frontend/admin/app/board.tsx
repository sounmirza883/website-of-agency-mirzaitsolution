"use client";

import { useState } from "react";
import { DragDropProvider, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useProjects, useCreateProject, useUpdateProjectStatus, useAssignProjectEmployee, useClientsList, useEmployees } from "./hooks";
import { ProjectChatModal } from "./chat-modal";

const COLUMNS = ["Pending", "In Progress", "Completed"];

export function ProjectEmployeeSelect({ project, employees, className }: { project: any; employees: any[]; className?: string }) {
  const assignEmployee = useAssignProjectEmployee();
  return (
    <select
      value={project.employeeId ?? ""}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => assignEmployee.mutate({ id: project.id, employeeId: e.target.value ? Number(e.target.value) : null })}
      className={className ?? "px-2 py-1 border border-gray-200 rounded-md text-xs"}
    >
      <option value="">Unassigned</option>
      {employees?.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
    </select>
  );
}

function Card({ project, employees, onOpenChat }: { project: any; employees: any[]; onOpenChat: (project: any) => void }) {
  const { ref, isDragging } = useDraggable({ id: project.id });
  return (
    <div ref={ref} className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab ${isDragging ? "opacity-40" : ""}`}>
      <div className="font-semibold text-sm">{project.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">{project.client}</div>
      <div className="inline-block mt-2 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{project.deadline}</div>
      <div onPointerDown={(e) => e.stopPropagation()} className="mt-2 space-y-1.5">
        <ProjectEmployeeSelect project={project} employees={employees} className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs" />
        <button
          onClick={(e) => { e.stopPropagation(); onOpenChat(project); }}
          className="w-full text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md py-1"
        >
          Open Chat
        </button>
      </div>
    </div>
  );
}

function Column({ status, items, employees, onAdd, onOpenChat }: { status: string; items: any[]; employees: any[]; onAdd: () => void; onOpenChat: (project: any) => void }) {
  const { ref, isDropTarget } = useDroppable({ id: status });
  return (
    <div ref={ref} className={`bg-gray-50 rounded-xl border border-gray-200 p-3 flex flex-col gap-3 min-h-60 transition-colors ${isDropTarget ? "ring-2 ring-gray-300 bg-gray-100" : ""}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm text-gray-700">{status}</h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {items.map((p) => <Card key={p.id} project={p} employees={employees} onOpenChat={onOpenChat} />)}
      </div>
      <button onClick={onAdd} className="text-sm text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg py-2">+ New</button>
    </div>
  );
}

export function ProjectBoard() {
  const { data: projects } = useProjects();
  const { data: clients } = useClientsList();
  const { data: employees } = useEmployees();
  const createProject = useCreateProject();
  const updateStatus = useUpdateProjectStatus();
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", clientId: "", employeeId: "", deadline: "" });
  const [error, setError] = useState("");
  const [chatProject, setChatProject] = useState<any | null>(null);

  function openAdd(status: string) {
    setForm({ name: "", clientId: "", employeeId: "", deadline: "" });
    setError("");
    setModalStatus(status);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const selectedClient = clients?.find((c) => String(c.id) === form.clientId);
      if (!selectedClient) throw new Error("Please select a client");
      await createProject.mutateAsync({
        name: form.name,
        client: selectedClient.name,
        clientId: selectedClient.id,
        employeeId: form.employeeId ? Number(form.employeeId) : undefined,
        status: modalStatus!,
        deadline: form.deadline,
      });
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
            <Column
              key={status}
              status={status}
              items={projects?.filter((p) => p.status === status) ?? []}
              employees={employees ?? []}
              onAdd={() => openAdd(status)}
              onOpenChat={setChatProject}
            />
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
              <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select client</option>
                {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Unassigned</option>
                {employees?.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
              <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setModalStatus(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createProject.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createProject.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      {chatProject && (
        <ProjectChatModal projectId={chatProject.id} projectName={chatProject.name} onClose={() => setChatProject(null)} />
      )}
    </div>
  );
}
