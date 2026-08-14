"use client";

import { useEffect, useState } from "react";
import { useMilestones, useProjects, useProjectTasks, useProjectReports } from "../hooks";
import { ProgressBar } from "../components";

const cellHead: React.CSSProperties = { padding: "12px 20px", fontWeight: 500, color: "var(--ink-soft)" };
const cell: React.CSSProperties = { padding: "12px 20px", color: "var(--ink-soft)" };
const card: React.CSSProperties = { background: "var(--canvas)", borderRadius: "var(--radius)", border: "1px solid var(--line)", overflow: "auto" };

function statusStyle(status: string): React.CSSProperties {
  const done = status === "Done" || status === "Completed";
  const active = status === "In Progress";
  return {
    fontSize: "12px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
    background: done ? "#dcfce7" : active ? "var(--accent-light)" : "#f3f4f6",
    color: done ? "#166534" : active ? "var(--accent)" : "#4b5563",
  };
}

export default function ProgressPage() {
  const { data: projects } = useProjects();
  const { data: milestones } = useMilestones();
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (projectId == null && projects?.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const { data: tasks } = useProjectTasks(projectId);
  const { data: reports } = useProjectReports(projectId);
  const project = projects?.find((p) => p.id === projectId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)" }}>Track Progress</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>See what is being worked on, and what has been delivered</p>

      {projects && projects.length > 1 && (
        <div className="mb-6" style={{ maxWidth: "320px" }}>
          <label htmlFor="project-picker" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "var(--ink)" }}>Project</label>
          <select
            id="project-picker"
            value={projectId ?? ""}
            onChange={(e) => setProjectId(Number(e.target.value))}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "12px", fontSize: "14px", background: "var(--canvas)", color: "var(--ink)" }}
          >
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {project && (
        <div style={{ ...card, padding: "20px", marginBottom: "24px" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold" style={{ color: "var(--ink)" }}>{project.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>Deadline {project.deadline}</p>
            </div>
            <span style={statusStyle(project.status)}>{project.status}</span>
          </div>
          <ProgressBar value={project.progress ?? 0} />
        </div>
      )}

      <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>Work Items</h2>
      <div style={{ ...card, marginBottom: "24px" }}>
        <table className="w-full text-sm">
          <thead><tr style={{ background: "var(--soft)", textAlign: "left" }}>{["Item", "Status", "Progress", "Due"].map((h) => <th key={h} style={cellHead}>{h}</th>)}</tr></thead>
          <tbody>{tasks?.map((t) => (
            <tr key={t.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: "12px 20px", fontWeight: 500, color: "var(--ink)" }}>
                {t.task}
                {t.description && <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{t.description}</div>}
              </td>
              <td style={{ padding: "12px 20px" }}><span style={statusStyle(t.status)}>{t.status}</span></td>
              <td style={{ padding: "12px 20px", width: "180px" }}><ProgressBar value={t.progress ?? 0} /></td>
              <td style={cell}>{t.due || "—"}</td>
            </tr>
          ))}</tbody>
        </table>
        {tasks?.length === 0 && <div style={{ padding: "32px 20px", textAlign: "center", fontSize: "14px", color: "var(--ink-soft)" }}>No work items to show yet</div>}
      </div>

      <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>What Has Been Delivered</h2>
      <div className="grid gap-3 mb-8">
        {reports?.map((r) => (
          <div key={r.id} style={{ ...card, padding: "16px 20px" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{r.task ?? "Update"}</span>
              <span className="text-xs" style={{ color: "var(--ink-soft)" }}>{new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <p className="text-sm" style={{ color: "var(--ink-soft)", whiteSpace: "pre-wrap" }}>{r.summary}</p>
          </div>
        ))}
        {reports?.length === 0 && <div style={{ ...card, padding: "32px 20px", textAlign: "center", fontSize: "14px", color: "var(--ink-soft)" }}>Nothing delivered yet — completed work will appear here</div>}
      </div>

      {milestones && milestones.length > 0 && (
        <>
          <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>Milestones</h2>
          <div style={card}>
            <table className="w-full text-sm">
              <thead><tr style={{ background: "var(--soft)", textAlign: "left" }}>{["Project", "Milestone", "Status", "Date"].map((h) => <th key={h} style={cellHead}>{h}</th>)}</tr></thead>
              <tbody>{milestones.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 500, color: "var(--ink)" }}>{m.project}</td>
                  <td style={cell}>{m.task}</td>
                  <td style={{ padding: "12px 20px" }}><span style={statusStyle(m.status)}>{m.status}</span></td>
                  <td style={cell}>{m.date}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
