"use client";

import Link from "next/link";
import { useProjects, useNotifications, useUsers, useEmployees, useClientsList, useServices, useInvoices } from "./hooks";

export default function AdminDashboard() {
  const { data: projects } = useProjects();
  const { data: notifications } = useNotifications();
  const { data: users } = useUsers();
  const { data: employees } = useEmployees();
  const { data: clients } = useClientsList();
  const { data: services } = useServices();
  const { data: invoices } = useInvoices();

  const stats = [
    { label: "Total Users", value: String(users?.length ?? 0), href: "/users" },
    { label: "Employees", value: String(employees?.length ?? 0), href: "/employees" },
    { label: "Clients", value: String(clients?.length ?? 0), href: "/clients" },
    { label: "Active Projects", value: String(projects?.filter((p) => p.status !== "Completed").length ?? 0), href: "/projects" },
    { label: "Pending Invoices", value: String(invoices?.filter((i) => i.status !== "Paid").length ?? 0), href: "/invoices" },
    { label: "Services", value: String(services?.length ?? 0), href: "/services" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of your admin panel</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Projects</h2>
          {projects?.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-gray-500">{p.client}</div></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.status === "Completed" ? "bg-green-100 text-green-700" : p.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Notifications</h2>
          {notifications?.slice(0, 3).map((n) => (
            <div key={n.id} className="py-2 border-b border-gray-100 last:border-0">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{n.msg}</div>
              <div className="text-xs text-gray-400 mt-0.5">{n.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
