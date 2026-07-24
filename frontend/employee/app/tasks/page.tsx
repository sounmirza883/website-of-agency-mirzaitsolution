"use client";

import { useEmpTasks } from "../hooks";

export default function TasksPage() {
  const { data: tasks } = useEmpTasks();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Tasks</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your daily tasks</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Task", "Project", "Priority", "Due Date", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{tasks?.map((t) => <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{t.task}</td><td className="px-5 py-3 text-gray-600">{t.project}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "High" ? "bg-red-100 text-red-700" : t.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.priority}</span></td><td className="px-5 py-3 text-gray-600">{t.due}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.status === "Done" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{t.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
