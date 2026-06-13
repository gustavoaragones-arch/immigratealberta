import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getNavCities } from "@/lib/nav-cities";
import { DecisionToolShell } from "@/components/decision-tool/decision-tool-shell";
import { CaseTile } from "@/components/decision-tool/case-tile";

export const metadata: Metadata = {
  title: "Which city? · ImmigrateAlberta",
  alternates: { canonical: "/decision-tool/city" },
  robots: { index: false, follow: false },
};

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

type Props = {
  searchParams: { case?: string };
};

export default async function CityPage({ searchParams }: Props) {
  const caseSlug = searchParams.case;

  if (!caseSlug || !VALID_CASES.has(caseSlug)) {
    redirect("/decision-tool");
  }

  const dbCities = await getNavCities();
  const cities = [
    ...dbCities.map((c) => ({ slug: c.slug, label: c.name })),
    { slug: "any", label: "Any city in Alberta" },
  ];

  return (
    <DecisionToolShell
      stepNumber={2}
      stepLabel="City"
      question="Which city would you like a consultant in?"
      backHref="/decision-tool"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cities.map((c) => (
          <CaseTile
            key={c.slug}
            href={`/decision-tool/results?case=${caseSlug}&city=${c.slug}`}
            icon={MapPin}
            label={c.label}
          />
        ))}
      </div>
      <p className="mt-8 text-center text-[12px] text-stone-500">
        Not sure? Pick &ldquo;Any city in Alberta&rdquo; — we&apos;ll show
        matches across the province.
      </p>
    </DecisionToolShell>
  );
}
