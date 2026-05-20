import { ExternalLink, Phone } from "lucide-react";
import type { ConsultantWithBusinesses } from "@/types/database";

export function ConsultantContactSticky({
  consultant,
}: {
  consultant: ConsultantWithBusinesses;
}) {
  const primary =
    consultant.businesses.find((b) => b.is_primary) ??
    consultant.businesses[0];
  if (!primary) return null;
  const phone = primary.phone;
  const website = primary.website;
  if (!phone && !website) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-3xl gap-2">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-800 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Website
          </a>
        )}
      </div>
    </div>
  );
}
