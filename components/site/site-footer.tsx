import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function getFooterStats() {
  const { count } = await supabase
    .from("consultants")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { data: latest } = await supabase
    .from("consultants")
    .select("cicc_verified_on")
    .eq("status", "published")
    .order("cicc_verified_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    count: count ?? 0,
    lastChecked: latest?.cicc_verified_on ?? null,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function SiteFooter() {
  const stats = await getFooterStats();

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.6fr,1fr,1fr] md:gap-10">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded bg-slate-800"
                aria-hidden="true"
              >
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
              <span className="text-[13px] font-medium text-stone-900">
                ImmigrateAlberta
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-stone-600">
              A trust-verified directory of Regulated Canadian Immigration
              Consultants practicing in Alberta.
            </p>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Cities
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <Link
                  href="/calgary"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Calgary
                </Link>
              </li>
              <li>
                <Link
                  href="/edmonton"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Edmonton
                </Link>
              </li>
              <li>
                <Link
                  href="/red-deer"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Red Deer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              About
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <Link
                  href="/how-we-verify"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  How we verify
                </Link>
              </li>
              <li>
                <a
                  href="mailto:flag@immigratealberta.ca"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Report a problem
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-stone-200 pt-5 md:flex-row md:items-center">
          <p className="max-w-md text-[11px] leading-relaxed text-stone-500">
            Not affiliated with the Government of Canada or the College of
            Immigration and Citizenship Consultants.
          </p>
          {stats.lastChecked && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-600">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-700 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-700" />
              </span>
              <span>
                {stats.count} RCICs · last checked{" "}
                {formatDate(stats.lastChecked)}
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
