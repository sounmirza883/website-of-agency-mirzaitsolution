"use client";

import { useState } from "react";
import { useAuth } from "../auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold mb-1 tracking-tight">Mirza IT Solution <span className="text-accent-2">Employee</span></h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
        <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
        <input id="email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent-2-400" />
        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-6 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent-2-400" />
        <button type="submit" disabled={submitting} className="w-full bg-accent-2 text-gray-50 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50">{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
