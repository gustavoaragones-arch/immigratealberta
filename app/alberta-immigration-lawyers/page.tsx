import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Immigration lawyers in Alberta · ImmigrateAlberta",
  description:
    "Understand when to hire an immigration lawyer instead of a consultant in Alberta, and find Lexpert-ranked Alberta immigration lawyers. ImmigrateAlberta covers RCICs only — this page is informational.",
  alternates: { canonical: "/alberta-immigration-lawyers" },
};

const LEXPERT_LAWYERS = [
  {
    name: "Michael A.E. Greene",
    firm: "Sherritt Greene",
    city: "Calgary",
    recognition: "Most Frequently Recommended",
    yearCalled: 1984,
  },
  {
    name: "Nathan A. Po",
    firm: "McCuaig Desrochers LLP",
    city: "Edmonton",
    recognition: "Most Frequently Recommended",
    yearCalled: 2007,
  },
  {
    name: "Mark Holthe",
    firm: "Holthe Immigration Law",
    city: "Lethbridge",
    recognition: "Most Frequently Recommended",
    yearCalled: 2005,
  },
  {
    name: "Vance Langford",
    firm: "Langford Law",
    city: "Calgary",
    recognition: "Repeatedly Recommended",
    yearCalled: 2000,
  },
  {
    name: "Roxanne Israel",
    firm: "EY Law LLP",
    city: "Calgary",
    recognition: "Repeatedly Recommended",
    yearCalled: 2003,
  },
  {
    name: "Kevin L. Zemp",
    firm: "Zemp Law Group",
    city: "Calgary",
    recognition: "Consistently Recommended",
    yearCalled: 1994,
  },
];

export default function AlbertaImmigrationLawyersPage() {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Information
        </div>
        <h1 className="mb-4 text-2xl font-medium text-stone-900 md:text-3xl">
          Immigration lawyers in Alberta
        </h1>
        <p className="mb-8 text-[15px] leading-relaxed text-stone-600">
          ImmigrateAlberta.ca is a directory of Regulated Canadian Immigration
          Consultants (RCICs). Immigration lawyers are a separate, parallel
          profession we don&apos;t list. This page explains when a lawyer is
          the right choice, names Alberta immigration lawyers recognized by
          Lexpert, and points to the official Law Society of Alberta
          directory.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 text-[18px] font-medium text-stone-900">
            Lawyer or consultant?
          </h2>
          <p className="mb-3 text-[14px] leading-relaxed text-stone-700">
            Under the Immigration and Refugee Protection Act (IRPA), three
            categories of professionals are legally authorized to represent
            or advise on Canadian immigration matters for compensation:
          </p>
          <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-stone-700 marker:text-stone-400">
            <li>
              <strong className="font-medium text-stone-900">
                Regulated Canadian Immigration Consultants (RCICs)
              </strong>{" "}
              — licensed by the College of Immigration and Citizenship
              Consultants (CICC), the federal regulator. RCICs handle the
              majority of immigration applications.
            </li>
            <li>
              <strong className="font-medium text-stone-900">Lawyers</strong>{" "}
              (and Quebec notaries) — members in good standing of their
              provincial or territorial law society. In Alberta, that&apos;s
              the Law Society of Alberta.
            </li>
            <li>
              <strong className="font-medium text-stone-900">
                Regulated International Student Immigration Advisors (RISIAs)
              </strong>{" "}
              — authorized only for international student matters.
            </li>
          </ul>
          <p className="text-[14px] leading-relaxed text-stone-700">
            Both lawyers and RCICs can handle most immigration applications.
            The choice usually comes down to case complexity and the type of
            proceeding involved.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-[18px] font-medium text-stone-900">
            When a lawyer is usually the right choice
          </h2>
          <p className="mb-3 text-[14px] leading-relaxed text-stone-700">
            Most straightforward cases — work permits, study permits, family
            sponsorships, Express Entry, AAIP — can be handled effectively by
            an RCIC. A lawyer is more often the right choice when:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-stone-700 marker:text-stone-400">
            <li>
              You&apos;re seeking{" "}
              <strong className="font-medium text-stone-900">
                judicial review
              </strong>{" "}
              of an IRCC or IRB decision at the Federal Court
            </li>
            <li>
              You have an{" "}
              <strong className="font-medium text-stone-900">
                inadmissibility issue
              </strong>{" "}
              involving criminal history, misrepresentation findings, or
              security concerns
            </li>
            <li>
              You&apos;re appealing a deportation order, sponsorship refusal,
              or residency obligation finding at the{" "}
              <strong className="font-medium text-stone-900">
                Immigration Appeal Division (IAD)
              </strong>
            </li>
            <li>
              Your case overlaps with{" "}
              <strong className="font-medium text-stone-900">
                criminal law
              </strong>{" "}
              and you need representation in both contexts
            </li>
            <li>
              You need legal opinions for complex business immigration —
              intra-company transfers, investor programs, or corporate
              restructuring with immigration implications
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-[18px] font-medium text-stone-900">
            Alberta immigration lawyers recognized by Lexpert
          </h2>
          <p className="mb-5 text-[14px] leading-relaxed text-stone-700">
            The following lawyers are ranked in{" "}
            <a
              href="https://www.lexpert.ca/rankings/best-lawyer/dir/immigration-law/alberta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-700 underline underline-offset-2 hover:text-stone-900"
            >
              Lexpert&apos;s current Alberta immigration directory
            </a>
            , a peer-reviewed legal directory. ImmigrateAlberta does not
            endorse or verify individual lawyers — this is a summary of
            Lexpert&apos;s published rankings as of{" "}
            {new Date().toLocaleString("en-CA", {
              month: "long",
              year: "numeric",
            })}
            .
          </p>
          <div className="space-y-3">
            {LEXPERT_LAWYERS.map((l) => (
              <div
                key={l.name}
                className="rounded-lg border border-stone-300 bg-white p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Scale
                    className="h-4 w-4 text-stone-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-[15px] font-semibold text-stone-900">
                    {l.name}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-stone-600">
                  {l.firm} · {l.city}, Alberta
                </p>
                <p className="text-[12px] leading-relaxed text-stone-500">
                  Lexpert: {l.recognition} · Called to the bar in{" "}
                  {l.yearCalled}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-[18px] font-medium text-stone-900">
            The Law Society of Alberta&apos;s complete directory
          </h2>
          <p className="mb-3 text-[14px] leading-relaxed text-stone-700">
            For a complete, regulator-maintained list of every lawyer
            practicing in Alberta — including all immigration lawyers, not
            just those ranked by Lexpert — use the Law Society of
            Alberta&apos;s Find a Lawyer tool. It allows search by name,
            location, practice area, and language. The Law Society does not
            endorse individual lawyers; it provides the contact information
            and lets you choose.
          </p>
          <a
            href="https://www.lawsociety.ab.ca/public/findalawyer/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-slate-900"
          >
            Search the Law Society of Alberta directory
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </section>

        <div className="rounded-lg border-l-2 border-slate-700 bg-stone-100 px-5 py-4">
          <p className="mb-2 text-[13px] leading-relaxed text-stone-700">
            <strong className="font-medium text-stone-900">
              Why ImmigrateAlberta only lists RCICs:
            </strong>{" "}
            our verification process is built around the CICC public
            registry. Lawyers are regulated separately and verified by the
            Law Society of Alberta. Maintaining two verification systems
            against two different regulators would weaken the trust signal
            that our single-track focus provides.
          </p>
          <p className="text-[13px] leading-relaxed text-stone-700">
            If your case fits the RCIC scope (most do), see our{" "}
            <Link
              href="/decision-tool"
              className="text-stone-700 underline underline-offset-2 hover:text-stone-900"
            >
              decision tool
            </Link>{" "}
            or{" "}
            <Link
              href="/calgary"
              className="text-stone-700 underline underline-offset-2 hover:text-stone-900"
            >
              browse verified consultants by city
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
