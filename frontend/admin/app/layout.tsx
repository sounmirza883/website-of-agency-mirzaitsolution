import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "./components";
import { Provider } from "./provider";
import { AuthProvider } from "./auth";

export const metadata: Metadata = {
  title: "Admin Panel – Mirza IT Solution",
  description: "Admin panel for Mirza IT Solution",
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
