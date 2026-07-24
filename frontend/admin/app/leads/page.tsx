"use client";

import { useContactSubmissions } from "../hooks";

export default function LeadsPage() {
  const { data: leads } = useContactSubmissions();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Leads</h1>
      <p className="text-sm text-gray-500 mb-6">Contact form submissions from the public website</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Phone", "Service", "Message", "Submitted"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{leads?.map((l) => <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{l.name}</td><td className="px-5 py-3 text-gray-600">{l.email}</td><td className="px-5 py-3 text-gray-600">{l.phone}</td><td className="px-5 py-3 text-gray-600">{l.service}</td><td className="px-5 py-3 text-gray-600">{l.message}</td><td className="px-5 py-3 text-gray-600">{new Date(l.created_at).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
