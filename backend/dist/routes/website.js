"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../supabase.js");
const router = (0, express_1.Router)();
const fallbackServices = [
    { title: "Graphic Design", icon: "fa-paint-brush", description: "Creative posters, branding, social media posts, thumbnails, banners, and marketing designs." },
    { title: "Video Editing", icon: "fa-video", description: "Professional video editing for YouTube, reels, ads, documentaries, and social media content." },
    { title: "Motion Graphics", icon: "fa-film", description: "Animated visuals, logo animations, intro/outro videos, explainer animations, and motion designs." },
    { title: "UI/UX Design", icon: "fa-mobile-alt", description: "Clean, user-friendly, modern app and website interfaces focused on better user experience." },
    { title: "WordPress Development", icon: "fa-wordpress", description: "Fast, responsive, SEO-friendly WordPress websites for businesses and online brands." },
    { title: "Social Media Marketing", icon: "fa-chart-line", description: "Content strategy, ad creatives, campaign planning, and brand growth through social platforms." },
    { title: "App Development", icon: "fa-mobile-alt", description: "Native and cross-platform mobile and desktop apps for Android, iOS, and more." },
    { title: "Website Development", icon: "fa-code", description: "Custom high-performance websites, e-commerce stores, and web applications." },
    { title: "Shopify Design", icon: "fa-shopify", description: "Custom Shopify stores with optimized product pages and seamless checkout experiences." },
    { title: "AI Automation", icon: "fa-robot", description: "Workflow automation, AI chatbots, content generation, and custom AI solutions." },
    { title: "SaaS Design", icon: "fa-cloud", description: "SaaS websites, dashboards, and product interfaces built for conversion and scale." },
    { title: "Web Hosting", icon: "fa-server", description: "Reliable, secure, high-performance hosting with 24/7 monitoring and support." },
];
const fallbackPortfolio = [
    ["Modern Brand Identity Design", "Graphic Design", "graphic", "fa-paint-brush"],
    ["YouTube Thumbnail Design Pack", "Graphic Design", "graphic", "fa-image"],
    ["Social Media Campaign Design", "Social Media", "social", "fa-hashtag"],
    ["Business Website Development", "WordPress", "wordpress", "fa-wordpress"],
    ["Creative Motion Logo Animation", "Motion Graphics", "motion", "fa-film"],
    ["Promotional Video Editing", "Video Editing", "video", "fa-video"],
    ["Mobile App UI Design", "UI/UX Design", "uiux", "fa-mobile-alt"],
    ["Real Estate WordPress Website", "WordPress", "wordpress", "fa-home"],
    ["Instagram Growth Campaign", "Social Media", "social", "fa-chart-line"],
    ["Product Advertisement Video", "Video Editing", "video", "fa-ad"],
    ["Corporate Poster Design", "Graphic Design", "graphic", "fa-palette"],
    ["Landing Page UI/UX Design", "UI/UX Design", "uiux", "fa-laptop"],
].map(([title, category, slug, icon]) => ({ title, category, slug, icon }));
const fallbackServiceDetails = [
    { title: "Professional Graphic Design Services", description: "We create eye-catching and brand-focused graphic designs...", features: ["Logo design", "Branding design", "Social media post design", "YouTube thumbnail design", "Poster and banner design", "Business card design", "Flyer and brochure design", "Ad creative design"], className: "service-light" },
    { title: "Professional Video Editing Services", description: "We edit videos that look cinematic, engaging, and professional...", features: ["YouTube video editing", "Short-form reels editing", "TikTok video editing", "Promotional video editing", "Documentary editing", "Color correction", "Sound design", "Captions and subtitles", "Transitions and effects"], className: "service-dark" },
    { title: "Creative Motion Graphics Design", description: "We create animated visuals that make your content more dynamic...", features: ["Logo animation", "Intro and outro animation", "Explainer animations", "Animated titles", "Lower thirds", "Social media animations", "Product animations", "Ad animations"], className: "service-light" },
    { title: "Modern UI/UX Design Services", description: "We design clean, modern, and user-friendly interfaces...", features: ["Website UI design", "Mobile app UI design", "Landing page design", "Wireframes and prototypes", "UX improvement", "Dashboard design", "Responsive layouts"], className: "service-dark" },
    { title: "Responsive WordPress Website Development", description: "We build fast, responsive, SEO-friendly WordPress websites...", features: ["Business websites", "Portfolio websites", "Agency websites", "Landing pages", "Blog websites", "Elementor websites", "Contact forms", "Speed optimization", "Mobile responsive design"], className: "service-light" },
    { title: "Social Media Marketing and Brand Growth", description: "We help brands grow online with professional content...", features: ["Social media post design", "Content strategy", "Facebook and Instagram marketing", "TikTok marketing", "Ad creative design", "Brand awareness campaigns", "Monthly content planning", "Performance improvement"], className: "service-dark" },
    { title: "App Development - Android, iOS and Desktop", description: "We build powerful, user-friendly mobile and desktop applications...", features: ["Native Android app development", "iOS app development", "Cross-platform apps", "Desktop app development", "UI/UX for mobile apps", "App testing and deployment", "API integration", "App store optimization", "Maintenance and updates"], className: "service-light" },
    { title: "Professional Website Development", description: "We develop custom, high-performance websites...", features: ["Custom website development", "E-commerce websites", "Business websites", "Portfolio websites", "Landing pages", "Web application development", "CMS integration", "Performance optimization", "Security implementation"], className: "service-dark" },
    { title: "Shopify Website Designing", description: "We design and build high-converting Shopify stores...", features: ["Custom Shopify theme design", "Product page optimization", "Collection page design", "Shopify store setup", "Theme customization", "App integration", "Payment gateway setup", "Mobile-responsive design", "SEO and speed optimization"], className: "service-light" },
    { title: "AI Automation Solutions", description: "We help businesses leverage artificial intelligence...", features: ["AI chatbot development", "Workflow automation", "Content generation automation", "Data processing automation", "AI integration services", "Custom AI solutions", "Social media automation", "CRM and email automation"], className: "service-dark" },
    { title: "SaaS Website and Product Design", description: "We design and develop SaaS websites, dashboards, and product interfaces...", features: ["SaaS landing page design", "SaaS dashboard UI/UX", "Pricing page design", "Feature page design", "SaaS website development", "User onboarding design", "Subscription management", "Conversion optimization"], className: "service-light" },
    { title: "Website Hosting Services", description: "We provide reliable, secure, and high-performance hosting solutions...", features: ["Shared hosting setup", "VPS hosting management", "Cloud hosting", "cPanel management", "SSL certificate setup", "CDN integration", "Backup solutions", "Security monitoring", "24/7 uptime monitoring"], className: "service-dark" },
];
router.get("/services", async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(fallbackServices);
    const { data, error } = await supabase_js_1.supabase.from("website_services").select("*");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/portfolio", async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(fallbackPortfolio);
    const { data, error } = await supabase_js_1.supabase.from("website_portfolio").select("*");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.get("/service-details", async (_req, res) => {
    if (!supabase_js_1.supabase)
        return res.json(fallbackServiceDetails);
    const { data, error } = await supabase_js_1.supabase.from("website_service_details").select("*");
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json(data);
});
router.post("/contact", async (req, res) => {
    const { name, email, phone, service, message } = req.body ?? {};
    if (!name || !email || !message) {
        return res.status(400).json({ error: "name, email, and message are required" });
    }
    if (!supabase_js_1.supabase) {
        console.log("[contact] Supabase not configured — submission not persisted:", { name, email, phone, service, message });
        return res.status(201).json({ ok: true });
    }
    const { data, error } = await supabase_js_1.supabase
        .from("website_contact_submissions")
        .insert({ name, email, phone: phone || null, service: service || null, message })
        .select()
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
});
exports.default = router;
