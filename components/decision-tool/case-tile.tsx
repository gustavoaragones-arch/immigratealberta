import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export function CaseTile({ href, icon: Icon, label }: Props) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-4 text-sm text-stone-900 transition-all hover:-translate-y-px hover:border-stone-400 hover:shadow-sm"
    >
      <Icon
        className="h-5 w-5 shrink-0 text-stone-500 transition-colors group-hover:text-stone-700"
        aria-hidden="true"
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
