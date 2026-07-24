"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "Files", href: "/files" },
  { label: "Status", href: "/status" },
  { label: "Attendance", href: "/attendance" },
  { label: "Leave", href: "/leave" },
];

export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-lg font-bold tracking-tight">Zephtrix <span className="text-emerald-500">Employee</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {nav.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>{item.label}</Link>;
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">← Back to site</Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-500">Welcome, Employee</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">ali.khan@zephtrix.com</span>
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">AK</div>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
