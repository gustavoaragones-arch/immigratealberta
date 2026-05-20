import Link from "next/link";
import type { Service } from "@/types/database";

type Props = {
  citySlug: string;
  services: Service[];
  activeServiceSlug: string | null;
};

export function ServiceFilterPills({
  citySlug,
  services,
  activeServiceSlug,
}: Props) {
  return (
    <div
      className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      role="navigation"
      aria-label="Filter by service"
    >
      <FilterPill
        href={`/${citySlug}`}
        label="All services"
        active={activeServiceSlug === null}
      />
      {services.map((s) => (
        <FilterPill
          key={s.slug}
          href={`/${citySlug}/${s.slug}-consultants`}
          label={s.short_label ?? s.name}
          active={activeServiceSlug === s.slug}
        />
      ))}
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const base =
    "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors";
  const styles = active
    ? "border-slate-800 bg-slate-800 text-white"
    : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {label}
    </Link>
  );
}
