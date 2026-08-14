/**
 * Shared scheduling logic.
 *
 * These live here rather than in a route file because both admin.ts and
 * employee.ts need them, and importing across the two route modules would make
 * them circular. Two copies would also drift, and the conflict checks have to
 * resolve hours exactly the way the employee's own view does or the warnings
 * would disagree with what the employee sees.
 */
import { supabase } from "./supabase.js";

export const WORK_DEFAULTS = {
  workDays: [1, 2, 3, 4, 5], // 0=Sun .. 6=Sat
  startTime: "09:00",
  endTime: "18:00",
  breakMinutes: 60,
  timezone: "Asia/Karachi",
};

/** The employee board says "Done", the admin board says "Completed". Both mean finished. */
export function isDone(status: string | null | undefined): boolean {
  return status === "Done" || status === "Completed";
}

/**
 * An employee's effective hours: their override merged over the company
 * default, field by field. A NULL column in employee_schedules means "inherit",
 * so an override row can set only the parts that actually differ.
 */
export async function resolveSchedule(employeeId: number) {
  if (!supabase) return { ...WORK_DEFAULTS, source: "default" as const };

  const [settings, override] = await Promise.all([
    supabase.from("work_settings").select("work_days,start_time,end_time,break_minutes,timezone").eq("id", 1).maybeSingle(),
    supabase.from("employee_schedules").select("work_days,start_time,end_time,break_minutes").eq("employee_id", employeeId).maybeSingle(),
  ]);

  const base = {
    workDays: settings.data?.work_days ?? WORK_DEFAULTS.workDays,
    startTime: settings.data?.start_time ?? WORK_DEFAULTS.startTime,
    endTime: settings.data?.end_time ?? WORK_DEFAULTS.endTime,
    breakMinutes: settings.data?.break_minutes ?? WORK_DEFAULTS.breakMinutes,
    timezone: settings.data?.timezone ?? WORK_DEFAULTS.timezone,
  };

  const o = override.data;
  if (!o) return { ...base, source: "default" as const };
  return {
    workDays: o.work_days ?? base.workDays,
    startTime: o.start_time ?? base.startTime,
    endTime: o.end_time ?? base.endTime,
    breakMinutes: o.break_minutes ?? base.breakMinutes,
    timezone: base.timezone,
    source: "override" as const,
  };
}

/**
 * Recompute a project's progress from its tasks: the mean of their per-task
 * progress, with a completed task counting as 100 regardless of its progress
 * column.
 *
 * admin_projects.progress has existed since the beginning, is returned by three
 * endpoints and is rendered as a bar in the client portal — but nothing had ever
 * written to it, so every client bar has always shown 0%. This is the writer.
 *
 * Failures are swallowed: a rollup is derived convenience and must never fail
 * the task write that already succeeded.
 */
export async function rollUpProjectProgress(projectId: number | null | undefined): Promise<void> {
  if (!supabase || !projectId) return;
  try {
    const { data: tasks } = await supabase.from("employee_tasks").select("status,progress").eq("project_id", projectId).limit(1000);
    if (!tasks) return;
    // No tasks means nothing is done. Returning early here would strand the last
    // computed value on a project whose tasks were all deleted.
    const progress = tasks.length === 0
      ? 0
      : Math.round(tasks.reduce((sum, t) => sum + (isDone(t.status) ? 100 : Math.max(0, Math.min(100, t.progress ?? 0))), 0) / tasks.length);
    await supabase.from("admin_projects").update({ progress }).eq("id", projectId);
  } catch (err) {
    console.warn("project progress rollup failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Non-blocking checks on a proposed task window. The admin knows things the
 * system does not — someone agreed to cover, a deadline moved — so a conflict is
 * reported and overridable, never enforced.
 *
 * This is also the first code path that reads approved leave: it has been stored
 * and displayed since it was added and consulted by nothing else.
 */
export async function scheduleWarnings(employeeId: number, start?: string | null, end?: string | null): Promise<string[]> {
  if (!supabase || !start) return [];
  const warnings: string[] = [];
  try {
    const startsAt = new Date(start);
    if (Number.isNaN(startsAt.getTime())) return [];

    const schedule = await resolveSchedule(employeeId);
    if (!schedule.workDays.includes(startsAt.getDay())) {
      warnings.push("This falls on a day the employee does not normally work.");
    } else {
      const hhmm = `${String(startsAt.getHours()).padStart(2, "0")}:${String(startsAt.getMinutes()).padStart(2, "0")}`;
      const from = String(schedule.startTime).slice(0, 5);
      const to = String(schedule.endTime).slice(0, 5);
      if (hhmm < from || hhmm >= to) warnings.push(`This starts outside the employee's hours (${from}–${to}).`);
    }

    const { data: leave } = await supabase
      .from("employee_leave_requests")
      .select("from_date,to_date,type")
      .eq("employee_id", employeeId)
      .eq("status", "Approved");
    const day = startsAt.toISOString().slice(0, 10);
    for (const l of leave ?? []) {
      // from_date/to_date are free text and historically hold two formats, so
      // parse defensively rather than comparing the strings.
      const f = new Date(l.from_date), t = new Date(l.to_date);
      if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) continue;
      if (day >= f.toISOString().slice(0, 10) && day <= t.toISOString().slice(0, 10)) {
        warnings.push(`The employee has approved ${l.type || "leave"} on this date.`);
        break;
      }
    }

    if (end) {
      const endsAt = new Date(end);
      if (!Number.isNaN(endsAt.getTime()) && endsAt <= startsAt) warnings.push("The end time is not after the start time.");
    }
  } catch (err) {
    console.warn("schedule warning check failed:", err instanceof Error ? err.message : err);
  }
  return warnings;
}
