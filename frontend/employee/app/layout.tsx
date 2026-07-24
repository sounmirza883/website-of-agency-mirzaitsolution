import type { Metadata } from "next";
import "./globals.css";
import { EmployeeShell } from "./components";
import { Provider } from "./provider";
import { AuthProvider } from "./auth";

export const metadata: Metadata = {
  title: "Employee Portal – Zephtrix Studio",
  description: "Employee portal for Zephtrix Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Provider>
          <AuthProvider>
            <EmployeeShell>{children}</EmployeeShell>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
