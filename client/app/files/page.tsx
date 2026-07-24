import { clientFiles } from "../data";

export default function FilesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Files</h1>
      <p className="text-sm text-gray-500 mb-6">Download your project files</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["File Name", "Project", "Size", "Uploaded"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{clientFiles.map((f) => <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3"><span className="font-medium">{f.name}</span></td><td className="px-5 py-3 text-gray-600">{f.project}</td><td className="px-5 py-3 text-gray-600">{f.size}</td><td className="px-5 py-3 text-gray-500">{f.uploaded}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
