import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800"
            aria-hidden="true"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-[15px] font-medium tracking-tight text-stone-900">
            ImmigrateAlberta
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-[13px] text-stone-600 sm:gap-6">
          <Link
            href="/calgary"
            className="transition-colors hover:text-stone-900"
          >
            Calgary
          </Link>
          <Link
            href="/edmonton"
            className="transition-colors hover:text-stone-900"
          >
            Edmonton
          </Link>
          <Link
            href="/red-deer"
            className="hidden transition-colors hover:text-stone-900 sm:inline"
          >
            Red Deer
          </Link>
          <Link
            href="/lethbridge"
            className="hidden transition-colors hover:text-stone-900 lg:inline"
          >
            Lethbridge
          </Link>
          <Link
            href="/cochrane"
            className="hidden transition-colors hover:text-stone-900 xl:inline"
          >
            Cochrane
          </Link>
          <Link
            href="/how-we-verify"
            className="hidden transition-colors hover:text-stone-900 md:inline"
          >
            How we verify
          </Link>
        </nav>
      </div>
    </header>
  );
}
