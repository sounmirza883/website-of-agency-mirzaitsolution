"use client";

import { useEffect, useState } from "react";
import { useWorkSettings, useUpdateWorkSettings, useEmployeeSchedules, useSaveEmployeeSchedule, useClearEmployeeSchedule, useEmployees } from "../hooks";
import { Field, fieldClass } from "../components";

const DAYS = [["Sun", 0], ["Mon", 1], ["Tue", 2], ["Wed", 3], ["Thu", 4], ["Fri", 5], ["Sat", 6]] as const;

/** Times come back from Postgres as "09:00:00"; <input type="time"> wants "09:00". */
function toTimeInput(value: string | null | undefined) {
  return value ? String(value).slice(0, 5) : "";
}

function DayToggles({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map(([label, day]) => {
        const on = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => onChange(on ? value.filter((d) => d !== day) : [...value, day].sort())}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${on ? "bg-accent text-gray-50 border-accent" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function WorkSchedulePage() {
  const { data: settings } = useWorkSettings();
  const { data: employees } = useEmployees();
  const { data: overrides } = useEmployeeSchedules();
  const updateSettings = useUpdateWorkSettings();
  const saveOverride = useSaveEmployeeSchedule();
  const clearOverride = useClearEmployeeSchedule();

  const [form, setForm] = useState({ workDays: [1, 2, 3, 4, 5] as number[], startTime: "09:00", endTime: "18:00", breakMinutes: 60, timezone: "Asia/Karachi" });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ workDays: [] as number[], startTime: "", endTime: "", breakMinutes: "" });

  useEffect(() => {
    if (!settings) return;
    setForm({
      workDays: settings.workDays ?? [1, 2, 3, 4, 5],
      startTime: toTimeInput(settings.startTime) || "09:00",
      endTime: toTimeInput(settings.endTime) || "18:00",
      breakMinutes: settings.breakMinutes ?? 60,
      timezone: settings.timezone ?? "Asia/Karachi",
    });
  }, [settings]);

  const overrideFor = (id: number) => overrides?.find((o: any) => o.employee_id === id);

  function openEdit(emp: any) {
    const o = overrideFor(emp.id);
    setEditing(emp);
    setEditForm({
      workDays: o?.workDays ?? [],
      startTime: toTimeInput(o?.startTime),
      endTime: toTimeInput(o?.endTime),
      breakMinutes: o?.breakMinutes == null ? "" : String(o.breakMinutes),
    });
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    await updateSettings.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSaveOverride(e: React.FormEvent) {
    e.preventDefault();
    // An empty field means "inherit the company default", which the API stores
    // as NULL — that is why blanks are sent rather than filled in from `form`.
    await saveOverride.mutateAsync({
      id: editing.id,
      payload: {
        workDays: editForm.workDays.length ? editForm.workDays : null,
        startTime: editForm.startTime || null,
        endTime: editForm.endTime || null,
        breakMinutes: editForm.breakMinutes === "" ? null : Number(editForm.breakMinutes),
      },
    });
    setEditing(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Work Schedule</h1>
          <p className="text-sm text-gray-500">Company working hours, and per-employee exceptions</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-6">
        <h2 className="text-sm font-bold mb-4">Company Default</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Field label="Start Time"><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={fieldClass} /></Field>
          <Field label="End Time"><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={fieldClass} /></Field>
          <Field label="Break (minutes)"><input type="number" min={0} value={form.breakMinutes} onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Timezone"><input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={fieldClass} /></Field>
        </div>
        <div className="mb-4">
          <div className="block text-xs font-medium text-gray-500 mb-1">Working Days</div>
          <DayToggles value={form.workDays} onChange={(workDays) => setForm({ ...form, workDays })} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={updateSettings.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            {updateSettings.isPending ? "Saving…" : "Save"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
          {updateSettings.isError && <span className="text-sm text-red-600">{(updateSettings.error as Error).message}</span>}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-sm font-bold">Per-Employee Hours</h2>
          <p className="text-xs text-gray-500 mt-0.5">Anything left blank follows the company default above.</p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Employee", "Working Days", "Hours", "Break", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{employees?.map((emp: any) => {
            const o = overrideFor(emp.id);
            const days = o?.workDays ?? form.workDays;
            return (
              <tr key={emp.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{emp.name}{!o && <span className="ml-2 text-xs text-gray-500">default</span>}</td>
                <td className="px-5 py-3 text-gray-600">{DAYS.filter(([, d]) => days.includes(d)).map(([l]) => l).join(", ") || "—"}</td>
                <td className="px-5 py-3 text-gray-600">{toTimeInput(o?.startTime) || form.startTime} – {toTimeInput(o?.endTime) || form.endTime}</td>
                <td className="px-5 py-3 text-gray-600">{o?.breakMinutes ?? form.breakMinutes} min</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(emp)} className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1">Edit</button>
                    {o && <button onClick={() => clearOverride.mutate(emp.id)} className="text-xs text-red-600 hover:text-red-800 border border-red-200 rounded-md px-2 py-1">Reset</button>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
        {employees?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No employees yet</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={handleSaveOverride} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">{editing.name}</h2>
            <p className="text-xs text-gray-500 mb-4">Leave a field blank to follow the company default.</p>
            <div className="space-y-3">
              <div>
                <div className="block text-xs font-medium text-gray-500 mb-1">Working Days</div>
                <DayToggles value={editForm.workDays} onChange={(workDays) => setEditForm({ ...editForm, workDays })} />
              </div>
              <Field label="Start Time"><input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className={fieldClass} /></Field>
              <Field label="End Time"><input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className={fieldClass} /></Field>
              <Field label="Break (minutes)"><input type="number" min={0} value={editForm.breakMinutes} onChange={(e) => setEditForm({ ...editForm, breakMinutes: e.target.value })} className={fieldClass} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={saveOverride.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{saveOverride.isPending ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
