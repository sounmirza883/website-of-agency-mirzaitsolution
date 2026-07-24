import type { Metadata } from "next";
import "./globals.css";
import { EmployeeShell } from "./components";

export const metadata: Metadata = {
  title: "Employee Portal – Zephtrix Studio",
  description: "Employee portal for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased"><EmployeeShell>{children}</EmployeeShell></body>
    </html>
  );
}
