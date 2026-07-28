"use client";

import { useAdminAttendance } from "../hooks";

export default function AdminAttendancePage() {
  const { data: attendance } = useAdminAttendance();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Attendance</h1>
          <p className="text-sm text-gray-500">View attendance across all employees</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Employee", "Date", "Check-In", "Check-Out", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{attendance?.map((a: any) => (
            <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{a.users?.name ?? "—"}</td>
              <td className="px-5 py-3 text-gray-600">{a.date}</td>
              <td className="px-5 py-3 text-gray-600">{a.checkIn}</td>
              <td className="px-5 py-3 text-gray-600">{a.checkOut}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${a.status === "Present" ? "bg-green-100 text-green-700" : a.status === "Absent" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{a.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
        {attendance?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No attendance records yet</div>}
      </div>
    </div>
  );
}
