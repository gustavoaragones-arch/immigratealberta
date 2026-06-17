import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { NavCity } from "@/lib/nav-cities";

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

type Props = {
  cities: NavCity[];
};

export async function SiteFooter({ cities }: Props) {
  const stats = await getFooterStats();

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr,1fr,1fr,1fr] md:gap-8">
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
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}`}
                    className="text-stone-600 transition-colors hover:text-stone-900"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
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
                <Link
                  href="/about"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/alberta-immigration-lawyers"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Looking for a lawyer?
                </Link>
              </li>
              <li>
                {/* TODO: confirm preferred contact email before launch */}
                <a
                  href="mailto:contact@immigratealberta.ca"
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
              <li>
                <Link
                  href="/terms"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Consultants
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <Link
                  href="/for-consultants"
                  className="text-stone-600 transition-colors hover:text-stone-900"
                >
                  List or correct your firm
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-200 pt-5">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
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
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
            <span>© {new Date().getFullYear()} Albor Digital</span>
            <span className="text-stone-300">·</span>
            <span>An independent Alberta-registered directory</span>
            <span className="text-stone-300">·</span>
            <Link href="/privacy" className="hover:text-stone-700">Privacy</Link>
            <span className="text-stone-300">·</span>
            <Link href="/terms" className="hover:text-stone-700">Terms</Link>
            <span className="text-stone-300">·</span>
            <Link href="/about" className="hover:text-stone-700">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
