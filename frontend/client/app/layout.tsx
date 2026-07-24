import type { Metadata } from "next";
import "./globals.css";
import { ClientShell } from "./components";
import { Provider } from "./provider";
import { AuthProvider } from "./auth";

export const metadata: Metadata = {
  title: "Client Portal – Zephtrix Studio",
  description: "Client portal for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Provider>
          <AuthProvider>
            <ClientShell>{children}</ClientShell>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
