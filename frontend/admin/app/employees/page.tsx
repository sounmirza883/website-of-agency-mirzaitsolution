"use client";

import { useState } from "react";
import { useEmployees, useCreateEmployee, useSetEmployeePermission, useUpdateUserDetails, useDeleteUser } from "../hooks";
import { Field, fieldClass } from "../components";

export default function EmployeesPage() {
  const { data: employees } = useEmployees();
  const createEmployee = useCreateEmployee();
  const setPermission = useSetEmployeePermission();
  const updateDetails = useUpdateUserDetails();
  const deleteUser = useDeleteUser();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", dept: "", position: "", canCreateClients: false });
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", dept: "", position: "" });
  const [editError, setEditError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createEmployee.mutateAsync(form);
      setForm({ name: "", email: "", password: "", dept: "", position: "", canCreateClients: false });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function openEdit(emp: any) {
    setEditing(emp);
    setEditForm({ name: emp.name ?? "", email: emp.email ?? "", dept: emp.dept ?? "", position: emp.position ?? "" });
    setEditError("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    try {
      await updateDetails.mutateAsync({ id: editing.id, payload: editForm });
      setEditing(null);
    } catch (err) {
      setEditError((err as Error).message);
    }
  }

  async function handleDelete(emp: any) {
    if (!confirm(`Delete employee "${emp.name}"? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync(emp.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Employees</h1>
          <p className="text-sm text-gray-500">Manage all employees</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ Add Employee</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Name", "Email", "Department", "Position", "Status", "Can create clients", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{employees?.map((e) => (
            <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{e.name}</td>
              <td className="px-5 py-3 text-gray-600">{e.email}</td>
              <td className="px-5 py-3 text-gray-600">{e.dept}</td>
              <td className="px-5 py-3 text-gray-600">{e.position}</td>
              <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${e.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{e.status}</span></td>
              <td className="px-5 py-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={e.canCreateClients} onChange={(ev) => setPermission.mutate({ id: e.id, canCreateClients: ev.target.checked })} />
                  <span className="text-gray-600 text-xs">{e.canCreateClients ? "Allowed" : "Not allowed"}</span>
                </label>
              </td>
              <td className="px-5 py-3">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(e)} className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2 py-1">Delete</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {employees?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No employees yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Employee</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} /></Field>
              <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} /></Field>
              <Field label="Temporary Password"><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={fieldClass} /></Field>
              <Field label="Department"><input required value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} className={fieldClass} /></Field>
              <Field label="Position"><input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={fieldClass} /></Field>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.canCreateClients} onChange={(e) => setForm({ ...form, canCreateClients: e.target.checked })} />
                Allow this employee to create clients
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createEmployee.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createEmployee.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Edit Employee</h2>
            {editError && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</div>}
            <div className="space-y-3">
              <Field label="Name"><input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={fieldClass} /></Field>
              <Field label="Email"><input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={fieldClass} /></Field>
              <Field label="Department"><input required value={editForm.dept} onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })} className={fieldClass} /></Field>
              <Field label="Position"><input required value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} className={fieldClass} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={updateDetails.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{updateDetails.isPending ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
