"use client";

import { useMemo, useState } from "react";
import { useAssignedProjects, useCreateEmpNotification, useEmpNotifications } from "../hooks";
import { Field, fieldClass } from "../components";

type TargetRole = "employee" | "client" | "all";

export default function NotificationsPage() {
  const { data: notifications } = useEmpNotifications();
  const { data: projects } = useAssignedProjects();
  const createNotification = useCreateEmpNotification();

  const clients = useMemo(() => {
    const map = new Map<number, string>();
    projects?.forEach((p) => {
      if (p.clientId != null && !map.has(p.clientId)) map.set(p.clientId, p.client);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [projects]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; msg: string; targetRole: TargetRole; targetClientId: string }>({
    title: "",
    msg: "",
    targetRole: "employee",
    targetClientId: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createNotification.mutateAsync({
        title: form.title,
        msg: form.msg,
        targetRole: form.targetRole,
        ...(form.targetRole === "client" ? { targetClientId: Number(form.targetClientId) } : {}),
      });
      setForm({ title: "", msg: "", targetRole: "employee", targetClientId: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notifications</h1>
          <p className="text-sm text-gray-500">Notifications for you, and ones you&apos;ve sent</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ New</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {notifications?.length ? notifications.map((n) => (
          <div key={n.id} className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-gray-400">{n.date}</div>
            </div>
            <div className="text-sm text-gray-600 mt-1">{n.msg}</div>
          </div>
        )) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No notifications yet.</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">New Notification</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} /></Field>
              <Field label="Message"><textarea required value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} className={fieldClass} rows={3} /></Field>
              <Field label="Send To">
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value as TargetRole, targetClientId: "" })}
                  className={fieldClass}
                >
                  <option value="employee">Employees</option>
                  <option value="client">Specific Client</option>
                  <option value="all">Employees &amp; Client</option>
                </select>
              </Field>
              {form.targetRole === "client" && (
                <Field label="Client">
                  <select
                    required
                    value={form.targetClientId}
                    onChange={(e) => setForm({ ...form, targetClientId: e.target.value })}
                    className={fieldClass}
                  >
                    <option value="" disabled>Select a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              {form.targetRole === "client" && clients.length === 0 && (
                <p className="text-xs text-gray-500">No clients found among your assigned projects yet.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createNotification.isPending} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createNotification.isPending ? "Sending…" : "Send"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
