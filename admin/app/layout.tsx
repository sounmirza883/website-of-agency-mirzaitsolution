import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "./components";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: "Admin Panel – Zephtrix Studio",
  description: "Admin panel for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Provider>
          <AdminShell>{children}</AdminShell>
        </Provider>
      </body>
    </html>
  );
}
