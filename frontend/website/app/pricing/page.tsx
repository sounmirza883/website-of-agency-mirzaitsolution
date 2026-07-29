import Link from "next/link";
import { Icon, PageHero, SiteShell } from "../components";
import { pricingPlans } from "../data";
import { FadeIn, StaggerContainer, StaggerItem } from "../animations";

export default function PricingPage() {
  return (
    <SiteShell active="Pricing">
      <PageHero eyebrow="Pricing" title={<>Simple, Transparent <strong>Pricing</strong></>}>
        Choose the plan that fits your project — from a focused website to a full custom platform.
      </PageHero>
      <section>
        <div className="container">
          <FadeIn>
            <StaggerContainer className="pricing-grid">
              {pricingPlans.map((plan) => (
                <StaggerItem key={plan.name} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
                  {plan.featured && <div className="pricing-badge">Most Popular</div>}
                  <h3 className="pricing-name">{plan.name}</h3>
                  <div className="pricing-price">{plan.price} <span>{plan.period}</span></div>
                  <p className="pricing-desc">{plan.description}</p>
                  <ul className="pricing-features">
                    {plan.features.map((feature) => (
                      <li key={feature}><Icon name="fa-check-circle" /> {feature}</li>
                    ))}
                  </ul>
                  <Link href="/contact" className={`pill ${plan.featured ? "pill-primary" : "pill-outline"}`} style={{ width: "100%" }}>
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"} <Icon name="fa-arrow-right" />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </div>
      </section>
      <section>
        <div className="container">
          <FadeIn>
            <div className="color-block text-center">
              <div className="section-eyebrow">Not Sure Which Plan?</div>
              <h2 className="section-title">Let&apos;s Talk About Your <strong>Project</strong></h2>
              <p className="section-subtitle">Every project is different — tell us what you need and we&apos;ll recommend the right approach and price.</p>
              <Link href="/contact" className="pill pill-primary">Book a Free Consultation <Icon name="fa-arrow-right" /></Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </SiteShell>
  );
}
