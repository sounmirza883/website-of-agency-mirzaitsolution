/**
 * Seed script — inserts mock data into existing Supabase tables.
 *
 * Usage:
 *   1. First run backend/src/db/migrate.sql in Supabase SQL Editor
 *   2. Run: npx tsx src/db/seed.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const { error } = await supabase.from("website_services").select("id").limit(1);
  if (error) throw new Error(`Tables not ready? Run migrate.sql first. ${error.message}`);

  // Website
  const { data: existing } = await supabase.from("website_services").select("id").limit(1);
  if (existing?.length) { console.log("Data already exists, skipping seed."); return; }

  await supabase.from("website_services").insert([
    { title: "Graphic Design", icon: "fa-paint-brush", description: "Creative posters, branding, social media posts, thumbnails, banners, and marketing designs." },
    { title: "Video Editing", icon: "fa-video", description: "Professional video editing for YouTube, reels, ads, documentaries, and social media content." },
  ]);
  // ... full insert list in migrate.sql
  console.log("Seed complete.");
}

seed().catch(console.error);
