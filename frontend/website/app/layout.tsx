import type { Metadata } from "next";
import "./globals.css";
import { BodyWrapper } from "./animations";
import { Providers } from "./providers";

const siteUrl = "https://agency.vesseldrop.com";
const title = "Mirza IT Solution | Custom Software & Web Development Studio";
const description = "Custom software, SaaS and PaaS websites, web development, WordPress development, and custom dashboards built for growing businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Mirza IT Solution",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Mirza IT Solution",
  url: siteUrl,
  description,
  areaServed: "Worldwide",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body suppressHydrationWarning><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><Providers><BodyWrapper>{children}</BodyWrapper></Providers></body></html>
  );
}
