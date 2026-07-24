import { leaveRequests } from "../data";

export default function LeavePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Leave Requests</h1>
      <p className="text-sm text-gray-500 mb-6">Request leave and view your leave history</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Type", "Reason", "From", "To", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{leaveRequests.map((l) => <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{l.type}</td><td className="px-5 py-3 text-gray-600">{l.reason}</td><td className="px-5 py-3 text-gray-600">{l.from}</td><td className="px-5 py-3 text-gray-600">{l.to}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${l.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{l.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
