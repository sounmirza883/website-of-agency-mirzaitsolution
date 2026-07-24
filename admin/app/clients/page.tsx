import { clientsList } from "../data";

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Clients</h1>
      <p className="text-sm text-gray-500 mb-6">Manage all clients</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Company", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{clientsList.map((c) => <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{c.name}</td><td className="px-5 py-3 text-gray-600">{c.email}</td><td className="px-5 py-3 text-gray-600">{c.company}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
