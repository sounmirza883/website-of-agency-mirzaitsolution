import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon, PageHero, SiteShell } from "../../components";
import { portfolioItems } from "../../data";
import { FadeIn } from "../../animations";

export function generateStaticParams() { return portfolioItems.map((item) => ({ slug: item.slug })); }

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = portfolioItems.find((i) => i.slug === slug);
  if (!item) notFound();
  return <SiteShell active="Portfolio"><PageHero eyebrow={item.category} title={item.title}>{item.description}</PageHero><section><div className="container"><FadeIn><Link href="/portfolio" className="back-link"><Icon name="fa-arrow-left" /> Back to Portfolio</Link><div className="project-hero-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 900px) 100vw, 900px" style={{ objectFit: "cover" }} /></div><p className="service-copy">{item.overview}</p><h3 className="project-subheading">Key Features</h3><ul className="checklist">{item.features.map((feature) => <li key={feature}><Icon name="fa-check-circle" />{feature}</li>)}</ul><h3 className="project-subheading">Technologies</h3><div className="tech-tags">{item.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div><div className="project-result"><Icon name="fa-chart-line" /> {item.result}</div></FadeIn></div></section><section><FadeIn><div className="container"><div className="color-block navy text-center"><div className="section-eyebrow">Get Started</div><h2 className="section-title">Like What You <strong>See?</strong></h2><p className="section-subtitle inverse">Let&apos;s build something just as impactful for your business.</p><a href="/contact" className="pill pill-primary">Start Your Project <Icon name="fa-arrow-right" /></a></div></div></FadeIn></section></SiteShell>;
}
