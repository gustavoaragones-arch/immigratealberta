import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getConsultantBySlug,
  getAllConsultantSlugs,
  getCity,
} from "@/lib/queries";
import { canonical } from "@/lib/site";
import {
  getLanguageCityCombos,
  LANGUAGE_LABELS,
  isFilterableLanguage,
} from "@/lib/language-filter";
import { SERVICE_LABELS } from "@/lib/service-labels";
import { ConsultantHeader } from "@/components/consultant/consultant-header";
import { ConsultantTrustPanel } from "@/components/consultant/consultant-trust-panel";
import { ConsultantOffices } from "@/components/consultant/consultant-offices";
import { ConsultantServices } from "@/components/consultant/consultant-services";
import { ConsultantContactSticky } from "@/components/consultant/consultant-contact-sticky";

export async function generateStaticParams() {
  const slugs = await getAllConsultantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const consultant = await getConsultantBySlug(slug);
  if (!consultant) return { title: "Consultant not found" };
  const primaryBiz = consultant.businesses.find((b) => b.is_primary);
  const cityName =
    primaryBiz?.city_slug === "red-deer"
      ? "Red Deer"
      : primaryBiz?.city_slug
        ? primaryBiz.city_slug.charAt(0).toUpperCase() +
          primaryBiz.city_slug.slice(1)
        : "Alberta";
  const title = `${consultant.full_name} · RCIC ${consultant.rcic_number} · ${cityName} Immigration Consultant`;
  const description = `Verified Regulated Canadian Immigration Consultant ${consultant.full_name} (${consultant.rcic_number}) in ${cityName}. Listed on the CICC public registry.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonical(`/consultant/${slug}`),
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: canonical(`/consultant/${slug}`) },
  };
}

export default async function ConsultantPage({ params }: Props) {
  const { slug } = params;
  const consultant = await getConsultantBySlug(slug);
  if (!consultant) notFound();

  const primaryCitySlug = consultant.primary_city_slug;
  const [cityRow, languageCombos] = await Promise.all([
    primaryCitySlug ? getCity(primaryCitySlug) : Promise.resolve(null),
    getLanguageCityCombos(),
  ]);

  const primaryCityName =
    cityRow?.name ??
    (primaryCitySlug
      ? primaryCitySlug.charAt(0).toUpperCase() + primaryCitySlug.slice(1)
      : "Alberta");

  const consultantLanguages = (consultant.language_codes ?? []).filter(
    (l) => l !== "en" && isFilterableLanguage(l),
  );

  const availableLangPages = primaryCitySlug
    ? languageCombos
        .filter(
          (c) =>
            c.city_slug === primaryCitySlug &&
            consultantLanguages.includes(c.lang_code),
        )
        .sort((a, b) => b.consultant_count - a.consultant_count)
        .slice(0, 3)
    : [];

  const primaryService = (consultant.service_slugs ?? []).find(
    (s) => s !== "general",
  );

  return (
    <main className="pb-32 md:pb-12">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <ConsultantHeader consultant={consultant} />
        <div className="mt-8 space-y-8">
          <ConsultantTrustPanel consultant={consultant} />
          <ConsultantServices consultant={consultant} />
          <ConsultantOffices consultant={consultant} />
        </div>

        {primaryCitySlug && (
          <section className="mt-10 border-t border-stone-200 pt-8">
            <h2 className="mb-4 text-[16px] font-medium text-stone-900">
              Related searches
            </h2>

            <div className="mb-5">
              <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wider text-stone-500">
                More consultants in {primaryCityName}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/${primaryCitySlug}`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                >
                  All consultants in {primaryCityName}
                </Link>
                {primaryService && SERVICE_LABELS[primaryService] && (
                  <Link
                    href={`/${primaryCitySlug}/${primaryService}-consultants`}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                  >
                    {SERVICE_LABELS[primaryService]} in {primaryCityName}
                  </Link>
                )}
              </div>
            </div>

            {availableLangPages.length > 0 && (
              <div>
                <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wider text-stone-500">
                  Consultants who speak the same languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableLangPages.map((l) => (
                    <Link
                      key={l.lang_code}
                      href={`/${primaryCitySlug}/by-language/${l.lang_code}`}
                      className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                    >
                      {LANGUAGE_LABELS[l.lang_code]}-speaking in{" "}
                      {primaryCityName}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      <ConsultantContactSticky consultant={consultant} />
    </main>
  );
}
