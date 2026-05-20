import { Badge } from "@/components/ui/badge";
import type { ConsultantWithBusinesses } from "@/types/database";

export function ConsultantServices({
  consultant,
}: {
  consultant: ConsultantWithBusinesses;
}) {
  if (consultant.services.length === 0) {
    return (
      <section>
        <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Services
        </div>
        <p className="text-sm italic text-stone-500">
          General immigration services. Contact the consultant for specific case
          types.
        </p>
      </section>
    );
  }
  return (
    <section>
      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
        Services offered
      </div>
      <div className="flex flex-wrap gap-2">
        {consultant.services.map((service) => (
          <Badge
            key={service.slug}
            variant="secondary"
            className="border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-100"
          >
            {service.name}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-xs italic text-stone-500">
        Services are self-reported by the firm. Confirm specific case details
        directly with the consultant.
      </p>
    </section>
  );
}
