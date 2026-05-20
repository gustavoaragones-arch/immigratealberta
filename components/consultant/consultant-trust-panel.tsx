import {
  BadgeCheck,
  CalendarCheck,
  ExternalLink,
  IdCard,
  Languages,
  ScrollText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ConsultantWithBusinesses } from "@/types/database";

const CICC_REGISTRY_URL =
  "https://college-ic.ca/protecting-the-public/find-an-immigration-consultant";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 text-stone-600">
        <span className="text-stone-500">{icon}</span>
        {label}
      </span>
      <span className="text-right text-stone-900">{children}</span>
    </div>
  );
}

export function ConsultantTrustPanel({
  consultant,
}: {
  consultant: ConsultantWithBusinesses;
}) {
  const languageNames =
    consultant.languages.length > 0
      ? consultant.languages.map((l) => l.name_en).join(", ")
      : "English";
  const statusColor =
    consultant.cicc_status === "Active" ? "text-emerald-700" : "text-amber-700";

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
        Verification
      </div>
      <div className="space-y-0.5">
        <Row icon={<IdCard className="h-4 w-4" />} label="RCIC Number">
          <span className="font-mono text-[13px]">{consultant.rcic_number}</span>
        </Row>
        <Row icon={<ScrollText className="h-4 w-4" />} label="Licence Type">
          {consultant.licence_type}
        </Row>
        <Row icon={<BadgeCheck className="h-4 w-4" />} label="CICC Status">
          <>
            <span className={`${statusColor} font-medium`}>
              {consultant.cicc_status}
            </span>
            <span className="text-stone-600"> on the public registry</span>
          </>
        </Row>
        <Row icon={<CalendarCheck className="h-4 w-4" />} label="Last verified">
          {formatDate(consultant.cicc_verified_on)}
        </Row>
        <Row icon={<Languages className="h-4 w-4" />} label="Languages">
          {languageNames}
        </Row>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        <p className="text-xs leading-relaxed text-stone-500">
          We manually verify every consultant against the{" "}
          <a
            href={CICC_REGISTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            CICC public registry
          </a>
          .
        </p>
        <a
          href={CICC_REGISTRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-50 px-2.5 py-1 text-[12px] font-medium text-slate-700 transition-colors hover:border-stone-400 hover:bg-stone-100"
        >
          Verify {consultant.rcic_number} yourself on CICC
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-xs text-stone-500 hover:text-stone-700">
          <span className="underline underline-offset-2">
            What do RCIC - L1, L2, and L3 mean?
          </span>
          <span className="ml-1 inline-block transition-transform group-open:rotate-90">
            ›
          </span>
        </summary>
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-stone-600">
          <p>
            When you click through to the CICC public registry, you&apos;ll see
            one of three licence classes next to the RCIC number. They differ
            by what kinds of cases the consultant can handle.
          </p>
          <dl className="space-y-1.5">
            <div>
              <dt className="inline font-medium text-stone-800">
                RCIC - L1 · Conditional Practice.
              </dt>
              <dd className="inline">
                {" "}
                A newly licensed consultant who has not yet completed the CICC
                mentoring program (required within their first 12 months). Same
                scope as L2 in practice, but considered conditional during the
                mentoring period.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-stone-800">
                RCIC - L2 · Restricted Practice.
              </dt>
              <dd className="inline">
                {" "}
                Full immigration scope — visas, work and study permits,
                permanent residence, family sponsorship, citizenship. Cannot
                represent clients before the Immigration and Refugee Board
                (IRB), so they cannot handle refugee claims, removal appeals, or
                sponsorship appeals.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-stone-800">
                RCIC-IRB - L3 · Unrestricted Practice.
              </dt>
              <dd className="inline">
                {" "}
                Full scope of L2 plus authorization to represent clients before
                the Immigration and Refugee Board. Required for refugee claims,
                removal appeals, sponsorship appeals, and detention reviews. As
                of July 1, 2023, only L3 holders may practise before the IRB.
              </dd>
            </div>
          </dl>
          <p className="text-stone-500">
            Source:{" "}
            <a
              href={CICC_REGISTRY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-stone-700"
            >
              College of Immigration and Citizenship Consultants (CICC)
            </a>
            .
          </p>
        </div>
      </details>
    </Card>
  );
}
