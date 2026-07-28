"use client";

import { useAdminLeaveRequests, useSetLeaveRequestStatus } from "../hooks";

export default function AdminLeavePage() {
  const { data: requests } = useAdminLeaveRequests();
  const setStatus = useSetLeaveRequestStatus();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Leave Requests</h1>
          <p className="text-sm text-gray-500">Review and approve employee leave requests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Employee", "Type", "Reason", "From", "To", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{requests?.map((l: any) => (
            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{l.users?.name ?? "—"}</td>
              <td className="px-5 py-3 text-gray-600">{l.type}</td>
              <td className="px-5 py-3 text-gray-600">{l.reason}</td>
              <td className="px-5 py-3 text-gray-600">{l.from}</td>
              <td className="px-5 py-3 text-gray-600">{l.to}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${l.status === "Approved" ? "bg-green-100 text-green-700" : l.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{l.status}</span></td>
              <td className="px-5 py-3">
                {l.status === "Pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => setStatus.mutate({ id: l.id, status: "Approved" })} disabled={setStatus.isPending} className="text-xs text-green-700 hover:text-green-900 border border-green-200 rounded-md px-2 py-1 disabled:opacity-50">Approve</button>
                    <button onClick={() => setStatus.mutate({ id: l.id, status: "Rejected" })} disabled={setStatus.isPending} className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2 py-1 disabled:opacity-50">Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {requests?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No leave requests yet</div>}
      </div>
    </div>
  );
}
