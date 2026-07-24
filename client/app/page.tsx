import { clientProjects, clientInvoices, tickets } from "./data";

const stats = [
  { label: "Active Projects", value: "2" },
  { label: "Completed Projects", value: "1" },
  { label: "Open Tickets", value: "3" },
  { label: "Pending Invoices", value: "2" },
];

export default function ClientDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome back to your client portal</p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Your Projects</h2>
          {clientProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1"><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-gray-500">Deadline: {p.deadline}</div></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Invoices</h2>
          {clientInvoices.slice(0, 3).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div><div className="text-sm font-medium">{inv.id}</div><div className="text-xs text-gray-500">{inv.project}</div></div>
              <div className="text-right"><div className="text-sm font-medium">{inv.amount}</div><span className={`text-xs font-medium px-2 py-0.5 rounded ${inv.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{inv.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
