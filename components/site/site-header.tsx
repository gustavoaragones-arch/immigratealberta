import Link from "next/link";
import type { NavCity } from "@/lib/nav-cities";
import { SiteLogo } from "@/components/site/site-logo";

type Props = {
  cities: NavCity[];
};

export function SiteHeader({ cities }: Props) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3.5">
        <SiteLogo className="shrink-0" />
        <nav className="flex min-w-0 max-w-[58%] items-center justify-end gap-2.5 overflow-x-auto text-[11px] text-stone-600 [scrollbar-width:none] sm:max-w-none sm:gap-6 sm:text-[13px] [&::-webkit-scrollbar]:hidden">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="shrink-0 whitespace-nowrap transition-colors hover:text-stone-900"
            >
              {city.name}
            </Link>
          ))}
          <Link
            href="/how-we-verify"
            className="hidden shrink-0 whitespace-nowrap transition-colors hover:text-stone-900 md:inline"
          >
            How we verify
          </Link>
        </nav>
      </div>
    </header>
  );
}
