"use client";

import { useAuth } from "./auth";
import { useAssignedProjects, useEmpTasks, useAttendance, useLeaveRequests } from "./hooks";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: projects } = useAssignedProjects();
  const { data: tasks } = useEmpTasks();
  const { data: attendance } = useAttendance();
  const { data: leaveRequests } = useLeaveRequests();
  const today = attendance?.[attendance.length - 1];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back{user?.name ? `, ${user.name}` : ""}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-2xl font-bold text-gray-900">{projects?.filter(p => p.status === "In Progress").length ?? "—"}</div><div className="text-sm text-gray-500 mt-1">Active Projects</div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-2xl font-bold text-gray-900">{tasks?.filter(t => t.status === "Pending" || t.status === "In Progress").length ?? "—"}</div><div className="text-sm text-gray-500 mt-1">Pending Tasks</div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-2xl font-bold text-gray-900">{today?.status === "Present" ? "✓" : "—"}</div><div className="text-sm text-gray-500 mt-1">Today: {today?.status ?? "..."}</div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-2xl font-bold text-gray-900">{leaveRequests?.filter(l => l.status === "Pending").length ?? "—"}</div><div className="text-sm text-gray-500 mt-1">Pending Leave</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">My Projects</h2>
          {projects?.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-gray-500">{p.client}</div></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Upcoming Tasks</h2>
          {tasks?.filter(t => t.status !== "Done").slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div><div className="text-sm font-medium">{t.task}</div><div className="text-xs text-gray-500">{t.project} • Due {t.due}</div></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
