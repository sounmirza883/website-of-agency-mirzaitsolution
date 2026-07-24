import { portfolioList } from "../data";

export default function PortfolioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Portfolio</h1>
      <p className="text-sm text-gray-500 mb-6">Manage portfolio items</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Client", "Category"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{portfolioList.map((p) => <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{p.title}</td><td className="px-5 py-3 text-gray-600">{p.client}</td><td className="px-5 py-3 text-gray-600">{p.category}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
