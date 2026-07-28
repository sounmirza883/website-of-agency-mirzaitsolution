"use client";

import { useAssignedProjects } from "../hooks";

export default function ProjectsPage() {
  const { data: projects } = useAssignedProjects();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Assigned Projects</h1>
      <p className="text-sm text-gray-500 mb-6">View all projects assigned to you</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Project", "Client", "Status", "Deadline"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{projects?.map((p) => <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{p.name}</td><td className="px-5 py-3 text-gray-600">{p.client}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span></td><td className="px-5 py-3 text-gray-600">{p.deadline}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
