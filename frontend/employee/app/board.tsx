"use client";

import { useState } from "react";
import { DragDropProvider, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useEmpTasks, useCreateTask, useUpdateTaskStatus, useAssignedProjects } from "./hooks";

const COLUMNS = ["Pending", "In Progress", "Done"];

interface Task {
  id: number;
  task: string;
  priority: string;
  due: string;
  status: string;
}

function priorityClasses(priority: string) {
  return priority === "High" ? "bg-red-100 text-red-700" : priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";
}

function Card({ task }: { task: Task }) {
  const { ref, isDragging } = useDraggable({ id: task.id, data: { status: task.status } });
  return (
    <div ref={ref} className={`bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-grab ${isDragging ? "opacity-40" : ""}`}>
      <p className="font-bold text-sm text-gray-900 mb-2">{task.task}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityClasses(task.priority)}`}>{task.priority}</span>
        <span className="text-xs text-gray-500">{task.due}</span>
      </div>
    </div>
  );
}

function Column({ status, tasks, onAdd }: { status: string; tasks: Task[]; onAdd: () => void }) {
  const { ref, isDropTarget } = useDroppable({ id: status, data: { status } });
  return (
    <div className="flex-1 min-w-65">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-gray-900">{status}</h3>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button onClick={onAdd} className="text-xs font-medium text-accent-2">+ New</button>
      </div>
      <div ref={ref} className={`bg-gray-50 rounded-xl p-2 min-h-50 border-2 ${isDropTarget ? "border-accent-2-400 bg-accent-2-100" : "border-transparent"}`}>
        {tasks.map((t) => <Card key={t.id} task={t} />)}
      </div>
    </div>
  );
}

export function TaskBoard() {
  const { data: tasks } = useEmpTasks();
  const { data: projects } = useAssignedProjects();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ project: "", task: "", priority: "Medium", due: "" });
  const [error, setError] = useState("");

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return;
    const taskId = event.operation.source?.id;
    const status = event.operation.target?.id;
    if (taskId == null || status == null) return;
    updateStatus.mutate({ id: Number(taskId), status: String(status) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createTask.mutateAsync(form);
      setForm({ project: "", task: "", priority: "Medium", due: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((status) => (
            <Column key={status} status={status} tasks={tasks?.filter((t) => t.status === status) ?? []} onAdd={() => setOpen(true)} />
          ))}
        </div>
      </DragDropProvider>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Task</h2>
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
              <input required placeholder="Task" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input required type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createTask.isPending} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createTask.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
