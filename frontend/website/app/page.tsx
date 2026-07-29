import Link from "next/link";
import Image from "next/image";
import { Icon, SiteShell } from "./components";
import { portfolioItems, services } from "./data";
import { FadeIn, GlitchText, StaggerContainer, StaggerItem, MagneticLink, Counter } from "./animations";
import { BrandMark } from "./brand-mark";
import { BlogTeaser } from "./blog-teaser";

const reasons = ["Clean and modern engineering approach", "Professional quality code", "Fast delivery and clear communication", "SEO-friendly, performant builds", "Fully responsive across devices", "Scalable, maintainable architecture", "Affordable and result-driven services", "Complete software support in one place"];
const testimonials = [["S", "Sarah Khan", "Business Owner", "Mirza IT Solution delivered a custom dashboard that transformed how we track our business. Professional, fast, and reliable."], ["A", "Ahmed R.", "SaaS Founder", "The SaaS website and platform work was outstanding. Highly recommended for founders who need software that just works."], ["M", "Maria Ali", "Startup Founder", "Our web app looks modern, performs fast, and works exactly as we needed. The team understood our vision perfectly."]];
const process = [["01", "Discovery", "We learn your goals, users, and constraints before writing a single line of code."], ["02", "Design", "We plan the architecture and interface so the build stays fast and maintainable."], ["03", "Development", "We build in focused sprints, with visibility into progress at every step."], ["04", "Launch", "We ship, monitor, and support — your software keeps getting better after launch."]];
const technologies: Array<[string, string, boolean]> = [["Next.js", "fa-layer-group", false], ["React", "fa-react", true], ["TypeScript", "fa-code", false], ["Node.js", "fa-node-js", true], ["PostgreSQL", "fa-database", false], ["Docker", "fa-docker", true], ["AWS", "fa-aws", true], ["OpenAI", "fa-robot", false], ["Stripe", "fa-stripe", true], ["Tailwind CSS", "fa-css3-alt", true], ["GitHub", "fa-github", true], ["Vercel", "fa-server", false]];

export default function Home() {
  return <SiteShell active="Home">
    <section className="campaign-hero">
      <div className="hero-grid-pattern" />
      <div className="hero-blob" />
      <div className="hero-particle" style={{ width: 6, height: 6, top: "18%", left: "62%", opacity: 0.6 }} />
      <div className="hero-particle" style={{ width: 4, height: 4, top: "32%", left: "78%", opacity: 0.4 }} />
      <div className="hero-particle" style={{ width: 8, height: 8, top: "68%", left: "70%", opacity: 0.3 }} />
      <div className="hero-particle" style={{ width: 5, height: 5, top: "78%", left: "58%", opacity: 0.5 }} />
      <BrandMark />
      <div className="hero-dash-card" style={{ top: "14%", right: "6%", width: 150 }}><div className="label">Projects Delivered</div><div className="value gold">100+</div></div>
      <div className="hero-dash-card" style={{ bottom: "18%", right: "14%", width: 140 }}><div className="label">Uptime</div><div className="value">99.9%</div></div>
      <div className="container">
        <FadeIn direction="none">
          <GlitchText as="h1" text="Mirza IT Solution — Custom Software, SaaS &amp; Web Development Solutions" className="campaign-headline" />
          <div className="section-eyebrow">Software & Web Development Studio</div>
          <p className="campaign-sub">We help businesses grow with custom software, SaaS and PaaS websites, web development, WordPress builds, and custom dashboards.</p>
          <div className="campaign-actions"><MagneticLink href="/portfolio" className="pill pill-primary"><Icon name="fa-eye" /> View Our Work</MagneticLink><MagneticLink href="/contact" className="pill pill-outline"><Icon name="fa-arrow-right" /> Start Your Project</MagneticLink></div>
          <div className="trust-badges"><span><Icon name="fa-shield-halved" /> Enterprise-grade delivery</span><span><Icon name="fa-users" /> 50+ businesses served</span><span><Icon name="fa-star" /> 4.9/5 client rating</span></div>
          <div className="hero-stats"><div className="hero-stat"><div className="hero-stat-number"><Counter value="100+" /></div><div className="hero-stat-label">Projects Completed</div></div><div className="hero-stat"><div className="hero-stat-number"><Counter value="50+" /></div><div className="hero-stat-label">Happy Clients</div></div><div className="hero-stat"><div className="hero-stat-number">24/7</div><div className="hero-stat-label">Client Support</div></div></div>
        </FadeIn>
      </div>
    </section>
    <section><div className="container text-center"><FadeIn><div className="section-eyebrow">About</div><h2 className="section-title">Turning Ideas Into <strong>Working Software</strong></h2><p className="section-subtitle">At Mirza IT Solution, we turn ideas into working software. From custom software and SaaS platforms to high-converting WordPress websites and custom dashboards, we build digital products that make businesses run better.</p></FadeIn></div></section>
    <section><div className="container"><FadeIn><div className="color-block coral"><div className="text-center"><div className="section-eyebrow">What We Do</div><h2 className="section-title">Our <strong>Services</strong></h2><p className="section-subtitle">Complete software solutions to grow your business, from apps to platforms to dashboards.</p></div><StaggerContainer className="grid-3 service-block-grid">{services.map((service) => <StaggerItem className="service-card" key={service.title}><div className="icon"><Icon name={service.icon} /></div><h3>{service.title}</h3><p>{service.description}</p></StaggerItem>)}</StaggerContainer><div className="text-center section-link"><Link href="/services" className="pill pill-primary">Explore All Services <Icon name="fa-arrow-right" /></Link></div></div></FadeIn></div></section>
    <section><div className="container"><FadeIn><div className="text-center"><div className="section-eyebrow">How We Work</div><h2 className="section-title">Our <strong>Process</strong></h2></div><StaggerContainer className="process-grid">{process.map(([num, title, text]) => <StaggerItem className="process-step" key={num}><div className="num">{num}</div><h3>{title}</h3><p>{text}</p></StaggerItem>)}</StaggerContainer></FadeIn></div></section>
    <section><div className="container"><FadeIn><div className="text-center"><div className="section-eyebrow">Why Us</div><h2 className="section-title">Why Choose <strong>Mirza IT Solution?</strong></h2></div><StaggerContainer className="why-grid">{reasons.map((reason) => <StaggerItem className="why-item" key={reason}><Icon name="fa-check" /><span>{reason}</span></StaggerItem>)}</StaggerContainer></FadeIn></div></section>
    <section className="section-soft"><div className="container"><FadeIn><div className="text-center"><div className="section-eyebrow">Technologies</div><h2 className="section-title">Tools We <strong>Use</strong></h2></div><StaggerContainer className="grid-6">{technologies.map(([label, icon, isBrand]) => <StaggerItem className="tool-item" key={label}><Icon name={icon} brand={isBrand} /><span>{label}</span></StaggerItem>)}</StaggerContainer></FadeIn></div></section>
    <section><div className="container"><FadeIn><div className="color-block navy"><div className="grid-4 stats">{[["100+", "Projects Completed"], ["50+", "Happy Clients"], ["9", "Software Services"], ["24/7", "Client Support"]].map(([number, label]) => <StaggerItem key={label}><div className="stat-number"><Counter value={number} /></div><div className="stat-label">{label}</div></StaggerItem>)}</div></div></FadeIn></div></section>
    <section><div className="container"><FadeIn><div className="text-center"><div className="section-eyebrow">Portfolio</div><h2 className="section-title">Featured <strong>Work</strong></h2></div><StaggerContainer className="grid-3">{portfolioItems.slice(0, 6).map(([title, category, , , description, image]) => <StaggerItem className="portfolio-card" key={title}><div className="thumb"><Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} /></div><div className="info"><h4>{title}</h4><span>{category}</span><p>{description}</p></div></StaggerItem>)}</StaggerContainer></FadeIn></div></section>
    <section className="section-soft"><div className="container"><FadeIn><div className="text-center"><div className="section-eyebrow">Testimonials</div><h2 className="section-title">What <strong>Clients Say</strong></h2></div><StaggerContainer className="grid-3">{testimonials.map(([initial, name, role, quote]) => <StaggerItem className="testimonial-card" key={name}><div className="quote"><Icon name="fa-quote-left" /></div><p>&quot;{quote}&quot;</p><div className="author"><div className="avatar">{initial}</div><div><div className="name">{name}</div><div className="role">{role}</div></div></div></StaggerItem>)}</StaggerContainer></FadeIn></div></section>
    <BlogTeaser />
    <section><div className="container"><FadeIn><div className="color-block text-center"><div className="section-eyebrow">Let&apos;s Build</div><h2 className="display-title">Ready to Build Something <strong>Great?</strong></h2><p className="section-subtitle">Let Mirza IT Solution help you build custom software, websites, and platforms that make your business run better.</p><Link href="/contact" className="pill pill-primary">Contact Us Today <Icon name="fa-arrow-right" /></Link></div></FadeIn></div></section>
  </SiteShell>;
}
