"use client";

import Link from "next/link";
import { useState } from "react";
import { useSubmitContact } from "./hooks";

const nav = [["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Portfolio", "/portfolio"], ["Pricing", "/pricing"], ["Contact", "/contact"]];
const serviceLinks = ["App Development", "SaaS Website", "PaaS Website", "Web Development", "WordPress Development", "Custom Software", "Custom Web Software", "Custom Dashboard"];

export function Icon({ name, brand }: { name: string; brand?: boolean }) { return <i className={`${brand ? "fab" : "fas"} ${name}`} aria-hidden="true" />; }

export function Header({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <header id="header" className={open ? "menu-open" : ""}><div className="container header-inner">
      <Link href="/" className="logo">Mirza IT <strong>Solution</strong></Link>
      <div className="header-right">
        <button className={`hamburger ${open ? "open" : ""}`} aria-label="Toggle menu" onClick={() => setOpen(!open)}><span /><span /><span /></button>
      </div>
      <nav className={`nav-links ${open ? "open" : ""}`}>
        {nav.map(([label, href]) => <Link key={href} href={href} className={active === label ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/contact" className="pill pill-primary nav-cta" onClick={() => setOpen(false)}>Get Started</Link>
      </nav>
    </div></header>
  </>;
}

export function Footer() {
  return <footer><div className="container"><div className="footer-grid">
    <div className="footer-brand"><Link href="/" className="logo">Mirza IT <strong>Solution</strong></Link><p>Mirza IT Solution is a software and web development studio offering custom software, SaaS and PaaS websites, web development, WordPress development, and custom dashboard solutions.</p><div className="footer-social"><a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a><a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a><a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a><a href="https://wa.me/92XXXXXXXXXX" aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a></div></div>
    <div><h4>Quick Links</h4><ul>{nav.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></div>
    <div><h4>Services</h4><ul>{serviceLinks.map((item) => <li key={item}><Link href="/services">{item}</Link></li>)}</ul></div>
    <div><h4>Contact</h4><ul><li><a href="mailto:your-email@example.com"><Icon name="fa-envelope" /> Email us</a></li><li><a href="https://wa.me/92XXXXXXXXXX"><Icon name="fa-whatsapp" /> WhatsApp</a></li><li><Icon name="fa-globe" /> Available Worldwide</li></ul></div>
  </div><div className="footer-bottom"><span>© 2026 Mirza IT Solution. All Rights Reserved.</span><div><a href="#">Terms</a><a href="#">Privacy</a></div></div></div></footer>;
}

export function SiteShell({ children, active }: { children: React.ReactNode; active?: string }) { return <><Header active={active} /><a href="https://wa.me/92XXXXXXXXXX" target="_blank" rel="noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp"><i className="fab fa-whatsapp" /></a>{children}<Footer /></>; }

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) { return <section className="page-hero"><div className="container text-center"><div className="section-eyebrow">{eyebrow}</div><h1 className="section-title">{title}</h1><p className="hero-copy">{children}</p></div></section>; }

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div>; }

export function PortfolioFilter({ items }: { items: readonly (readonly [string, string, string, string])[] }) {
  const [filter, setFilter] = useState("all");
  const filters = [["all", "All"], ["app", "App Development"], ["saas", "SaaS Website"], ["paas", "PaaS Website"], ["web", "Web Development"], ["wordpress", "WordPress Development"], ["software", "Custom Software"], ["websoftware", "Custom Web Software"], ["dashboard", "Custom Dashboard"]];
  return <><div className="portfolio-filters">{filters.map(([id, label]) => <button key={id} className={`filter-btn ${filter === id ? "active" : ""}`} onClick={() => setFilter(id)}>{label}</button>)}</div><div className="grid-3">{items.filter(([, , category]) => filter === "all" || category === filter).map(([title, category, , icon]) => <div className="portfolio-card" key={title}><div className="thumb"><Icon name={icon} /></div><div className="info"><h4>{title}</h4><span>{category}</span></div></div>)}</div></>;
}

export function ContactForm() { const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" }); const submit = useSubmitContact(); return <form className="contact-form" onSubmit={(event) => { event.preventDefault(); submit.mutate(form, { onSuccess: () => setForm({ name: "", email: "", phone: "", service: "", message: "" }) }); }}><h3>Send Us a <strong>Message</strong></h3><div className="form-group"><input required type="text" placeholder=" " value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><label>Full Name</label></div><div className="form-group"><input required type="email" placeholder=" " value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><label>Email Address</label></div><div className="form-group"><input type="text" placeholder=" " value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><label>Phone Number</label></div><div className="form-group"><select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}><option value="">Select a service</option>{serviceLinks.map((item) => <option key={item}>{item}</option>)}</select></div><div className="form-group"><textarea required placeholder=" " value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /><label>Project Details</label></div><button type="submit" className="pill pill-primary" disabled={submit.isPending}><Icon name="fa-paper-plane" /> {submit.isPending ? "Sending…" : submit.isSuccess ? "Message Sent" : "Send Message"}</button>{submit.isSuccess && <p className="form-success">Thank you. We will get back to you shortly.</p>}{submit.isError && <p style={{ color: "#c0392b" }}>{(submit.error as Error).message}</p>}</form>; }

export function FAQ() { const [open, setOpen] = useState(0); const questions = [["What services does Mirza IT Solution provide?", "Mirza IT Solution provides app development, SaaS and PaaS websites, web development, WordPress development, custom software, and custom dashboards."], ["Do you work with international clients?", "Yes, Mirza IT Solution works with clients worldwide through email, video calls, and project management tools."], ["Can you create a complete brand package?", "Yes, we can create logos, brand identity, social media designs, websites, videos, and marketing content."], ["Do you provide revisions?", "Yes, revisions are provided based on the project package and client requirements."], ["How can I start a project?", "Contact us through the form, email, or WhatsApp button to discuss your project."]]; return <div className="faq-list">{questions.map(([question, answer], index) => <div className={`faq-item ${open === index ? "active" : ""}`} key={question}><button className="faq-question" onClick={() => setOpen(open === index ? -1 : index)}>{question}<i className="fas fa-chevron-down" /></button>{open === index && <div className="faq-answer">{answer}</div>}</div>)}</div>; }
