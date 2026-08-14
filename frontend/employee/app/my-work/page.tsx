"use client";

import { useEffect, useMemo, useState } from "react";
import { useEmpTasks, useMySchedule, useRunningEntry, useTimeEntries, useStartTimer, useStopTimer, useCorrectTimeEntry, useSetTaskProgress, useSubmitTaskReport, useUpdateTaskStatus, useDailyReports, useSubmitDailyReport } from "../hooks";
import { Field, fieldClass, ProgressBar } from "../components";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Milliseconds → "1h 24m" / "3m". Durations are real subtractions now. */
function humanise(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Ticks locally so the running total moves without hammering the API. */
function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{humanise(now - new Date(since).getTime())}</>;
}

export default function MyWorkPage() {
  const { data: tasks } = useEmpTasks();
  const { data: schedule } = useMySchedule();
  const { data: running } = useRunningEntry();
  const { data: entries } = useTimeEntries();
  const { data: dailyReports } = useDailyReports();

  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const correct = useCorrectTimeEntry();
  const setProgress = useSetTaskProgress();
  const submitReport = useSubmitTaskReport();
  const setStatus = useUpdateTaskStatus();
  const submitDaily = useSubmitDailyReport();

  const [error, setError] = useState("");
  const [reportFor, setReportFor] = useState<any | null>(null);
  const [reportForm, setReportForm] = useState({ summary: "", blockers: "" });
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ startedAt: "", endedAt: "", note: "" });
  const [daily, setDaily] = useState("");

  const openTasks = useMemo(() => (tasks ?? []).filter((t: any) => t.status !== "Done"), [tasks]);

  // Total tracked today, from real timestamps — impossible before these columns.
  const todayMs = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return (entries ?? []).reduce((sum: number, e: any) => {
      if (!e.endedAt) return sum;
      const s = new Date(e.startedAt);
      return s >= start ? sum + (new Date(e.endedAt).getTime() - s.getTime()) : sum;
    }, 0);
  }, [entries]);

  const todaysDaily = (dailyReports ?? []).find((r: any) => r.workDate === new Date().toISOString().slice(0, 10));
  useEffect(() => { if (todaysDaily) setDaily(todaysDaily.summary); }, [todaysDaily]);

  async function handleStart(taskId: number) {
    setError("");
    try { await startTimer.mutateAsync(taskId); } catch (err) { setError((err as Error).message); }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await submitReport.mutateAsync({ taskId: reportFor.id, payload: reportForm });
      // The report is the precondition for closing the task, so do both here —
      // asking the employee to then find the status control would be busywork.
      await setStatus.mutateAsync({ id: reportFor.id, status: "Done" });
      setReportFor(null);
      setReportForm({ summary: "", blockers: "" });
    } catch (err) { setError((err as Error).message); }
  }

  async function handleCorrect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await correct.mutateAsync({ id: editEntry.id, payload: { startedAt: new Date(editForm.startedAt).toISOString(), endedAt: editForm.endedAt ? new Date(editForm.endedAt).toISOString() : null, note: editForm.note } });
      setEditEntry(null);
    } catch (err) { setError((err as Error).message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Work</h1>
          <p className="text-sm text-gray-500">Track time on your tasks and report what you finished</p>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-gray-900">{humanise(todayMs)}</div>
          <div className="text-sm text-gray-500 mt-1">Tracked today</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-gray-900">{openTasks.length}</div>
          <div className="text-sm text-gray-500 mt-1">Open tasks</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-gray-900">
            {schedule ? `${String(schedule.startTime).slice(0, 5)}–${String(schedule.endTime).slice(0, 5)}` : "—"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {schedule ? (schedule.workDays ?? []).map((d: number) => DAY_NAMES[d]).join(", ") : "Your hours"}
          </div>
        </div>
      </div>

      {running && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Working on: {tasks?.find((t: any) => t.id === running.taskId)?.task ?? `task #${running.taskId}`}
            </div>
            <div className="text-xs text-gray-500 mt-0.5"><Elapsed since={running.startedAt} /> elapsed</div>
          </div>
          <button onClick={() => stopTimer.mutate({ id: running.id })} disabled={stopTimer.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            {stopTimer.isPending ? "Stopping…" : "Stop"}
          </button>
        </div>
      )}

      <h2 className="text-sm font-bold mb-3">Assigned Tasks</h2>
      <div className="grid gap-3 mb-8">
        {openTasks.map((t: any) => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{t.task}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.project || "No project"}{t.due ? ` · due ${t.due}` : ""}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {running?.taskId === t.id ? (
                  <button onClick={() => stopTimer.mutate({ id: running.id })} className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 hover:text-gray-900">Stop</button>
                ) : (
                  <button onClick={() => handleStart(t.id)} disabled={startTimer.isPending} className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50">Start</button>
                )}
                <button onClick={() => { setReportFor(t); setReportForm({ summary: "", blockers: "" }); }} className="text-xs bg-accent-2 text-gray-50 rounded-md px-2 py-1">Complete</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><ProgressBar value={t.progress ?? 0} /></div>
              <input
                type="range" min={0} max={100} step={5} value={t.progress ?? 0}
                onChange={(e) => setProgress.mutate({ id: t.id, progress: Number(e.target.value) })}
                className="w-32" aria-label={`Progress for ${t.task}`}
              />
            </div>
          </div>
        ))}
        {openTasks.length === 0 && <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-center text-sm text-gray-400">Nothing assigned right now</div>}
      </div>

      <h2 className="text-sm font-bold mb-3">Today&apos;s Report</h2>
      <form
        onSubmit={async (e) => { e.preventDefault(); setError(""); try { await submitDaily.mutateAsync({ summary: daily }); } catch (err) { setError((err as Error).message); } }}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-8"
      >
        <Field label="What did you work on today?">
          <textarea value={daily} onChange={(e) => setDaily(e.target.value)} className={fieldClass} rows={3} />
        </Field>
        <div className="flex items-center gap-3 mt-3">
          <button type="submit" disabled={submitDaily.isPending || !daily.trim()} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
            {submitDaily.isPending ? "Saving…" : todaysDaily ? "Update" : "Submit"}
          </button>
          {todaysDaily && <span className="text-xs text-gray-500">Already submitted today — saving replaces it.</span>}
        </div>
      </form>

      <h2 className="text-sm font-bold mb-3">Recent Time Entries</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Task", "Started", "Duration", "Note", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{(entries ?? []).slice(0, 25).map((e: any) => (
            <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{tasks?.find((t: any) => t.id === e.taskId)?.task ?? `#${e.taskId}`}</td>
              <td className="px-5 py-3 text-gray-600">{new Date(e.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
              <td className="px-5 py-3 text-gray-600">
                {e.endedAt ? humanise(new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime()) : <span className="text-green-600">running</span>}
                {e.editedAt && <span className="ml-2 text-xs text-amber-600">edited</span>}
              </td>
              <td className="px-5 py-3 text-gray-600">{e.note || "—"}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => { setEditEntry(e); setEditForm({ startedAt: toLocalInput(e.startedAt), endedAt: toLocalInput(e.endedAt), note: e.note ?? "" }); }}
                  className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2 py-1"
                >
                  Correct
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {(entries ?? []).length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No time tracked yet</div>}
      </div>

      {reportFor && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setReportFor(null)}>
          <form onSubmit={handleReport} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">Complete Task</h2>
            <p className="text-xs text-gray-500 mb-4">{reportFor.task}</p>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="What did you do?"><textarea required value={reportForm.summary} onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })} className={fieldClass} rows={4} /></Field>
              <Field label="Anything blocking or worth flagging? (optional)"><textarea value={reportForm.blockers} onChange={(e) => setReportForm({ ...reportForm, blockers: e.target.value })} className={fieldClass} rows={2} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setReportFor(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={submitReport.isPending} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{submitReport.isPending ? "Submitting…" : "Submit & Complete"}</button>
            </div>
          </form>
        </div>
      )}

      {editEntry && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setEditEntry(null)}>
          <form onSubmit={handleCorrect} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-1">Correct Time Entry</h2>
            <p className="text-xs text-gray-500 mb-4">Corrected entries stay marked as edited.</p>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <Field label="Started"><input type="datetime-local" required value={editForm.startedAt} onChange={(e) => setEditForm({ ...editForm, startedAt: e.target.value })} className={fieldClass} /></Field>
              <Field label="Ended"><input type="datetime-local" value={editForm.endedAt} onChange={(e) => setEditForm({ ...editForm, endedAt: e.target.value })} className={fieldClass} /></Field>
              <Field label="Note"><input value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} className={fieldClass} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setEditEntry(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={correct.isPending} className="bg-accent-2 text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{correct.isPending ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
