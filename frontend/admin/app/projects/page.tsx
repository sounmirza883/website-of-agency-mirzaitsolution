"use client";

import { useState } from "react";
import { useProjects } from "../hooks";
import { ProjectBoard } from "../board";

export default function ProjectsPage() {
  const { data: projects } = useProjects();
  const [view, setView] = useState<"board" | "table">("board");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Projects</h1>
          <p className="text-sm text-gray-500">Manage all client projects</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView("board")} className={`text-sm font-medium px-3 py-1.5 rounded-md ${view === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Board</button>
          <button onClick={() => setView("table")} className={`text-sm font-medium px-3 py-1.5 rounded-md ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Table</button>
        </div>
      </div>

      {view === "board" ? (
        <ProjectBoard />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left">{["Project", "Client", "Status", "Deadline"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
            <tbody>{projects?.map((p) => <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{p.name}</td><td className="px-5 py-3 text-gray-600">{p.client}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span></td><td className="px-5 py-3 text-gray-600">{p.deadline}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
