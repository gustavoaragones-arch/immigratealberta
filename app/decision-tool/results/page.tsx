import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getService, getCity } from "@/lib/queries";
import { ConsultantCard } from "@/components/consultant/consultant-card";
import { DecisionToolShell } from "@/components/decision-tool/decision-tool-shell";
import type { ConsultantCardData } from "@/types/database";

const VALID_CASES = new Set([
  "pr-express-entry",
  "provincial-nominee",
  "study-permit",
  "work-permit-lmia",
  "family-sponsorship",
  "visitor-super-visa",
  "citizenship",
  "refugee-irb",
  "unsure",
]);
const VALID_CITIES = new Set([
  "calgary",
  "edmonton",
  "red-deer",
  "lethbridge",
  "cochrane",
  "any",
]);

const MIN_RESULTS = 3;
const MAX_RESULTS = 12;

type Props = {
  searchParams: { case?: string; city?: string };
};

export const metadata: Metadata = {
  title: "Your matches · ImmigrateAlberta",
  alternates: { canonical: "/decision-tool/results" },
  robots: { index: false, follow: false },
};

async function fetchConsultants({
  caseSlug,
  citySlug,
}: {
  caseSlug: string | null;
  citySlug: string | null;
}): Promise<ConsultantCardData[]> {
  let q = supabase
    .from("consultants")
    .select(
      "id, rcic_number, slug, full_name, primary_city_slug, language_codes, service_slugs",
    )
    .eq("status", "published");

  if (citySlug) q = q.eq("primary_city_slug", citySlug);
  if (caseSlug) q = q.contains("service_slugs", [caseSlug]);

  const { data: consultants } = await q
    .order("full_name", { ascending: true })
    .limit(MAX_RESULTS);

  if (!consultants || consultants.length === 0) return [];

  const ids = consultants.map((c) => c.id);
  const { data: links } = await supabase
    .from("consultant_businesses")
    .select(
      "consultant_id, business:businesses(legal_name, display_name, address, phone, website, city_slug)",
    )
    .in("consultant_id", ids)
    .eq("is_primary", true);

  const map = new Map<string, ConsultantCardData["primary_business"]>();
  for (const l of links ?? []) {
    const row = l as {
      consultant_id: string;
      business:
        | ConsultantCardData["primary_business"]
        | ConsultantCardData["primary_business"][]
        | null;
    };
    const biz = Array.isArray(row.business)
      ? row.business[0] ?? null
      : row.business;
    map.set(row.consultant_id, biz);
  }

  return consultants.map((c) => ({
    id: c.id,
    rcic_number: c.rcic_number,
    slug: c.slug,
    full_name: c.full_name,
    primary_city_slug: c.primary_city_slug ?? null,
    language_codes: c.language_codes ?? [],
    service_slugs: c.service_slugs ?? [],
    primary_business: map.get(c.id) ?? null,
  }));
}

type FallbackTier =
  | { tier: "exact"; results: ConsultantCardData[] }
  | {
      tier: "same-city-broader";
      results: ConsultantCardData[];
      cityName: string;
    }
  | {
      tier: "same-service-other-city";
      results: ConsultantCardData[];
      serviceName: string;
    }
  | {
      tier: "all-alberta";
      results: ConsultantCardData[];
    };

async function getResultsWithFallback(
  caseSlug: string | null,
  citySlug: string | null,
): Promise<FallbackTier> {
  const exact = await fetchConsultants({ caseSlug, citySlug });
  if (exact.length >= MIN_RESULTS) {
    return { tier: "exact", results: exact };
  }

  if (citySlug) {
    const broader = await fetchConsultants({ caseSlug: null, citySlug });
    if (broader.length >= MIN_RESULTS) {
      const city = await getCity(citySlug);
      return {
        tier: "same-city-broader",
        results: broader,
        cityName: city?.name ?? citySlug,
      };
    }
  }

  if (caseSlug) {
    const sameService = await fetchConsultants({ caseSlug, citySlug: null });
    if (sameService.length >= MIN_RESULTS) {
      const service = await getService(caseSlug);
      return {
        tier: "same-service-other-city",
        results: sameService,
        serviceName: service?.name ?? caseSlug,
      };
    }
  }

  const everything = await fetchConsultants({ caseSlug: null, citySlug: null });
  return { tier: "all-alberta", results: everything };
}

function FallbackNotice({
  outcome,
}: {
  outcome: FallbackTier;
}) {
  if (outcome.tier === "exact") return null;

  let message = "";
  if (outcome.tier === "same-city-broader") {
    message = `We don't have enough consultants in ${outcome.cityName} who specialise in this case type, so here are all verified RCICs in ${outcome.cityName}.`;
  } else if (outcome.tier === "same-service-other-city") {
    message = `No matches in your preferred city. Here are ${outcome.serviceName} consultants elsewhere in Alberta.`;
  } else {
    message = `Not enough exact matches. Here is the broader list of verified RCICs in Alberta — verify each one's specialty on their profile before contacting.`;
  }

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
      {message}
    </div>
  );
}

export default async function ResultsPage({ searchParams }: Props) {
  const rawCase = searchParams.case;
  const rawCity = searchParams.city;

  if (!rawCase || !VALID_CASES.has(rawCase)) redirect("/decision-tool");
  if (!rawCity || !VALID_CITIES.has(rawCity)) {
    redirect(`/decision-tool/city?case=${rawCase}`);
  }

  const caseSlug = rawCase === "unsure" ? null : rawCase;
  const citySlug = rawCity === "any" ? null : rawCity;

  const [service, city, outcome] = await Promise.all([
    caseSlug ? getService(caseSlug) : Promise.resolve(null),
    citySlug ? getCity(citySlug) : Promise.resolve(null),
    getResultsWithFallback(caseSlug, citySlug),
  ]);

  const summaryParts: string[] = [];
  if (service) summaryParts.push(service.short_label ?? service.name);
  summaryParts.push(city ? city.name : "Alberta");
  const summary = summaryParts.join(" · ");

  return (
    <DecisionToolShell
      stepNumber={3}
      stepLabel="Your matches"
      backHref={`/decision-tool/city?case=${rawCase}`}
    >
      <div className="mb-6">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          {summary}
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-medium text-stone-900 md:text-3xl">
            Your matches
          </h1>
          <Link
            href="/decision-tool"
            className="inline-flex items-center gap-1 text-[12px] text-stone-600 transition-colors hover:text-stone-900"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit answers
          </Link>
        </div>
      </div>

      <FallbackNotice outcome={outcome} />

      {outcome.results.length === 0 ? (
        <p className="text-sm text-stone-500">
          No published consultants matched. Try{" "}
          <Link href="/decision-tool" className="underline">
            starting over
          </Link>{" "}
          with a different case type.
        </p>
      ) : (
        <div className="space-y-3">
          {outcome.results.map((c) => (
            <ConsultantCard key={c.id} consultant={c} />
          ))}
        </div>
      )}
    </DecisionToolShell>
  );
}
