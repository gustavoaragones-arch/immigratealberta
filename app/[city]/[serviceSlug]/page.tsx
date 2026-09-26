import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getCity,
  getService,
  getConsultantsByCity,
  getConsultantsByCityAndService,
  getFilterableServices,
  getAllCityServiceCombos,
} from "@/lib/queries";
import { substituteCity } from "@/lib/seo";
import { canonical } from "@/lib/site";
import { getLanguageCityCombos, LANGUAGE_LABELS } from "@/lib/language-filter";
import { SERVICE_LABELS } from "@/lib/service-labels";
import { getServiceEditorial } from "@/lib/service-editorial-content";
import { ConsultantCard } from "@/components/consultant/consultant-card";
import { ServiceFilterPills } from "@/components/city/service-filter-pills";

export async function generateStaticParams() {
  const combos = await getAllCityServiceCombos();
  return combos.map((c) => ({ city: c.city, serviceSlug: c.serviceUrlSlug }));
}

export const revalidate = 3600;

type Props = { params: { city: string; serviceSlug: string } };

function stripConsultantsSuffix(s: string): string | null {
  return s.endsWith("-consultants") ? s.slice(0, -"-consultants".length) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, serviceSlug } = params;
  const actualServiceSlug = stripConsultantsSuffix(serviceSlug);
  if (!actualServiceSlug) return { title: "Page not found" };

  const [cityRow, service] = await Promise.all([
    getCity(city),
    getService(actualServiceSlug),
  ]);
  if (!cityRow || !service) return { title: "Page not found" };

  const title =
    substituteCity(service.seo_title, cityRow.name) ||
    `${service.name} consultants in ${cityRow.name}`;
  const defaultDescription =
    substituteCity(service.seo_description, cityRow.name) ||
    `Find verified RCIC consultants for ${service.name} in ${cityRow.name}, Alberta.`;
  const editorial = getServiceEditorial(city, actualServiceSlug);
  const description = editorial
    ? editorial.metaDescription
    : defaultDescription;

  return {
    title,
    description,
    alternates: { canonical: canonical(`/${city}/${serviceSlug}`) },
  };
}

export default async function CityServicePage({ params }: Props) {
  const { city, serviceSlug } = params;
  const actualServiceSlug = stripConsultantsSuffix(serviceSlug);
  if (!actualServiceSlug) notFound();

  const [cityRow, service, services] = await Promise.all([
    getCity(city),
    getService(actualServiceSlug),
    getFilterableServices(),
  ]);
  if (!cityRow || !service) notFound();

  const filtered = await getConsultantsByCityAndService(city, actualServiceSlug);
  const isEmpty = filtered.consultants.length === 0;
  const cityFallback = isEmpty ? await getConsultantsByCity(city) : null;
  const shown = cityFallback ?? filtered;
  const languageCombos = await getLanguageCityCombos();

  const editorial = getServiceEditorial(city, actualServiceSlug);

  const listToShow = shown.consultants;

  const otherServices = Object.keys(SERVICE_LABELS).filter(
    (s) => s !== actualServiceSlug,
  );
  const cityLanguages = languageCombos
    .filter((c) => c.city_slug === city)
    .sort((a, b) => b.consultant_count - a.consultant_count)
    .slice(0, 4);

  return (
    <main className="pb-12">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            Alberta · {cityRow.name} · {service.short_label ?? service.name}
          </div>
          <h1 className="text-2xl font-medium text-stone-900 md:text-3xl">
            {service.name} consultants in {cityRow.name}
          </h1>
          {!isEmpty && (
            <p className="mt-2 text-sm text-stone-600">
              {listToShow.length} consultant{listToShow.length === 1 ? "" : "s"} · all
              manually verified against the CICC public registry.
            </p>
          )}
        </div>

        {editorial && (
          <section className="mb-8 text-[14px] leading-relaxed text-stone-700">
            <p>{editorial.intro}</p>
          </section>
        )}

        <ServiceFilterPills
          citySlug={city}
          services={services}
          activeServiceSlug={actualServiceSlug}
        />

        {isEmpty && listToShow.length > 0 && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            No consultants in {cityRow.name} are tagged with{" "}
            <strong className="font-medium">
              {service.short_label ?? service.name}
            </strong>{" "}
            yet. Here is the full list of {listToShow.length} verified
            consultants in {cityRow.name}:
          </div>
        )}

        {listToShow.length === 0 ? (
          <p className="text-sm text-stone-500">
            No consultants listed yet for this city.
          </p>
        ) : (
          <div className="space-y-3">
            {listToShow.map((c) => (
              <ConsultantCard
                key={c.id}
                consultant={c}
                secondaryNote={
                  shown.secondaryIds.has(c.id)
                    ? (shown.primaryCityNames[c.primary_city_slug ?? ""] ??
                      c.primary_city_slug ??
                      undefined)
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {editorial && (
          <>
            <section className="mt-10 border-t border-stone-200 pt-8">
              <h2 className="mb-3 text-[18px] font-medium text-stone-900">
                What to look for in a {service.name} consultant
              </h2>
              <p className="text-[14px] leading-relaxed text-stone-700">
                {editorial.whatToLookFor}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="mb-3 text-[18px] font-medium text-stone-900">
                {service.name} in {cityRow.name}
              </h2>
              <p className="text-[14px] leading-relaxed text-stone-700">
                {editorial.cityContext}
              </p>
            </section>

            {editorial.faqs.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-[18px] font-medium text-stone-900">
                  Common questions
                </h2>
                <dl className="space-y-4">
                  {editorial.faqs.map((faq) => (
                    <div key={faq.question}>
                      <dt className="mb-1 text-[14px] font-medium text-stone-900">
                        {faq.question}
                      </dt>
                      <dd className="text-[14px] leading-relaxed text-stone-700">
                        {faq.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: editorial.faqs.map((faq) => ({
                        "@type": "Question",
                        name: faq.question,
                        acceptedAnswer: { "@type": "Answer", text: faq.answer },
                      })),
                    }).replace(/</g, "\\u003c"),
                  }}
                />
              </section>
            )}
          </>
        )}

        <section className="mt-10 border-t border-stone-200 pt-8">
          <h2 className="mb-4 text-[16px] font-medium text-stone-900">
            Related searches
          </h2>

          <div className="mb-5">
            <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wider text-stone-500">
              Other services in {cityRow.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherServices.map((s) => (
                <Link
                  key={s}
                  href={`/${city}/${s}-consultants`}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                >
                  {SERVICE_LABELS[s]}
                </Link>
              ))}
            </div>
          </div>

          {cityLanguages.length > 0 && (
            <div>
              <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wider text-stone-500">
                By language in {cityRow.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cityLanguages.map((cl) => (
                  <Link
                    key={cl.lang_code}
                    href={`/${city}/by-language/${cl.lang_code}`}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
                  >
                    {LANGUAGE_LABELS[cl.lang_code]}-speaking (
                    {cl.consultant_count})
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wider text-stone-500">
              Not sure if you need a lawyer?
            </h3>
            <Link
              href="/alberta-immigration-lawyers"
              className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
            >
              Immigration lawyers in Alberta →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
