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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--soft)" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "380px", background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "32px" }}>
        <div className="logo" style={{ fontSize: "20px", marginBottom: "4px" }}>Mirza IT <strong>Solution</strong></div>
        <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "24px" }}>Sign in to your client portal</p>
        {error && <div style={{ marginBottom: "16px", fontSize: "13px", color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: "10px" }}>{error}</div>}
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }} htmlFor="email">Email</label>
        <input id="email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", marginBottom: "16px", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "12px", fontSize: "14px" }} />
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }} htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", marginBottom: "24px", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "12px", fontSize: "14px" }} />
        <button type="submit" disabled={submitting} className="pill pill-primary" style={{ width: "100%", opacity: submitting ? 0.6 : 1 }}>{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
