"use client";

import { useMemo, useState } from "react";
import { useAdminTimeEntries, useAdminTaskReports, useAdminDailyReports, useEmployees } from "../hooks";
import { Field, fieldClass } from "../components";

type Tab = "timesheet" | "tasks" | "daily";

function hours(ms: number) {
  return (ms / 3600000).toFixed(1);
}

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Quote every field and double any embedded quote — task names and report
 * summaries are free text and will contain commas, quotes and newlines.
 */
function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

function download(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("timesheet");
  const [employeeId, setEmployeeId] = useState("");

  const { data: employees } = useEmployees();
  const { data: entries } = useAdminTimeEntries(employeeId || undefined);
  const { data: taskReports } = useAdminTaskReports(employeeId || undefined);
  const { data: dailyReports } = useAdminDailyReports(employeeId || undefined);

  // Group tracked time by employee and day — the shape a timesheet is read in.
  const timesheet = useMemo(() => {
    const byPerson = new Map<string, { name: string; days: Map<string, number>; total: number }>();
    for (const e of entries ?? []) {
      if (!e.endedAt) continue;
      const ms = new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime();
      if (!Number.isFinite(ms) || ms <= 0) continue;
      const name = e.employee?.name ?? `#${e.employee_id}`;
      const row = byPerson.get(name) ?? { name, days: new Map(), total: 0 };
      const day = dayKey(e.startedAt);
      row.days.set(day, (row.days.get(day) ?? 0) + ms);
      row.total += ms;
      byPerson.set(name, row);
    }
    return [...byPerson.values()].sort((a, b) => b.total - a.total);
  }, [entries]);

  const grandTotal = timesheet.reduce((s, r) => s + r.total, 0);

  function exportCsv() {
    if (tab === "timesheet") {
      const rows: (string | number)[][] = [["Employee", "Date", "Hours"]];
      for (const p of timesheet) for (const [day, ms] of [...p.days].sort()) rows.push([p.name, day, hours(ms)]);
      download("timesheet.csv", toCsv(rows));
    } else if (tab === "tasks") {
      const rows: (string | number)[][] = [["Submitted", "Employee", "Project", "Task", "Summary", "Blockers"]];
      for (const r of taskReports ?? []) rows.push([dayKey(r.submittedAt), r.employee?.name ?? "", r.task?.project ?? "", r.task?.task ?? "", r.summary, r.blockers ?? ""]);
      download("task-reports.csv", toCsv(rows));
    } else {
      const rows: (string | number)[][] = [["Date", "Employee", "Summary"]];
      for (const r of dailyReports ?? []) rows.push([r.workDate, r.employee?.name ?? "", r.summary]);
      download("daily-reports.csv", toCsv(rows));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Reports</h1>
          <p className="text-sm text-gray-500">Hours tracked, and what people reported</p>
        </div>
        <button onClick={exportCsv} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">Export CSV</button>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {([["timesheet", "Timesheet"], ["tasks", "Task Reports"], ["daily", "Daily Reports"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`text-sm font-medium px-3 py-1.5 rounded-md ${tab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="max-w-xs flex-1 min-w-48">
          <Field label="Employee">
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={fieldClass}>
              <option value="">All employees</option>
              {employees?.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {tab === "timesheet" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{hours(grandTotal)}h</div>
              <div className="text-sm text-gray-500 mt-1">Total tracked</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{timesheet.length}</div>
              <div className="text-sm text-gray-500 mt-1">People tracking</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-2xl font-bold text-gray-900">{(entries ?? []).length}</div>
              <div className="text-sm text-gray-500 mt-1">Entries</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">{["Employee", "Days Tracked", "Total Hours"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
              <tbody>{timesheet.map((p) => (
                <tr key={p.name} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-600">{p.days.size}</td>
                  <td className="px-5 py-3 text-gray-600">{hours(p.total)}h</td>
                </tr>
              ))}</tbody>
            </table>
            {timesheet.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No time tracked yet</div>}
          </div>
        </>
      )}

      {tab === "tasks" && (
        <div className="grid gap-3">
          {(taskReports ?? []).map((r: any) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{r.task?.task ?? `Task #${r.taskId}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.employee?.name ?? "—"}{r.task?.project ? ` · ${r.task.project}` : ""}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{r.summary}</p>
              {r.blockers && <p className="text-sm text-amber-600 mt-2">Blockers: {r.blockers}</p>}
              {!r.clientVisible && <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Internal only</span>}
            </div>
          ))}
          {(taskReports ?? []).length === 0 && <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-center text-sm text-gray-400">No task reports yet</div>}
        </div>
      )}

      {tab === "daily" && (
        <div className="grid gap-3">
          {(dailyReports ?? []).map((r: any) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900">{r.employee?.name ?? "—"}</p>
                <span className="text-xs text-gray-500">{r.workDate}</span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{r.summary}</p>
            </div>
          ))}
          {(dailyReports ?? []).length === 0 && <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-center text-sm text-gray-400">No daily reports yet</div>}
        </div>
      )}
    </div>
  );
}
