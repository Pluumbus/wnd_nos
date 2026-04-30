/**
 * One-off: create Auth user + admin role row.
 *
 * Needs the *service_role* key (Settings → API → service_role), NOT anon / not EXPO_PUBLIC_*.
 *
 * .env.local (preferred, gitignored), e.g.:
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (long JWT from "service_role" secret)
 *
 * You may reuse EXPO_PUBLIC_SUPABASE_URL if you already have it in .env
 *
 * Run from repo root:
 *   npm run seed:admin -- you@example.com "your-password"
 */
import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url =
  process.env.SUPABASE_URL?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim();

const [email, password] = process.argv.slice(2);

async function main() {
  if (!url || !serviceKey) {
    throw new Error(
      "Set SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
        "Get service_role from Supabase Dashboard → Settings → API (secret). Do not use anon key."
    );
  }
  if (anonKey && serviceKey === anonKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must not be the same as the anon key.\n" +
        "Use the *service_role* secret from Dashboard → Settings → API."
    );
  }
  if (!email || !password) {
    throw new Error("Usage: npm run seed:admin -- <email> <password>");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    if (createErr.message?.includes("not allowed") || createErr.code === "not_admin") {
      throw new Error(
        "Auth returned 403 not_admin — the key is not service_role.\n" +
          "Copy `service_role` from Supabase → Settings → API into SUPABASE_SERVICE_ROLE_KEY in .env.local"
      );
    }
    throw createErr;
  }

  const userId = created.user?.id;
  if (!userId) {
    throw new Error("No user id returned");
  }

  const { error: roleErr } = await admin.from("user_roles").upsert({
    user_id: userId,
    role: "admin",
  });

  if (roleErr) {
    throw roleErr;
  }

  console.log("OK: admin user and user_roles row:", userId);
}

void main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
