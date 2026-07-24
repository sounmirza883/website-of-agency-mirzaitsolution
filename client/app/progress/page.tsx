import { milestones } from "../data";

export default function ProgressPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Track Progress</h1>
      <p className="text-sm text-gray-500 mb-6">Track progress of your project milestones</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Project", "Milestone", "Status", "Date"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{milestones.map((m) => <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{m.project}</td><td className="px-5 py-3 text-gray-600">{m.task}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${m.status === "Done" ? "bg-green-100 text-green-700" : m.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{m.status}</span></td><td className="px-5 py-3 text-gray-600">{m.date}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
