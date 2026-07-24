import { tickets } from "../data";

export default function TicketsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Support Tickets</h1>
      <p className="text-sm text-gray-500 mb-6">Open and track support tickets</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Ticket", "Subject", "Priority", "Status", "Updated"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{tickets.map((t) => <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{t.id}</td><td className="px-5 py-3 text-gray-600">{t.subject}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "High" ? "bg-red-100 text-red-700" : t.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.priority}</span></td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.status === "Open" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{t.status}</span></td><td className="px-5 py-3 text-gray-500">{t.updated}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
