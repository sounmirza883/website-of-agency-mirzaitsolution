import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "./components";
import { Provider } from "./provider";
import { AuthProvider } from "./auth";

export const metadata: Metadata = {
  title: "Admin Panel – Zephtrix Studio",
  description: "Admin panel for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Provider>
          <AuthProvider>
            <AdminShell>{children}</AdminShell>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
