import type { Metadata } from "next";
import {
  Briefcase,
  CircleHelp,
  Globe,
  GraduationCap,
  Plane,
  Scale,
  Stamp,
  Users,
} from "lucide-react";
import { DecisionToolShell } from "@/components/decision-tool/decision-tool-shell";
import { CaseTile } from "@/components/decision-tool/case-tile";

export const metadata: Metadata = {
  title: "Find a verified immigration consultant · ImmigrateAlberta",
  description:
    "Answer two quick questions and see the verified RCIC consultants in Alberta who match your case.",
  alternates: { canonical: "/decision-tool" },
};

const tiles = [
  { slug: "pr-express-entry",   icon: Stamp,        label: "PR or Express Entry" },
  { slug: "provincial-nominee", icon: Globe,        label: "Provincial Nominee (AAIP)" },
  { slug: "study-permit",       icon: GraduationCap, label: "Study permit" },
  { slug: "work-permit-lmia",   icon: Briefcase,    label: "Work permit or LMIA" },
  { slug: "family-sponsorship", icon: Users,        label: "Family sponsorship" },
  { slug: "visitor-super-visa", icon: Plane,        label: "Visitor or Super Visa" },
  { slug: "citizenship",        icon: Stamp,        label: "Citizenship" },
  { slug: "refugee-irb",        icon: Scale,        label: "Refugee or IRB matter" },
  { slug: "unsure",             icon: CircleHelp,   label: "I'm not sure yet" },
];

export default function CaseTypePage() {
  return (
    <DecisionToolShell
      stepNumber={1}
      stepLabel="Case type"
      question="What kind of immigration case do you have?"
      backHref={null}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tiles.map((t) => (
          <CaseTile
            key={t.slug}
            href={`/decision-tool/city?case=${t.slug}`}
            icon={t.icon}
            label={t.label}
          />
        ))}
      </div>
      <p className="mt-8 text-center text-[12px] text-stone-500">
        Next: which city you&apos;d like to work with a consultant in.
      </p>
    </DecisionToolShell>
  );
}
