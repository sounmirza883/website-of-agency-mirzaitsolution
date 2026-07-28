"use client";

import { useAdminTickets, useSetTicketStatus } from "../hooks";

export default function AdminTicketsPage() {
  const { data: tickets } = useAdminTickets();
  const setStatus = useSetTicketStatus();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Tickets</h1>
        <p className="text-sm text-gray-500">Support tickets raised by clients</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Ticket", "Client", "Subject", "Priority", "Status", "Updated", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{tickets?.map((t: any) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{t.id}</td>
              <td className="px-5 py-3 text-gray-600">
                <div>{t.users?.name ?? "—"}</div>
                {t.users?.company && <div className="text-xs text-gray-400">{t.users.company}</div>}
              </td>
              <td className="px-5 py-3 text-gray-600">{t.subject}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.priority === "High" ? "bg-red-100 text-red-700" : t.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.priority}</span></td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${t.status === "Open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{t.status}</span></td>
              <td className="px-5 py-3 text-gray-600">{t.updated}</td>
              <td className="px-5 py-3">
                {t.status === "Open" ? (
                  <button onClick={() => setStatus.mutate({ id: t.id, status: "Closed" })} disabled={setStatus.isPending} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1 whitespace-nowrap disabled:opacity-50">Close</button>
                ) : (
                  <button onClick={() => setStatus.mutate({ id: t.id, status: "Open" })} disabled={setStatus.isPending} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1 whitespace-nowrap disabled:opacity-50">Reopen</button>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {tickets?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No tickets yet</div>}
      </div>
    </div>
  );
}
