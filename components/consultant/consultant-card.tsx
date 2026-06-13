import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConsultantCardData } from "@/types/database";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

export function ConsultantCard({
  consultant,
  secondaryNote,
}: {
  consultant: ConsultantCardData;
  secondaryNote?: string;
}) {
  const biz = consultant.primary_business;
  return (
    <Link href={`/consultant/${consultant.slug}`} className="block">
      <Card className="p-4 transition-colors hover:bg-stone-50 md:p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-900"
            aria-hidden="true"
          >
            {getInitials(consultant.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-medium text-stone-900">
                {consultant.full_name}
              </span>
              <Badge
                variant="secondary"
                className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900 hover:bg-emerald-50"
              >
                <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" />
                RCIC
              </Badge>
            </div>
            <div className="text-xs text-stone-500">
              <span className="font-mono">{consultant.rcic_number}</span>
              {biz && <> · {biz.display_name ?? biz.legal_name}</>}
            </div>
            {secondaryNote ? (
              <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                Secondary office — primary practice in {secondaryNote}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
