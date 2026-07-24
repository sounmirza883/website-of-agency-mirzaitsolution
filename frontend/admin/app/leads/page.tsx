"use client";

import { useState } from "react";
import { useContactSubmissions, useClientsList, useEmployees, useCreateProject } from "../hooks";

export default function LeadsPage() {
  const { data: leads } = useContactSubmissions();
  const { data: clients } = useClientsList();
  const { data: employees } = useEmployees();
  const createProject = useCreateProject();

  const [assigning, setAssigning] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", clientId: "", employeeId: "", status: "Pending", deadline: "" });
  const [error, setError] = useState("");
  const [createdFor, setCreatedFor] = useState<number | null>(null);

  function openAssign(lead: any) {
    const matchedClient = clients?.find((c) => c.email?.toLowerCase() === lead.email?.toLowerCase());
    setForm({
      name: lead.service ? `${lead.service} — ${lead.name}` : `Project for ${lead.name}`,
      clientId: matchedClient ? String(matchedClient.id) : "",
      employeeId: "",
      status: "Pending",
      deadline: "",
    });
    setError("");
    setAssigning(lead);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const selectedClient = clients?.find((c) => String(c.id) === form.clientId);
      if (!selectedClient) throw new Error("Select a client account for this lead (create one on the Clients page if they don't have one yet)");
      await createProject.mutateAsync({
        name: form.name,
        client: selectedClient.name,
        clientId: selectedClient.id,
        employeeId: form.employeeId ? Number(form.employeeId) : undefined,
        status: form.status,
        deadline: form.deadline,
      });
      setCreatedFor(assigning.id);
      setAssigning(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Leads</h1>
      <p className="text-sm text-gray-500 mb-6">Contact form submissions from the public website</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Phone", "Service", "Message", "Submitted", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{leads?.map((l) => (
            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{l.name}</td>
              <td className="px-5 py-3 text-gray-600">{l.email}</td>
              <td className="px-5 py-3 text-gray-600">{l.phone}</td>
              <td className="px-5 py-3 text-gray-600">{l.service}</td>
              <td className="px-5 py-3 text-gray-600">{l.message}</td>
              <td className="px-5 py-3 text-gray-600">{new Date(l.created_at).toLocaleString()}</td>
              <td className="px-5 py-3">
                {createdFor === l.id ? (
                  <span className="text-xs text-green-600 font-medium">Project created</span>
                ) : (
                  <button onClick={() => openAssign(l)} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1 whitespace-nowrap">Assign Project</button>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {leads?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No leads yet</div>}
      </div>

      {assigning && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setAssigning(null)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">Assign Project</h2>
            <p className="text-xs text-gray-500 mb-4">From lead: {assigning.name} ({assigning.email})</p>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select client account</option>
                {clients?.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
              {!clients?.some((c) => c.email?.toLowerCase() === assigning.email?.toLowerCase()) && (
                <p className="text-xs text-amber-600">No client account matches this lead's email yet — create one on the Clients page first, or pick an existing client to assign this project to instead.</p>
              )}
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Assign employee (optional)</option>
                {employees?.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setAssigning(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createProject.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createProject.isPending ? "Creating…" : "Create Project"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
