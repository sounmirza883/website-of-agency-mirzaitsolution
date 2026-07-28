"use client";

import { useRef, useState } from "react";
import { useEmpFiles, useUploadFile, useMyClients } from "../hooks";

export default function FilesPage() {
  const { data: files } = useEmpFiles();
  const { data: clients } = useMyClients();
  const uploadFile = useUploadFile();
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project", project);
    if (clientId) formData.append("clientId", clientId);
    try {
      await uploadFile.mutateAsync(formData);
      setProject("");
      setClientId("");
      if (fileRef.current) fileRef.current.value = "";
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Files</h1>
          <p className="text-sm text-gray-500">Upload and manage your project files</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Upload File</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["File Name", "Project", "Size", "Uploaded", "Status", ""].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{files?.map((f) => <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{f.name}</td><td className="px-5 py-3 text-gray-600">{f.project}</td><td className="px-5 py-3 text-gray-600">{f.size}</td><td className="px-5 py-3 text-gray-500">{f.uploaded}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${f.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{f.status}</span></td><td className="px-5 py-3">{f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="text-accent-2 font-medium">Download</a> : <span className="text-gray-300">Unavailable</span>}</td></tr>)}</tbody>
        </table>
        {files?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No files uploaded yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Upload File</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required type="file" ref={fileRef} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Internal only</option>
                {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={uploadFile.isPending} className="bg-accent-2 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{uploadFile.isPending ? "Uploading…" : "Upload"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
