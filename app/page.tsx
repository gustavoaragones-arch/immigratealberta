import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { HeroPill } from "@/components/home/hero-pill";
import { DecisionToolPreview } from "@/components/home/decision-tool-preview";
import { TrustPillars } from "@/components/home/trust-pillars";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Find a verified immigration consultant in Alberta · ImmigrateAlberta",
  description:
    "A trust-verified directory of Regulated Canadian Immigration Consultants (RCICs) in Alberta. Every consultant is manually checked against the CICC public registry. Free to use, no paid placements.",
  openGraph: {
    title: "Find a verified immigration consultant in Alberta",
    description:
      "A trust-verified directory of RCICs in Alberta. Every consultant manually checked against the CICC public registry.",
    type: "website",
    url: "https://immigratealberta.ca",
  },
  alternates: { canonical: "/" },
};

async function getHomeStats() {
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
    verifiedCount: count ?? 0,
    lastCheckedISO:
      latest?.cicc_verified_on ?? new Date().toISOString().slice(0, 10),
  };
}

export default async function HomePage() {
  const stats = await getHomeStats();

  return (
    <main>
      <section className="px-4 pt-16 pb-10 text-center md:pt-20">
        <HeroPill
          verifiedCount={stats.verifiedCount}
          lastCheckedISO={stats.lastCheckedISO}
        />
        <h1 className="mx-auto max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-stone-900 md:text-[40px]">
          Find a verified immigration consultant in Alberta.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone-600">
          Every consultant on this directory is manually checked against the CICC
          public registry. No fees to find one. No fake reviews.
        </p>
      </section>

      <section className="px-4 pb-12">
        <DecisionToolPreview />
        <div className="mt-4 text-center">
          <Link
            href="/calgary"
            className="group inline-flex items-center gap-1 text-[13px] text-stone-600 underline underline-offset-[3px] hover:text-stone-900"
          >
            Or browse all consultants by city
            <span className="inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </section>

      <TrustPillars />
    </main>
  );
}
