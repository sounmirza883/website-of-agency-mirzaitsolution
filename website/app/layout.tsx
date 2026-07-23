import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zephtrix Studio | Creative Digital Studio",
  description: "Creative design, motion, websites, and digital growth solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
