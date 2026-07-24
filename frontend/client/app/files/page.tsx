"use client";

import { useFiles } from "../hooks";
import { Icon } from "../components";

export default function FilesPage() {
  const { data: files } = useFiles();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1" style={{color:"var(--ink)"}}>Files</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-soft)"}}>Download your project files</p>
      <div style={{background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",overflow:"hidden"}}>
        <table className="w-full text-sm">
          <thead><tr style={{background:"var(--soft)",textAlign:"left"}}>{["File Name", "Project", "Size", "Uploaded", ""].map((h) => <th key={h} style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink-soft)"}}>{h}</th>)}</tr></thead>
          <tbody>{files?.map((f) => <tr key={f.id} style={{borderTop:"1px solid var(--line)"}}><td style={{padding:"12px 20px",fontWeight:"500",color:"var(--ink)"}}>{f.name}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{f.project}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{f.size}</td><td style={{padding:"12px 20px",color:"var(--ink-soft)"}}>{f.uploaded}</td><td style={{padding:"12px 20px"}}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer" style={{fontSize:"13px",fontWeight:"500",color:"var(--red)"}}><Icon name="fa-download" /> Download</a> : <span style={{fontSize:"13px",color:"var(--ink-soft)"}}>Unavailable</span>}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
