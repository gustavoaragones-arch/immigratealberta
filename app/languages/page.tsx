import Link from "next/link";
import type { Metadata } from "next";
import { Globe } from "lucide-react";
import {
  getLanguageCityCombos,
  getLanguageProvinceTotals,
} from "@/lib/language-filter";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Find an immigration consultant by language · ImmigrateAlberta",
  description:
    "Browse RCIC-verified immigration consultants in Alberta by the language they speak. Find Punjabi, Hindi, Spanish, Tagalog, Arabic, Mandarin, and more.",
  alternates: { canonical: "/languages" },
};

export const revalidate = 3600;

const LANGUAGE_BLURBS: Record<string, string> = {
  pa: "One of the most-spoken non-English languages in Alberta, especially in Calgary and Edmonton. Common for Express Entry, AAIP, and family sponsorship applications.",
  hi: "Hindi-speaking RCICs serve clients across South Asian communities, often handling study permits, work permits, and Express Entry cases.",
  ur: "Urdu-speaking consultants assist clients from Pakistan and other South Asian backgrounds with study, work, and family sponsorship matters.",
  ar: "Arabic-speaking RCICs serve clients across Middle Eastern and North African communities, including refugee, family sponsorship, and PR applications.",
  es: "Spanish-speaking consultants assist clients from Latin American countries, particularly common for work permits, study permits, and family sponsorship.",
  tl: "Tagalog-speaking RCICs serve Filipino clients, often handling caregiver pathways, family sponsorship, and work permit applications.",
  zh: "Mandarin-speaking consultants assist clients from China, Taiwan, and Chinese-speaking communities with PR, study, and investor-track applications.",
  yue: "Cantonese-speaking RCICs serve clients from Hong Kong and Guangdong with PR, family sponsorship, and study permit applications.",
  fa: "Farsi-speaking consultants assist clients from Iran and Afghanistan with study, work, family sponsorship, and refugee-related matters.",
  fr: "French-speaking consultants serve francophone newcomers, including those targeting Quebec or French-language Express Entry streams.",
  gu: "Gujarati-speaking RCICs serve clients from Western Indian communities, common for study permits, work permits, and family sponsorship.",
  sr: "Serbian-speaking consultants assist clients from Serbia and the broader Balkans with PR, work permit, and family sponsorship applications.",
  hr: "Croatian-speaking RCICs serve clients from Croatia and the Balkans with PR, work, and family sponsorship matters.",
};

export default async function LanguagesHubPage() {
  const languages = await getLanguageProvinceTotals();

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Browse by language
        </div>
        <h1 className="mb-4 text-2xl font-medium text-stone-900 md:text-3xl">
          Find an immigration consultant who speaks your language
        </h1>
        <p className="mb-8 text-[14px] leading-relaxed text-stone-600">
          Immigration involves trust, nuance, and complex documents. Working with
          a consultant in your first language reduces miscommunication on
          details that matter — refusal grounds, eligibility nuances, document
          phrasing. ImmigrateAlberta&apos;s verified RCICs collectively speak the
          languages below. Every consultant is manually verified against the
          CICC public registry.
        </p>

        <div className="mb-10 space-y-2">
          {languages.map((l) => (
            <div
              key={l.lang_code}
              className="rounded-lg border border-stone-300 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Globe
                      className="h-4 w-4 text-stone-500"
                      aria-hidden="true"
                    />
                    <h2 className="text-[15px] font-semibold text-stone-900">
                      {l.label}
                    </h2>
                    <span className="text-[12px] text-stone-500">
                      {l.consultant_count} consultant
                      {l.consultant_count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone-600">
                    {LANGUAGE_BLURBS[l.lang_code] ??
                      `${l.label}-speaking RCICs verified in Alberta.`}
                  </p>
                </div>
              </div>
              <LanguageCityLinks langCode={l.lang_code} />
            </div>
          ))}
        </div>

        <div className="rounded-lg border-l-2 border-slate-700 bg-stone-100 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-stone-700">
            Don&apos;t see your language? Some consultants in the directory
            speak languages we don&apos;t yet have enough volume to feature here
            (3+ consultants per language required for a dedicated page).{" "}
            <Link
              href="/decision-tool"
              className="text-stone-700 underline underline-offset-2 hover:text-stone-900"
            >
              Use the decision tool
            </Link>{" "}
            to search consultants by your needs, then check their profiles for
            language information.
          </p>
        </div>
      </div>
    </main>
  );
}

async function LanguageCityLinks({ langCode }: { langCode: string }) {
  const combos = await getLanguageCityCombos();
  const cityLinks = combos.filter((c) => c.lang_code === langCode);

  if (cityLinks.length === 0) return null;

  const { data: cityRows } = await supabase
    .from("cities")
    .select("slug, name")
    .in("slug", cityLinks.map((c) => c.city_slug));

  const cityNames: Record<string, string> = Object.fromEntries(
    (cityRows ?? []).map((r) => [r.slug, r.name]),
  );

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {cityLinks.map((cl) => (
        <Link
          key={cl.city_slug}
          href={`/${cl.city_slug}/by-language/${cl.lang_code}`}
          className="rounded-full border border-stone-300 px-3 py-1 text-[11px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
        >
          {cityNames[cl.city_slug] ?? cl.city_slug} ({cl.consultant_count})
        </Link>
      ))}
    </div>
  );
}
