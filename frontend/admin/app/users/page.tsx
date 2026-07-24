"use client";

import { useUsers } from "../hooks";

export default function UsersPage() {
  const { data: users } = useUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Users</h1>
      <p className="text-sm text-gray-500 mb-6">Manage all system users</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Role", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{users?.map((u) => <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{u.name}</td><td className="px-5 py-3 text-gray-600">{u.email}</td><td className="px-5 py-3">{u.role}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{u.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
