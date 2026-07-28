"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { useChangePassword } from "./hooks";

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const changePassword = useChangePassword();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match");
    changePassword.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      { onError: (err) => setError((err as Error).message) }
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">Change Password</h2>
        {changePassword.isSuccess ? (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Password updated successfully.</p>
        ) : (
          <>
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-3">
              <input required type="password" placeholder="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="password" placeholder="New password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input required type="password" placeholder="Confirm new password" minLength={8} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">{changePassword.isSuccess ? "Close" : "Cancel"}</button>
          {!changePassword.isSuccess && <button type="submit" disabled={changePassword.isPending} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">{changePassword.isPending ? "Updating…" : "Update Password"}</button>}
        </div>
      </form>
    </div>
  );
}

const baseNav = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "Files", href: "/files" },
  { label: "Status", href: "/status" },
  { label: "Attendance", href: "/attendance" },
  { label: "Leave", href: "/leave" },
  { label: "Chat", href: "/chat" },
  { label: "Notifications", href: "/notifications" },
  { label: "Tickets", href: "/tickets" },
];

export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLoginPage = path === "/login";
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user || user.role !== "employee") router.replace("/login");
  }, [loading, isLoginPage, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  if (isLoginPage) return <>{children}</>;
  if (loading || !user || user.role !== "employee") return null;

  const nav = user.canCreateClients ? [...baseNav, { label: "Clients", href: "/clients" }] : baseNav;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-lg font-bold tracking-tight">Mirza IT Solution <span className="text-accent-2">Employee</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {nav.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-accent-2-100 text-accent-2-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>{item.label}</Link>;
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">← Back to site</Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900 shrink-0" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="text-sm text-gray-500 truncate hidden sm:block">Welcome, {user.name}</div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span className="text-sm text-gray-600 hidden lg:inline">{user.email}</span>
            <div className="w-8 h-8 bg-accent-2 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{user.name.charAt(0).toUpperCase()}</div>
            <button onClick={() => setShowChangePassword(true)} className="text-xs md:text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap">Change Password</button>
            <button onClick={logout} className="text-xs md:text-sm text-gray-500 hover:text-gray-900">Logout</button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </div>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
