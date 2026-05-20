import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getConsultantBySlug,
  getAllConsultantSlugs,
} from "@/lib/queries";
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
      url: `https://immigratealberta.ca/consultant/${slug}`,
    },
    twitter: { card: "summary", title, description },
    alternates: { canonical: `/consultant/${slug}` },
  };
}

export default async function ConsultantPage({ params }: Props) {
  const { slug } = params;
  const consultant = await getConsultantBySlug(slug);
  if (!consultant) notFound();

  return (
    <main className="pb-32 md:pb-12">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <ConsultantHeader consultant={consultant} />
        <div className="mt-8 space-y-8">
          <ConsultantTrustPanel consultant={consultant} />
          <ConsultantServices consultant={consultant} />
          <ConsultantOffices consultant={consultant} />
        </div>
      </div>
      <ConsultantContactSticky consultant={consultant} />
    </main>
  );
}
