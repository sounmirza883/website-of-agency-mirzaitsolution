"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminTasks, useCreateAdminTask, useUpdateAdminTask, useDeleteAdminTask, useEmployees, useProjects, useActiveTimers } from "../hooks";
import { Field, fieldClass, ProgressBar } from "../components";

const STATUSES = ["Pending", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];

const EMPTY = { employeeId: "", projectId: "", task: "", description: "", priority: "Medium", due: "", scheduledStart: "", scheduledEnd: "", estimatedMinutes: "", clientVisible: true };

function priorityClasses(priority: string) {
  return priority === "High" ? "bg-red-100 text-red-700" : priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";
}

/** "2026-08-17T09:00" from the datetime-local input; blank stays blank. */
function fmtWindow(start?: string | null, end?: string | null) {
  if (!start) return "—";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return "—";
  const date = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const from = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (!end) return `${date}, ${from}`;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return `${date}, ${from}`;
  return `${date}, ${from} – ${e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

/** Ticks locally so an open timer's total moves without polling every second. */
function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.max(0, Math.floor((now - new Date(since).getTime()) / 60000));
  const h = Math.floor(mins / 60);
  return <>{h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`}</>;
}

export default function SchedulingPage() {
  const { data: tasks } = useAdminTasks();
  const { data: employees } = useEmployees();
  const { data: projects } = useProjects();
  const { data: activeTimers } = useActiveTimers();
  const createTask = useCreateAdminTask();
  const updateTask = useUpdateAdminTask();
  const deleteTask = useDeleteAdminTask();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [filterEmployee, setFilterEmployee] = useState("");

  const visible = useMemo(
    () => (filterEmployee ? tasks?.filter((t: any) => String(t.employee_id) === filterEmployee) : tasks) ?? [],
    [tasks, filterEmployee]
  );

  // Open work per employee — the "who is overloaded" question the admin actually asks.
  const workload = useMemo(() => {
    const map = new Map<number, { open: number; minutes: number }>();
    for (const t of tasks ?? []) {
      if (t.status === "Done" || t.employee_id == null) continue;
      const row = map.get(t.employee_id) ?? { open: 0, minutes: 0 };
      row.open += 1;
      row.minutes += t.estimatedMinutes ?? 0;
      map.set(t.employee_id, row);
    }
    return map;
  }, [tasks]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setWarnings([]);
    try {
      const created = await createTask.mutateAsync({
        ...form,
        employeeId: Number(form.employeeId),
        projectId: form.projectId ? Number(form.projectId) : null,
        estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
      });
      // Warnings are advisory: the task is already created. The admin knows
      // things the system does not, so a conflict never blocks the assignment.
      if (created?.warnings?.length) setWarnings(created.warnings);
      else setOpen(false);
      setForm(EMPTY);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Scheduling</h1>
          <p className="text-sm text-gray-500">Assign work to employees and track it</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setWarnings([]); setOpen(true); }} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ Assign Task</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {employees?.slice(0, 4).map((emp: any) => {
          const w = workload.get(emp.id) ?? { open: 0, minutes: 0 };
          return (
            <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{w.open}</div>
              <div className="text-sm text-gray-500 mt-1 truncate">{emp.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{w.minutes ? `${Math.round(w.minutes / 60)}h estimated` : "no estimate"}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-bold mb-3">Working Right Now</h2>
        {(activeTimers ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">Nobody has a timer running.</p>
        ) : (
          <div className="grid gap-2">
            {(activeTimers ?? []).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.employee?.name ?? `#${t.employee_id}`}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {t.task?.task ?? `task #${t.taskId}`}{t.task?.project ? ` · ${t.task.project}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-green-600"><Elapsed since={t.startedAt} /></span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 max-w-xs">
        <Field label="Filter by employee">
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className={fieldClass}>
            <option value="">All employees</option>
            {employees?.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </Field>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Task", "Assigned To", "Project", "Scheduled", "Priority", "Progress", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{visible.map((t: any) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{t.task}</td>
              <td className="px-5 py-3 text-gray-600">{t.assignee?.name ?? "—"}</td>
              <td className="px-5 py-3 text-gray-600">{t.project || "—"}</td>
              <td className="px-5 py-3 text-gray-600">{fmtWindow(t.scheduledStart, t.scheduledEnd)}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityClasses(t.priority)}`}>{t.priority}</span></td>
              <td className="px-5 py-3 w-32"><ProgressBar value={t.progress ?? 0} /></td>
              <td className="px-5 py-3">
                <select
                  value={t.status}
                  onChange={(e) => updateTask.mutate({ id: t.id, payload: { status: e.target.value } })}
                  className="px-2 py-1 border border-gray-200 rounded-md text-xs"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-5 py-3">
                <button
                  onClick={() => { if (confirm(`Delete task "${t.task}"?`)) deleteTask.mutate(t.id); }}
                  className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2 py-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {visible.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No tasks assigned yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6 max-h-[85vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4">Assign Task</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            {warnings.length > 0 && (
              <div className="mb-4 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                <p className="font-medium mb-1">Assigned, with warnings:</p>
                <ul className="list-disc pl-4 space-y-0.5">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                <button type="button" onClick={() => { setWarnings([]); setOpen(false); }} className="mt-2 text-xs underline">Close</button>
              </div>
            )}
            <div className="space-y-3">
              <Field label="Assign To">
                <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className={fieldClass}>
                  <option value="">Select employee</option>
                  {employees?.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </Field>
              <Field label="Project (optional)">
                <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className={fieldClass}>
                  <option value="">No project</option>
                  {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Task"><input required value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} className={fieldClass} /></Field>
              <Field label="Details (optional)"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldClass} rows={2} /></Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={fieldClass}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Scheduled Start"><input type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} className={fieldClass} /></Field>
              <Field label="Scheduled End"><input type="datetime-local" value={form.scheduledEnd} onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })} className={fieldClass} /></Field>
              <Field label="Estimated Minutes"><input type="number" min={0} value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} className={fieldClass} /></Field>
              <Field label="Due Date"><input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className={fieldClass} /></Field>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.clientVisible} onChange={(e) => setForm({ ...form, clientVisible: e.target.checked })} />
                Visible to the client
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createTask.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createTask.isPending ? "Assigning…" : "Assign"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
