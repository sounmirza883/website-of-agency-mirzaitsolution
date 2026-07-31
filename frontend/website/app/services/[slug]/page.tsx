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
  return <SiteShell active="Services"><PageHero eyebrow="Services" title={item.title}>{item.description}</PageHero><section><div className="container"><FadeIn><Link href="/services" className="back-link"><Icon name="fa-arrow-left" /> Back to Services</Link><div className="service-hero-icon"><Icon name={item.icon} /></div><p className="service-copy">{item.description}</p><h3 className="detail-subheading">What&apos;s Included</h3><ul className="checklist">{item.items.map((feature) => <li key={feature}><Icon name="fa-check-circle" />{feature}</li>)}</ul><h3 className="detail-subheading">Technologies &amp; Tools</h3><div className="tech-tags">{item.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></FadeIn></div></section><section><FadeIn><div className="container"><div className="color-block navy text-center"><div className="section-eyebrow">Get Started</div><h2 className="section-title">Like This <strong>Service?</strong></h2><p className="section-subtitle inverse">Let&apos;s talk about how {item.title.split(" - ")[0]} can help your business grow.</p><a href="/contact" className="pill pill-primary">Start Your Project <Icon name="fa-arrow-right" /></a></div></div></FadeIn></section></SiteShell>;
}
