"use client";

import { useBlogPosts } from "../hooks";

export default function BlogPage() {
  const { data: posts } = useBlogPosts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Blog Posts</h1>
      <p className="text-sm text-gray-500 mb-6">Publish and manage blog posts</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Author", "Date", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{posts?.map((p) => <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-5 py-3 font-medium">{p.title}</td><td className="px-5 py-3 text-gray-600">{p.author}</td><td className="px-5 py-3 text-gray-600">{p.date}</td><td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
