"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cloneElement, useEffect, useId, useState } from "react";
import { useAuth } from "./auth";
import { useChangePassword } from "./hooks";

export const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "12px", fontSize: "14px", outline: "none", background: "var(--canvas)", color: "var(--ink)" };

// Every input gets a visible label naming it. Placeholders disappear as soon as
// you type, and select/file controls never show one at all. Matches the label
// styling already used on the login page.
export function Field({ label, children }: { label: string; children: React.ReactElement<{ id?: string }> }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "var(--ink)" }}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}

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
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"16px"}}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{width:"100%",maxWidth:"420px",background:"var(--canvas)",borderRadius:"var(--radius)",border:"1px solid var(--line)",padding:"24px"}}>
        <h2 style={{fontSize:"18px",fontWeight:"700",color:"var(--ink)",marginBottom:"16px"}}>Change Password</h2>
        {changePassword.isSuccess ? (
          <p style={{fontSize:"13px",color:"#166534",background:"#dcfce7",padding:"8px 12px",borderRadius:"12px"}}>Password updated successfully.</p>
        ) : (
          <>
            {error && <div style={{marginBottom:"16px",fontSize:"13px",color:"#b91c1c",background:"#fef2f2",padding:"8px 12px",borderRadius:"12px"}}>{error}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <Field label="Current Password"><input required type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} style={inputStyle} /></Field>
              <Field label="New Password (min 8 characters)"><input required type="password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} style={inputStyle} /></Field>
              <Field label="Confirm New Password"><input required type="password" minLength={8} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle} /></Field>
            </div>
          </>
        )}
        <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginTop:"20px"}}>
          <button type="button" onClick={onClose} style={{padding:"10px 20px",background:"none",border:0,fontSize:"14px",color:"var(--ink-soft)",cursor:"pointer"}}>{changePassword.isSuccess ? "Close" : "Cancel"}</button>
          {!changePassword.isSuccess && <button type="submit" disabled={changePassword.isPending} style={{padding:"10px 20px",background:"var(--accent)",color:"var(--canvas)",fontSize:"14px",fontWeight:"500",borderRadius:"50px",border:0,cursor:"pointer",opacity:changePassword.isPending?.6:1}}>{changePassword.isPending ? "Updating…" : "Update Password"}</button>}
        </div>
      </form>
    </div>
  );
}

const nav = [
  { label: "Dashboard", icon: "fa-chart-pie", href: "/" },
  { label: "Projects", icon: "fa-folder-open", href: "/projects" },
  { label: "Progress", icon: "fa-chart-line", href: "/progress" },
  { label: "Files", icon: "fa-download", href: "/files" },
  { label: "Invoices", icon: "fa-file-invoice", href: "/invoices" },
  { label: "Tickets", icon: "fa-ticket-alt", href: "/tickets" },
  { label: "Chat", icon: "fa-comments", href: "/chat" },
  { label: "Notifications", icon: "fa-bell", href: "/notifications" },
];

export function Icon({ name }: { name: string }) { return <i className={`fas ${name}`} aria-hidden="true" />; }

export function ClientShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isLoginPage = path === "/login";
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user || user.role !== "client") router.replace("/login");
  }, [loading, isLoginPage, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

  if (isLoginPage) return <>{children}</>;
  if (loading || !user || user.role !== "client") return null;

  return (
    <div className="flex flex-col min-h-screen" style={{background:"var(--soft)"}}>
      <header className="sticky top-0 z-50" style={{background:"rgba(15,23,42,.85)",borderBottom:"1px solid var(--line)",backdropFilter:"blur(10px)"}}>
        <div className="flex items-center justify-between h-16 px-4 md:px-6" style={{maxWidth:"1440px",margin:"0 auto",width:"100%"}}>
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden shrink-0" style={{color:"var(--ink-soft)",background:"none",border:"none",cursor:"pointer"}} aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link href="/" className="logo truncate" style={{fontSize:"20px"}}>Mirza IT <strong>Solution</strong> <span className="hidden sm:inline" style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--ink-soft)",marginLeft:"4px"}}>Client</span></Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link href="/" className="hidden md:inline-flex" style={{fontSize:"13px",color:"var(--ink-soft)",transition:"color .2s"}} onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"} onMouseLeave={e => e.currentTarget.style.color = "var(--ink-soft)"}><Icon name="fa-arrow-left" /> Back to site</Link>
            <button onClick={() => setShowChangePassword(true)} className="whitespace-nowrap" style={{fontSize:"13px",color:"var(--ink-soft)",background:"none",border:"none",cursor:"pointer"}}>Change Password</button>
            <button onClick={logout} style={{fontSize:"13px",color:"var(--ink-soft)",background:"none",border:"none",cursor:"pointer"}}>Logout</button>
            <div title={user.email} style={{width:"36px",height:"36px",borderRadius:"50%",background:"var(--accent)",color:"var(--canvas)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",flexShrink:0}}>{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </header>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {sidebarOpen && <div className="fixed inset-0 md:hidden" style={{background:"rgba(0,0,0,.3)",zIndex:40}} onClick={() => setSidebarOpen(false)} />}
      <div className="flex flex-1" style={{maxWidth:"1440px",margin:"0 auto",width:"100%"}}>
        <aside
          className={`fixed inset-y-0 left-0 md:static transform transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{width:"240px",background:"var(--canvas)",borderRight:"1px solid var(--line)",flexShrink:0,display:"flex",flexDirection:"column",zIndex:50}}
        >
          <nav style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",gap:"4px"}}>
            {nav.map((item) => {
              const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{
                  display:"flex",alignItems:"center",gap:"12px",padding:"10px 16px",borderRadius:active ? "var(--radius)" : "12px",
                  fontSize:"14px",fontWeight:active ? "600" : "500",transition:"all .2s",
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--canvas)" : "var(--ink-soft)",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--soft)"; e.currentTarget.style.color = "var(--ink)"; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-soft)"; }}}
                >
                  <Icon name={item.icon} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-auto min-w-0">{children}</main>
      </div>
      <footer style={{background:"var(--dark)",color:"var(--ink)",padding:"20px 0",marginTop:"auto"}}>
        <div style={{maxWidth:"1440px",margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" className="logo" style={{fontSize:"16px"}}>Mirza IT <strong>Solution</strong></Link>
          <p style={{fontSize:"13px",color:"rgba(255,255,255,.6)",margin:0}}>© 2026 Mirza IT Solution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
