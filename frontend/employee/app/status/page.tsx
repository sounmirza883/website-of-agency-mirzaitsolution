"use client";

import { useStatusUpdates } from "../hooks";

export default function StatusPage() {
  const { data: updates } = useStatusUpdates();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Update Project Status</h1>
      <p className="text-sm text-gray-500 mb-6">Report progress on your assigned projects</p>
      <div className="grid gap-4">
        {updates?.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-semibold text-gray-900">{s.project}</h3><p className="text-sm text-gray-500 mt-0.5">{s.date}</p></div>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{s.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.progress}%` }} /></div>
            <p className="text-sm text-gray-600">{s.update}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
