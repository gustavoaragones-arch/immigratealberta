import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · ImmigrateAlberta",
  description:
    "ImmigrateAlberta is an independent directory of verified Regulated Canadian Immigration Consultants in Alberta, operated by Albor Digital.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="mb-6 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          About
        </div>
        <h1 className="mb-6 text-2xl font-medium text-stone-900 md:text-3xl">
          About ImmigrateAlberta
        </h1>

        <div className="space-y-5 text-[15px] leading-relaxed text-stone-700">
          <p>
            ImmigrateAlberta is an independent directory of Regulated Canadian
            Immigration Consultants (RCICs) practicing in Alberta. Every
            consultant listed here has been manually verified against the public
            registry of the{" "}
            <a
              href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
            >
              College of Immigration and Citizenship Consultants
            </a>{" "}
            (CICC).
          </p>

          <p>
            The directory exists because finding a trustworthy immigration
            consultant in Canada is harder than it should be. Search results are
            dominated by paid listings. Reviews are gamed. Some sites list people
            who aren&apos;t licensed to give immigration advice in Canada at all.
            We built ImmigrateAlberta to make the licensed, registered, real
            practitioners easier to find — and easier to verify yourself.
          </p>

          <div className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Operated by
            </div>
            <p className="mb-1 text-[15px] font-medium text-stone-900">
              Albor Digital
            </p>
            <p className="text-[13px] leading-relaxed text-stone-600">
              An Alberta-based independent digital studio specializing in
              website development, search engine optimization, digital product
              development, graphic design, and business software solutions.
              Albor Digital designs, develops, and operates online platforms,
              B2B software applications, directories, calculators, information
              resources, and micro-SaaS products serving Canadian and
              international users.
            </p>
            <p className="mt-3 text-[12px] text-stone-500">
              Registered trade name · Alberta, Canada · Sole proprietorship
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              How we make money
            </h2>
            <p>
              Free to users, always. We don&apos;t charge anyone to look up a
              consultant and we don&apos;t sell user data. In the future,
              consultants may be able to pay for premium placement features (such
              as featured listings or verification badges) — those will always be
              clearly labelled and will never affect whether a consultant appears
              in the directory.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              Not affiliated with the Government of Canada
            </h2>
            <p>
              ImmigrateAlberta is an independent commercial directory. We are
              not affiliated with Immigration, Refugees and Citizenship Canada
              (IRCC), the College of Immigration and Citizenship Consultants
              (CICC), the Government of Canada, the Government of Alberta, or
              any immigration consultant or law firm listed on the site.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              How we verify consultants
            </h2>
            <p>
              Every consultant in the directory is manually cross-referenced
              with the CICC public registry. We record the date of each
              verification. If a consultant&apos;s status changes (Suspended,
              Revoked, or Inactive), their listing is updated or removed. You
              can always verify any listed consultant yourself by clicking the
              CICC link on their profile.{" "}
              <Link
                href="/how-we-verify"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                Read more about our verification process →
              </Link>
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              Contact
            </h2>
            <p>
              Questions, corrections, or concerns:{" "}
              <a
                href="mailto:contact@immigratealberta.ca"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                contact@immigratealberta.ca
              </a>
              {/* TODO: confirm preferred contact email before launch */}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
