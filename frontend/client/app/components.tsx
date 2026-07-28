"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth";

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

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user || user.role !== "client") router.replace("/login");
  }, [loading, isLoginPage, user, router]);

  if (isLoginPage) return <>{children}</>;
  if (loading || !user || user.role !== "client") return null;

  return (
    <div className="flex flex-col min-h-screen" style={{background:"var(--soft)"}}>
      <header className="sticky top-0 z-50" style={{background:"rgba(255,255,255,.96)",borderBottom:"1px solid var(--line)",backdropFilter:"blur(10px)"}}>
        <div className="flex items-center justify-between h-16 px-6" style={{maxWidth:"1440px",margin:"0 auto",width:"100%"}}>
          <Link href="/" className="logo" style={{fontSize:"20px"}}>Mirza IT <strong>Solution</strong> <span style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--ink-soft)",marginLeft:"4px"}}>Client</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/" style={{fontSize:"13px",color:"var(--ink-soft)",transition:"color .2s"}} onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"} onMouseLeave={e => e.currentTarget.style.color = "var(--ink-soft)"}><Icon name="fa-arrow-left" /> Back to site</Link>
            <button onClick={logout} style={{fontSize:"13px",color:"var(--ink-soft)",background:"none",border:"none",cursor:"pointer"}}>Logout</button>
            <div title={user.email} style={{width:"36px",height:"36px",borderRadius:"50%",background:"var(--red)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700"}}>{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </header>
      <div className="flex flex-1" style={{maxWidth:"1440px",margin:"0 auto",width:"100%"}}>
        <aside style={{width:"240px",background:"var(--canvas)",borderRight:"1px solid var(--line)",flexShrink:0,display:"flex",flexDirection:"column"}}>
          <nav style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",gap:"4px"}}>
            {nav.map((item) => {
              const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{
                  display:"flex",alignItems:"center",gap:"12px",padding:"10px 16px",borderRadius:active ? "var(--radius)" : "12px",
                  fontSize:"14px",fontWeight:active ? "600" : "500",transition:"all .2s",
                  background: active ? "var(--red)" : "transparent",
                  color: active ? "#fff" : "var(--ink-soft)",
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
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <footer style={{background:"var(--ink)",color:"#fff",padding:"20px 0",marginTop:"auto"}}>
        <div style={{maxWidth:"1440px",margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" className="logo" style={{fontSize:"16px"}}>Mirza IT <strong>Solution</strong></Link>
          <p style={{fontSize:"13px",color:"rgba(255,255,255,.6)",margin:0}}>© 2026 Mirza IT Solution. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
