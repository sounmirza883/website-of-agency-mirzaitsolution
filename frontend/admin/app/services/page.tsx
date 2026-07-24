"use client";

import { useServices } from "../hooks";

export default function ServicesPage() {
  const { data: services } = useServices();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Services</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your service offerings</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Price", "Duration"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{services?.map((s) => <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{s.name}</td><td className="px-5 py-3 text-gray-600">{s.price}</td><td className="px-5 py-3 text-gray-600">{s.duration}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
