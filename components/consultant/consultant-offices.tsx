import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ConsultantWithBusinesses } from "@/types/database";

type Biz = ConsultantWithBusinesses["businesses"][number];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

function OfficeCard({ biz }: { biz: Biz }) {
  let host = "";
  if (biz.website) {
    try {
      host = new URL(biz.website).host.replace(/^www\./, "");
    } catch {
      host = biz.website;
    }
  }
  const telHref = biz.phone ? `tel:${biz.phone.replace(/\D/g, "")}` : "";
  return (
    <Card className="p-4 md:p-5">
      <div className="mb-1.5 text-[15px] font-medium text-stone-900">
        {biz.display_name ?? biz.legal_name}
        {biz.is_primary && (
          <span className="ml-2 text-[11px] font-normal uppercase tracking-wider text-stone-500">
            Primary
          </span>
        )}
      </div>
      {biz.address && (
        <div className="mb-2.5 flex items-start gap-1.5 text-sm text-stone-600">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-stone-400"
            aria-hidden="true"
          />
          <span>{biz.address}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {biz.phone && (
          <a
            href={telHref}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {formatPhone(biz.phone)}
          </a>
        )}
        {biz.website && (
          <a
            href={biz.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            {host}
          </a>
        )}
        {biz.email && (
          <a
            href={`mailto:${biz.email}`}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email
          </a>
        )}
      </div>
      {biz.website ? (
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
          The website link points to a third-party site we don&apos;t control.
          We can&apos;t guarantee its uptime, security, or current accuracy.
        </p>
      ) : null}
    </Card>
  );
}

export function ConsultantOffices({
  consultant,
}: {
  consultant: ConsultantWithBusinesses;
}) {
  if (consultant.businesses.length === 0) return null;
  const firstName =
    consultant.given_name ?? consultant.full_name.trim().split(/\s+/)[0] ?? "";
  return (
    <section>
      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
        Where to reach {firstName}
      </div>
      <div className="space-y-3">
        {consultant.businesses.map((biz) => (
          <OfficeCard key={biz.id} biz={biz} />
        ))}
      </div>
    </section>
  );
}
