import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConsultantWithBusinesses } from "@/types/database";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function cityLabel(slug: string): string {
  if (slug === "red-deer") return "Red Deer";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function ConsultantHeader({
  consultant,
}: {
  consultant: ConsultantWithBusinesses;
}) {
  const primaryBiz =
    consultant.businesses.find((b) => b.is_primary) ??
    consultant.businesses[0];
  const city = primaryBiz?.city_slug ?? consultant.primary_city_slug ?? null;

  return (
    <div>
      {city && (
        <nav className="mb-5 text-xs text-stone-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-stone-700">
            Alberta
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={`/${city}`} className="hover:text-stone-700">
            {cityLabel(city)}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-stone-700">{consultant.full_name}</span>
        </nav>
      )}
      <div className="flex items-start gap-4">
        <div
          className="flex shrink-0 items-center justify-center rounded-full bg-slate-800 text-[15px] font-medium tracking-wide text-white"
          style={{ height: "52px", width: "52px" }}
          aria-hidden="true"
        >
          {getInitials(consultant.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-medium leading-tight text-stone-900">
              {consultant.full_name}
            </h1>
            <Badge
              variant="secondary"
              className="gap-1 border-0 bg-emerald-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white hover:bg-emerald-700"
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              RCIC verified
            </Badge>
          </div>
          {primaryBiz && (
            <p className="text-sm text-stone-600">
              {primaryBiz.role_label ?? "Consultant"} at{" "}
              <span className="text-slate-800">
                {primaryBiz.display_name ?? primaryBiz.legal_name}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
