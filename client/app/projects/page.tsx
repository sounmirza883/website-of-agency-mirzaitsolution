import { clientProjects } from "../data";

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Projects</h1>
      <p className="text-sm text-gray-500 mb-6">View all your ongoing and completed projects</p>
      <div className="grid gap-4">
        {clientProjects.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div><h3 className="font-semibold text-gray-900">{p.name}</h3><p className="text-sm text-gray-500 mt-0.5">Deadline: {p.deadline}</p></div>
            <div className="flex items-center gap-4">
              <div className="w-32 bg-gray-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.progress}%` }} /></div>
              <span className="text-xs text-gray-500 w-10">{p.progress}%</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
