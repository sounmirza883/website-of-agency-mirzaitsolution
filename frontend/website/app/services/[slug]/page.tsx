import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon, PageHero, SiteShell } from "../../components";
import { serviceDetails } from "../../data";
import { FadeIn } from "../../animations";

export function generateStaticParams() { return serviceDetails.map((item) => ({ slug: item.slug })); }

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = serviceDetails.find((i) => i.slug === slug);
  if (!item) notFound();
  return <SiteShell active="Services"><PageHero eyebrow="Services" title={item.title}>{item.description}</PageHero><section><div className="container"><FadeIn><Link href="/services" className="back-link"><Icon name="fa-arrow-left" /> Back to Services</Link><div className={`color-block ${item.tone}`}><p className="service-copy">{item.description}</p><ul className="checklist">{item.items.map((feature) => <li key={feature}><Icon name="fa-check-circle" />{feature}</li>)}</ul><a href="/contact" className="pill pill-primary">Start Your Project <Icon name="fa-arrow-right" /></a></div></FadeIn></div></section></SiteShell>;
}
