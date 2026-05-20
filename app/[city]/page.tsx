import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCity,
  getConsultantsByCity,
  getAllCitySlugs,
  getFilterableServices,
} from "@/lib/queries";
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
    alternates: { canonical: `/${city}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const [consultants, services] = await Promise.all([
    getConsultantsByCity(city),
    getFilterableServices(),
  ]);

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
              <ConsultantCard key={c.id} consultant={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
