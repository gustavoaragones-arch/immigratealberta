/**
 * WARNING: This file must NEVER be imported into a Client Component or any
 * client-side bundle. It uses the service role key, which bypasses Row Level
 * Security and must only run in trusted server contexts (Route Handlers, Server
 * Actions, Server Components without "use client", cron jobs, etc.).
 */
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
