"use client";

import { useState } from "react";
import { useBlogPosts, useCreateBlogPost, useSetBlogPostStatus } from "../hooks";

export default function BlogPage() {
  const { data: posts } = useBlogPosts();
  const createBlogPost = useCreateBlogPost();
  const setStatus = useSetBlogPostStatus();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", content: "", status: "Draft", excerpt: "", featuredImage: "", category: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createBlogPost.mutateAsync(form);
      setForm({ title: "", author: "", content: "", status: "Draft", excerpt: "", featuredImage: "", category: "" });
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Posts</h1>
          <p className="text-sm text-gray-500">Publish and manage blog posts</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg">+ Add Post</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">{["Title", "Author", "Date", "Status"].map((h) => <th key={h} className="px-5 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
          <tbody>{posts?.map((p) => (
            <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{p.title}</td>
              <td className="px-5 py-3 text-gray-600">{p.author}</td>
              <td className="px-5 py-3 text-gray-600">{p.date}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => setStatus.mutate({ id: p.id, status: p.status === "Published" ? "Draft" : "Published" })}
                  className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {p.status}
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {posts?.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400">No blog posts yet</div>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Add Post</h2>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="Category (e.g. Engineering, Product)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="Featured image URL (optional)" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <textarea placeholder="Short excerpt (shown on the blog listing card)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              <textarea required placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={5} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button type="submit" disabled={createBlogPost.isPending} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{createBlogPost.isPending ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
