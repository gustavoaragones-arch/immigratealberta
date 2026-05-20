import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCity,
  getService,
  getConsultantsByCity,
  getConsultantsByCityAndService,
  getFilterableServices,
  getAllCityServiceCombos,
} from "@/lib/queries";
import { substituteCity } from "@/lib/seo";
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
  const description =
    substituteCity(service.seo_description, cityRow.name) ||
    `Find verified RCIC consultants for ${service.name} in ${cityRow.name}, Alberta.`;

  return {
    title,
    description,
    alternates: { canonical: `/${city}/${serviceSlug}` },
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
  const fallback =
    filtered.length === 0 ? await getConsultantsByCity(city) : [];

  const isEmpty = filtered.length === 0;
  const listToShow = isEmpty ? fallback : filtered;

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
              {filtered.length} consultant{filtered.length === 1 ? "" : "s"} · all
              manually verified against the CICC public registry.
            </p>
          )}
        </div>

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
              <ConsultantCard key={c.id} consultant={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
