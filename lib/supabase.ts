import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
}

if (!/^https?:\/\//i.test(url)) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL must be a full URL (e.g. https://YOUR_PROJECT.supabase.co). Got: ${url.slice(0, 40)}…`,
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
