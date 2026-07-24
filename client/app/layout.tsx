import type { Metadata } from "next";
import "./globals.css";
import { ClientShell } from "./components";

export const metadata: Metadata = {
  title: "Client Portal – Zephtrix Studio",
  description: "Client portal for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning><ClientShell>{children}</ClientShell></body>
    </html>
  );
}
