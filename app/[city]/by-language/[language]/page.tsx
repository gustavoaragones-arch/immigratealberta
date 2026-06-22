import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLanguageCityCombos,
  getConsultantsByCityAndLanguage,
  LANGUAGE_LABELS,
  isFilterableLanguage,
} from "@/lib/language-filter";
import { getCity } from "@/lib/queries";
import { ConsultantCard } from "@/components/consultant/consultant-card";

export async function generateStaticParams() {
  const combos = await getLanguageCityCombos();
  return combos.map((c) => ({
    city: c.city_slug,
    language: c.lang_code,
  }));
}

export const revalidate = 3600;

type Props = { params: { city: string; language: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, language } = params;
  const label = LANGUAGE_LABELS[language];
  const cityRow = await getCity(city);

  if (!label || !cityRow) return { title: "Not found" };

  const title = `${label}-speaking immigration consultants in ${cityRow.name}, Alberta`;
  return {
    title: `${title} · ImmigrateAlberta`,
    description: `Find RCIC-verified immigration consultants in ${cityRow.name}, Alberta who speak ${label}. Every consultant is manually verified against the CICC public registry — no paid placements, no fake reviews.`,
    alternates: { canonical: `/${city}/by-language/${language}` },
  };
}

export default async function CityByLanguagePage({ params }: Props) {
  const { city, language } = params;

  if (!isFilterableLanguage(language)) notFound();

  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const { consultants, secondaryIds, primaryCityNames } =
    await getConsultantsByCityAndLanguage(city, language);

  const langLabel = LANGUAGE_LABELS[language];

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Alberta · {cityRow.name} · By Language
        </div>
        <h1 className="mb-4 text-2xl font-medium text-stone-900 md:text-3xl">
          {langLabel}-speaking immigration consultants in {cityRow.name}
        </h1>
        <p className="mb-8 text-[14px] leading-relaxed text-stone-600">
          {consultants.length} RCIC-verified consultant
          {consultants.length === 1 ? "" : "s"} in {cityRow.name} who speak{" "}
          {langLabel}. Every listing is manually verified against the{" "}
          <a
            href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-700 underline underline-offset-2 hover:text-stone-900"
          >
            CICC public registry
          </a>
          .
        </p>

        {consultants.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
            We don&apos;t currently have {langLabel}-speaking consultants listed
            in {cityRow.name}. See the{" "}
            <Link href={`/${city}`} className="underline">
              full {cityRow.name} directory
            </Link>{" "}
            or the{" "}
            <Link href="/languages" className="underline">
              language overview
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {consultants.map((c) => (
              <ConsultantCard
                key={c.id}
                consultant={c}
                secondaryNote={
                  secondaryIds.has(c.id)
                    ? (primaryCityNames[c.primary_city_slug ?? ""] ??
                      c.primary_city_slug ??
                      undefined)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[12px] text-stone-500">
          Looking elsewhere?{" "}
          <Link href={`/${city}`} className="underline underline-offset-2">
            All consultants in {cityRow.name}
          </Link>{" "}
          ·{" "}
          <Link href="/languages" className="underline underline-offset-2">
            Browse by language
          </Link>
        </p>
      </div>
    </main>
  );
}
