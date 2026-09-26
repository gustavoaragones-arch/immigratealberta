import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getCity,
  getConsultantsByCity,
  getAllCitySlugs,
  getFilterableServices,
} from "@/lib/queries";
import { canonical } from "@/lib/site";
import { getLanguageCityCombos, LANGUAGE_LABELS } from "@/lib/language-filter";
import { ConsultantCard } from "@/components/consultant/consultant-card";
import { ServiceFilterPills } from "@/components/city/service-filter-pills";

export async function generateStaticParams() {
  const slugs = await getAllCitySlugs();
  return slugs.map((city) => ({ city }));
}

export const revalidate = 3600;

type Props = { params: { city: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = params;
  const cityRow = await getCity(city);
  if (!cityRow) return { title: "City not found" };
  return {
    title:
      cityRow.seo_title ??
      `RCIC-verified immigration consultants in ${cityRow.name}`,
    description:
      cityRow.seo_description ??
      `Find a verified Regulated Canadian Immigration Consultant in ${cityRow.name}, Alberta.`,
    alternates: { canonical: canonical(`/${city}`) },
    ...(!cityRow.is_active && { robots: { index: false, follow: true } }),
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const [{ consultants, secondaryIds, primaryCityNames }, services, languageCombos] =
    await Promise.all([
      getConsultantsByCity(city),
      getFilterableServices(),
      getLanguageCityCombos(),
    ]);

  const cityLanguages = languageCombos
    .filter((c) => c.city_slug === city)
    .sort((a, b) => b.consultant_count - a.consultant_count);

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            Alberta · {cityRow.name}
          </div>
          <h1 className="text-2xl font-medium text-stone-900 md:text-3xl">
            RCIC-verified immigration consultants in {cityRow.name}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {consultants.length} consultant{consultants.length === 1 ? "" : "s"}{" "}
            · all manually verified against the CICC public registry.
          </p>
        </div>

        <ServiceFilterPills
          citySlug={city}
          services={services}
          activeServiceSlug={null}
        />

        {consultants.length === 0 ? (
          <p className="text-sm text-stone-500">
            No consultants listed yet for this city.
          </p>
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

        {cityLanguages.length > 0 && (
          <section className="mt-10 border-t border-stone-200 pt-8">
            <h2 className="mb-3 text-[18px] font-medium text-stone-900">
              Find a consultant in {cityRow.name} who speaks your language
            </h2>
            <p className="mb-4 text-[13px] leading-relaxed text-stone-600">
              Working with a consultant in your first language reduces
              miscommunication on the details that matter most — eligibility,
              refusal grounds, document phrasing.
            </p>
            <div className="flex flex-wrap gap-2">
              {cityLanguages.map((cl) => (
                <Link
                  key={cl.lang_code}
                  href={`/${city}/by-language/${cl.lang_code}`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                >
                  {LANGUAGE_LABELS[cl.lang_code]} ({cl.consultant_count})
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
