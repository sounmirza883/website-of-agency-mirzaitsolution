import type { MetadataRoute } from "next";
import { services, portfolioItems } from "./data";

const siteUrl = "https://agency.vesseldrop.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/portfolio", "/contact"];
  const detailRoutes = [
    ...services.map((s) => `/services/${s.slug}`),
    ...portfolioItems.map((p) => `/portfolio/${p.slug}`),
  ];
  return [...routes, ...detailRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
