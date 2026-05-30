import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · ImmigrateAlberta",
  description:
    "Privacy Policy for ImmigrateAlberta, operated by Albor Digital. How we collect, use, and protect information in compliance with Canada's PIPEDA.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "May 29, 2026";

export default function PrivacyPage() {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="mb-6 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Legal
        </div>
        <h1 className="mb-3 text-2xl font-medium text-stone-900 md:text-3xl">
          Privacy Policy
        </h1>
        <p className="mb-6 text-[13px] text-stone-500">Version 0.1 · Last updated {LAST_UPDATED}</p>

        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900">
          <strong className="font-medium">Working draft (v0.1).</strong> This
          document is being finalized and is subject to revision pending legal
          review. Last updated: {LAST_UPDATED}.
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-stone-700">

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              1. Who we are
            </h2>
            <p>
              ImmigrateAlberta is an independent online directory of Regulated
              Canadian Immigration Consultants (RCICs) in Alberta. The site is
              owned and operated by <strong className="font-medium">Albor Digital</strong>,
              a registered trade name in Alberta, Canada, operating as a sole
              proprietorship.
            </p>
            <p className="mt-3">
              Albor Digital is the data controller for any personal information
              collected through this site. You can reach us at{" "}
              <a
                href="mailto:hello@albordigital.ca"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                hello@albordigital.ca
              </a>
              .{/* TODO: confirm preferred privacy contact email */}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              2. What information we collect
            </h2>

            <p className="mb-3 font-medium text-stone-800">From visitors (current state, v0.1)</p>
            <p>
              At the time this policy was last updated,{" "}
              <strong className="font-medium">
                ImmigrateAlberta does not collect personal information from
                visitors
              </strong>{" "}
              beyond what is automatically recorded by web server and hosting
              infrastructure.
            </p>
            <p className="mt-3">
              Specifically, our hosting provider Vercel automatically logs
              standard server access data for every request, which may include
              your IP address, browser user agent string, the URL you requested,
              HTTP status code, and a timestamp. These logs are used for
              operational purposes (security, debugging, performance) and are not
              actively processed by Albor Digital to identify individuals.
              {/* TODO: confirm exact Vercel log retention period — typically 30 days for standard plans */}
            </p>
            <p className="mt-3">
              We do not currently run any first-party analytics tracking.
              {/* TODO: confirm — add Vercel Analytics or other provider here if/when added */}
            </p>

            <p className="mb-3 mt-6 font-medium text-stone-800">
              When you submit a contact or lead form (future feature)
            </p>
            <p>
              A consultant contact form is not yet live on this site. When it
              ships, it will collect your name, email address, phone number
              (optional), a brief message, and the immigration service category
              relevant to your inquiry. This policy will be updated before that
              feature launches to describe exactly how that data is processed and
              retained.
            </p>

            <p className="mb-3 mt-6 font-medium text-stone-800">
              Consultant information
            </p>
            <p>
              The directory lists names, RCIC registration numbers, business
              names, office addresses, and phone numbers of licensed immigration
              consultants. This information is sourced from the publicly
              accessible CICC public registry and publicly available business
              information.{" "}
              {/* TODO: confirm whether any data comes from Google Maps / Google Places API */}
              Under PIPEDA, professional information that individuals publish in
              the course of their professional duties is generally not treated
              as private personal information in the same way that private
              individual data is. Consultants who wish to request corrections or
              removal may contact us at{" "}
              <a
                href="mailto:hello@albordigital.ca"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                hello@albordigital.ca
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              3. How we use information
            </h2>
            <p>Server logs are used solely for:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Operating and securing the site</li>
              <li>Diagnosing technical errors</li>
              <li>Monitoring for abuse (e.g. automated scraping at scale)</li>
            </ul>
            <p className="mt-3">
              We do not use server logs to build profiles of individual
              visitors, serve targeted advertising, or sell to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              4. How we share information (or don&apos;t)
            </h2>
            <p>
              Albor Digital does not sell, rent, or trade personal information
              to any third party. Ever.
            </p>
            <p className="mt-3">
              Server log data passes through the infrastructure of our hosting
              provider (Vercel) and our database provider (Supabase) in the
              ordinary course of operating the site. Both operate under their
              own privacy policies and data processing agreements:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium">Vercel</strong> (hosting &amp;
                edge network) —{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  vercel.com/legal/privacy-policy
                </a>
              </li>
              <li>
                <strong className="font-medium">Supabase</strong> (database) —{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  supabase.com/privacy
                </a>
              </li>
              {/* TODO: add any other sub-processors (Resend for email, analytics provider, etc.) once confirmed */}
            </ul>
            <p className="mt-3">
              We may disclose information if required by Canadian law or a valid
              court order. We will notify affected parties where legally
              permitted to do so.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              5. Cookies and tracking
            </h2>
            <p>
              ImmigrateAlberta does not set any first-party cookies at this
              time.
            </p>
            <p className="mt-3">
              Our hosting provider Vercel may set a small number of
              infrastructure-related cookies or use browser storage for
              performance and security purposes (for example, to enable DDoS
              protection or edge caching). These are operational in nature and
              are not used for advertising or cross-site tracking.
              {/* TODO: verify whether Vercel sets any persistent cookies on the current plan/configuration */}
            </p>
            <p className="mt-3">
              We do not use Google Analytics, Facebook Pixel, or any other
              advertising or behavioral tracking technology.
              {/* TODO: update if analytics is added later */}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              6. Data retention
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium">Server logs</strong> (Vercel
                infrastructure): retained for approximately 30 days in
                accordance with Vercel&apos;s standard log retention policy.
                {/* TODO: confirm exact retention for your Vercel plan */}
              </li>
              <li>
                <strong className="font-medium">Consultant directory data</strong>:
                retained indefinitely for the purpose of operating the
                directory. Consultants may request removal by contacting{" "}
                <a
                  href="mailto:hello@albordigital.ca"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  hello@albordigital.ca
                </a>
                .
              </li>
              <li>
                <strong className="font-medium">Contact form submissions</strong>{" "}
                (when live): to be defined. This policy will be updated before
                that feature launches.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              7. Your rights under PIPEDA
            </h2>
            <p>
              Canada&apos;s Personal Information Protection and Electronic
              Documents Act (PIPEDA) gives you rights over personal information
              held by private-sector organizations in Canada. These include:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium">Right of access</strong> — You
                may request a description of the personal information we hold
                about you and how it is used.
              </li>
              <li>
                <strong className="font-medium">Right to correction</strong> —
                You may request corrections to inaccurate or incomplete
                information.
              </li>
              <li>
                <strong className="font-medium">
                  Withdrawal of consent
                </strong>{" "}
                — Where we rely on consent to process personal information, you
                may withdraw it at any time, subject to legal or contractual
                restrictions.
              </li>
              <li>
                <strong className="font-medium">
                  Right to complain
                </strong>{" "}
                — If you believe your privacy rights have been violated, you
                may file a complaint with the{" "}
                <a
                  href="https://www.priv.gc.ca/en/report-a-concern/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  Office of the Privacy Commissioner of Canada
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:hello@albordigital.ca"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                hello@albordigital.ca
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              8. Changes to this policy
            </h2>
            <p>
              We will update this policy when material changes occur — for
              example, when a contact form launches or an analytics provider is
              added. The &ldquo;Last updated&rdquo; date at the top of this page
              reflects the most recent revision. For significant changes, we
              will post a notice on the site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              9. Contact
            </h2>
            <p>
              Privacy inquiries, access requests, and correction requests:
            </p>
            <p className="mt-2">
              Albor Digital
              <br />
              Alberta, Canada
              <br />
              <a
                href="mailto:hello@albordigital.ca"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                hello@albordigital.ca
              </a>
              {/* TODO: add mailing address if required for PIPEDA compliance */}
            </p>
            <p className="mt-3">
              This policy is governed by and construed in accordance with the
              laws of the Province of Alberta and the federal laws of Canada
              applicable therein.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
