"use client";

import { Icon } from "../components";
import { useProjects } from "../hooks";

export default function ProjectsPage() {
  const { data: projects } = useProjects();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>My Projects</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>View all your ongoing and completed projects</p>
      <div className="grid gap-4">
        {projects?.map((p) => (
          <div key={p.id} className="flex items-center justify-between" style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"20px"}}>
            <div><h3 className="font-semibold" style={{color:"var(--ink)"}}>{p.name}</h3><p className="text-sm mt-0.5" style={{color:"var(--ink-soft)"}}>Deadline: {p.deadline}</p></div>
            <div className="flex items-center gap-4">
              <div style={{width:"120px",background:"var(--soft)",borderRadius:"8px",height:"8px"}}><div style={{width:`${p.progress}%`,background:"var(--accent)",height:"8px",borderRadius:"8px"}} /></div>
              <span className="text-xs" style={{color:"var(--ink-soft)",width:"32px"}}>{p.progress}%</span>
              <span style={{fontSize:"12px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:p.status==="Completed"?"#dcfce7":"var(--accent-light)",color:p.status==="Completed"?"#166534":"var(--accent)"}}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
