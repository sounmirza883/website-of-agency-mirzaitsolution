import type { Metadata } from "next";
import "./globals.css";
import { BodyWrapper } from "./animations";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Mirza IT Solution | Creative Digital Studio",
  description: "Creative design, motion, websites, and digital growth solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body suppressHydrationWarning><Providers><BodyWrapper>{children}</BodyWrapper></Providers><SpeedInsights /></body></html>
  );
}
