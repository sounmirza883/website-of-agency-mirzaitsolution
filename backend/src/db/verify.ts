/**
 * Checks that a Supabase project is fully wired up for this app.
 *
 *   npm run verify:db
 *
 * Written for switching Supabase projects/accounts: it catches the two things
 * that silently break the app — migrate.sql never run, and the `project-files`
 * Storage bucket missing — before you find out via a 500 in the UI.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PASS = "  ✓";
const FAIL = "  ✗";
let failures = 0;

function ok(msg: string) { console.log(`${PASS} ${msg}`); }
/** A dead host / no network — never confuse this with "the table is missing". */
function isNetworkError(m: string) { return /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|network/i.test(m); }
function isMissing(m: string) { return /does not exist|schema cache|Could not find the table/i.test(m); }
function bad(msg: string, hint?: string) {
  failures++;
  console.log(`${FAIL} ${msg}`);
  if (hint) console.log(`      → ${hint}`);
}

/** Tables the app queries, and the Phase 3 columns that only exist post-migration. */
const TABLES: Record<string, string[]> = {
  users: ["id", "email", "role", "can_create_clients"],
  admin_projects: ["client_id", "employee_id", "progress"],
  admin_services: ["name"],
  admin_invoices: ["proof_path"],
  admin_blog: ["content"],
  admin_portfolio: ["description"],
  notifications: ["target_role", "target_user_id", "creator_role"],
  project_messages: ["project_id", "sender_role", "sender_id"],
  project_files: ["path", "uploaded_by", "client_id"],
  employee_tasks: ["employee_id"],
  employee_attendance: ["check_in", "check_out"],
  employee_leave_requests: ["from_date", "to_date", "status"],
  client_invoices: ["proof_path", "client_id"],
  client_tickets: ["description", "client_id"],
  client_milestones: ["client_id"],
  website_services: ["title"],
  website_contact_submissions: ["email"],
};

/** Tables the Phase 3 migration drops; their presence means an older schema. */
const SHOULD_BE_GONE = ["client_projects", "employee_assigned_projects", "client_messages", "admin_notifications"];

async function main() {
  console.log("\nEnvironment");
  if (!url) bad("SUPABASE_URL missing", "add it to backend/.env");
  else ok(`SUPABASE_URL   ${url}`);
  if (!anonKey) bad("SUPABASE_ANON_KEY missing");
  else ok(`SUPABASE_ANON_KEY   set (${anonKey.length} chars)`);
  if (!serviceKey) bad("SUPABASE_SERVICE_ROLE_KEY missing", "file uploads will return 503 without it");
  else ok(`SUPABASE_SERVICE_ROLE_KEY   set (${serviceKey.length} chars)`);
  if (!process.env.JWT_SECRET) bad("JWT_SECRET missing", "sessions drop on every restart without it");
  else ok("JWT_SECRET   set");

  if (!url || !anonKey) {
    console.log("\nCannot continue without SUPABASE_URL and SUPABASE_ANON_KEY.\n");
    process.exit(1);
  }

  const db = createClient(url, anonKey);

  // Reachability first. Without this, a DNS/network failure surfaces as a
  // generic error on every query and the checks below would misreport it as
  // a schema problem — or worse, as a pass.
  console.log("\nConnectivity");
  const probe = await db.from("users").select("id").limit(1);
  if (probe.error && isNetworkError(probe.error.message)) {
    bad(`cannot reach ${url}`, probe.error.message);
    console.log(
      "\n      The host did not resolve or refused the connection. Usually this means\n" +
      "      the Supabase project was deleted/paused, or SUPABASE_URL is wrong.\n" +
      "      Schema checks skipped — they would be meaningless.\n"
    );
    process.exit(1);
  }
  ok("project is reachable");

  console.log("\nSchema (run backend/src/db/migrate.sql if these fail)");
  for (const [table, cols] of Object.entries(TABLES)) {
    const { error } = await db.from(table).select(cols.join(",")).limit(1);
    if (!error) ok(`${table}  (${cols.join(", ")})`);
    else if (isMissing(error.message)) bad(`${table} — ${error.message}`);
    else bad(`${table} — unexpected error: ${error.message}`, "not a missing-table error; check RLS/permissions");
  }

  console.log("\nOld tables that the migration should have dropped");
  for (const t of SHOULD_BE_GONE) {
    const { error } = await db.from(t).select("*").limit(1);
    if (!error) bad(`${t} still exists`, "this project is on a pre-Phase-3 schema; re-run migrate.sql");
    else if (isMissing(error.message)) ok(`${t} — gone, as expected`);
    else bad(`${t} — could not determine: ${error.message}`);
  }

  console.log("\nSeed data");
  const { data: admins, error: adminErr } = await db.from("users").select("email,role").eq("role", "admin");
  if (adminErr) bad(`could not read users — ${adminErr.message}`);
  else if (!admins?.length) bad("no admin user", "migrate.sql seeds admin@mirzaitsolution.com / ChangeMe123!");
  else ok(`${admins.length} admin account(s): ${admins.map((a) => a.email).join(", ")}`);

  if (serviceKey) {
    console.log("\nStorage");
    const admin = createClient(url, serviceKey);
    const { data: buckets, error: bErr } = await admin.storage.listBuckets();
    if (bErr && isNetworkError(bErr.message)) bad(`storage unreachable — ${bErr.message}`);
    else if (bErr) bad(`service-role key rejected — ${bErr.message}`, "check you copied the service_role key, not anon");
    else {
      const bucket = buckets?.find((b) => b.name === "project-files");
      if (!bucket) bad("bucket 'project-files' missing", "create it in Storage — private, exact name");
      else if (bucket.public) bad("bucket 'project-files' is PUBLIC", "make it private; the app serves signed URLs");
      else ok("bucket 'project-files' exists and is private");
    }
  }

  console.log(failures === 0 ? "\nAll checks passed — this project is ready.\n" : `\n${failures} check(s) failed — see above.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("\nverify failed:", e.message, "\n"); process.exit(1); });
