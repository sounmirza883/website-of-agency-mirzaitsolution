import { clientInvoices } from "../data";

export default function InvoicesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Invoices</h1>
      <p className="text-sm text-gray-500 mb-6">View and pay your invoices</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Invoice", "Project", "Amount", "Status", "Due Date"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{clientInvoices.map((inv) => <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{inv.id}</td><td className="px-5 py-3 text-gray-600">{inv.project}</td><td className="px-5 py-3 font-medium">{inv.amount}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${inv.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{inv.status}</span></td><td className="px-5 py-3 text-gray-600">{inv.due}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
