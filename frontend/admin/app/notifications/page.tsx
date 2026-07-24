"use client";

import { useState } from "react";
import { useNotifications, useCreateNotification } from "../hooks";

export default function NotificationsPage() {
  const { data: notifications } = useNotifications();
  const createNotification = useCreateNotification();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", msg: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createNotification.mutateAsync(form);
      setForm({ title: "", msg: "" });
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
          <p className="text-sm text-gray-500">Send and view notifications</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Send Notification</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Message", "Date"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{notifications?.map((n) => <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{n.title}</td><td className="px-5 py-3 text-gray-600">{n.msg}</td><td className="px-5 py-3 text-gray-500">{n.date}</td></tr>)}</tbody>
        </table>
        {notifications?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No notifications yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Send Notification</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <textarea required placeholder="Message" value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={4} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createNotification.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createNotification.isPending ? "Sending…" : "Send"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
