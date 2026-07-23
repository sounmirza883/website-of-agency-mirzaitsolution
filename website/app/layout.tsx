import type { Metadata } from "next";
import "./globals.css";
import { BodyWrapper } from "./animations";

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
    <html lang="en"><body><BodyWrapper>{children}</BodyWrapper></body></html>
  );
}
