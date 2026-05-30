import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · ImmigrateAlberta",
  description:
    "Terms of Service for ImmigrateAlberta, an independent RCIC directory operated by Albor Digital in Alberta, Canada.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "May 29, 2026";

export default function TermsPage() {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="mb-6 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Legal
        </div>
        <h1 className="mb-3 text-2xl font-medium text-stone-900 md:text-3xl">
          Terms of Service
        </h1>
        <p className="mb-6 text-[13px] text-stone-500">
          Version 0.1 · Last updated {LAST_UPDATED}
        </p>

        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900">
          <strong className="font-medium">Working draft (v0.1).</strong> This
          document is being finalized and is subject to revision pending legal
          review. Last updated: {LAST_UPDATED}.
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-stone-700">

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              1. Acceptance of terms
            </h2>
            <p>
              By accessing or using ImmigrateAlberta (the &ldquo;Site&rdquo;),
              you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree, please do not use the
              Site. These Terms apply to all visitors, users, and others who
              access or use the Site.
            </p>
            <p className="mt-3">
              The Site is owned and operated by{" "}
              <strong className="font-medium">Albor Digital</strong>, a
              registered trade name in Alberta, Canada, operating as a sole
              proprietorship (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              2. What this directory is (and isn&apos;t)
            </h2>
            <p>
              ImmigrateAlberta is an informational directory of Regulated
              Canadian Immigration Consultants (RCICs) licensed by the College
              of Immigration and Citizenship Consultants (CICC). The Site
              provides publicly available information about licensed
              practitioners to help users locate and contact them.
            </p>
            <p className="mt-3">
              ImmigrateAlberta is <strong className="font-medium">not</strong>:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>A law firm or immigration consultancy</li>
              <li>
                Licensed to provide legal advice, immigration advice, or
                regulated services of any kind
              </li>
              <li>
                Affiliated with, authorized by, or endorsed by IRCC, the CICC,
                the Government of Canada, or the Government of Alberta
              </li>
              <li>
                A party to any relationship between you and a listed consultant
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              3. No legal or immigration advice
            </h2>
            <p>
              Nothing on ImmigrateAlberta constitutes legal advice, immigration
              advice, or any other form of regulated professional advice.
              Information on the Site is provided for general informational
              purposes only. You should not rely on any content on the Site as a
              substitute for advice from a licensed professional.
            </p>
            <p className="mt-3">
              If you require immigration assistance, consult a licensed
              Regulated Canadian Immigration Consultant or a Canadian immigration
              lawyer. Verify their credentials directly on the{" "}
              <a
                href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                CICC public registry
              </a>{" "}
              before engaging their services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              4. Third-party content
            </h2>
            <p>
              Consultant profiles on ImmigrateAlberta are populated using
              information sourced from the CICC public registry and other
              publicly available business information. We make reasonable efforts
              to keep this information accurate and current, but we cannot
              guarantee that all information is complete, accurate, or
              up-to-date at any given moment.
            </p>
            <p className="mt-3">
              Listing on ImmigrateAlberta does{" "}
              <strong className="font-medium">not</strong> constitute
              endorsement, recommendation, or any warranty — express or implied
              — regarding a consultant&apos;s competence, fitness for purpose,
              conduct, or the quality of services they provide.
            </p>
            <p className="mt-3">
              We reserve the right to remove, suspend, or modify any listing at
              any time and for any reason, including if a consultant&apos;s CICC
              status changes to Suspended, Revoked, or Inactive.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              5. User conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Use automated tools to scrape, crawl, or bulk-download directory
                data at scale without our prior written permission
              </li>
              <li>
                Reproduce, republish, or redistribute directory content for
                commercial purposes without our prior written permission
              </li>
              <li>
                Attempt to interfere with, disrupt, or compromise the integrity
                or performance of the Site
              </li>
              <li>
                Use the Site to harass, impersonate, or harm any consultant or
                other person
              </li>
              <li>
                Submit false, misleading, or fraudulent information through any
                form or submission mechanism on the Site
              </li>
            </ul>
            <p className="mt-3">
              Fair use of individual consultant profile pages for personal
              reference — including saving, printing, or sharing single profiles
              — is permitted.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              6. Intellectual property
            </h2>
            <p>
              The ImmigrateAlberta name, logo, site design, editorial content,
              and the selection and arrangement of directory data are owned by
              Albor Digital and are protected under applicable Canadian copyright
              and intellectual property law. Consultant names, RCIC numbers, and
              business information are not owned by Albor Digital.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute, modify, create derivative works
              from, or commercially exploit the Site&apos;s original content
              without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              7. Disclaimers
            </h2>
            <p>
              The Site and all information on it are provided{" "}
              <strong className="font-medium">&ldquo;as is&rdquo;</strong> and{" "}
              <strong className="font-medium">&ldquo;as available&rdquo;</strong>{" "}
              without warranties of any kind, either express or implied,
              including but not limited to warranties of merchantability, fitness
              for a particular purpose, accuracy, or non-infringement.
            </p>
            <p className="mt-3">
              Albor Digital does not warrant that: (a) the Site will be
              uninterrupted or error-free; (b) any information on the Site is
              accurate, complete, or current; or (c) the Site is free of
              viruses or other harmful components.
            </p>
            <p className="mt-3">
              Your use of the Site and your reliance on any information it
              contains is entirely at your own risk. Users contact listed
              consultants at their own risk. Albor Digital is not a party to
              any consultant–client relationship and bears no responsibility for
              any interaction you have with a listed consultant.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              8. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Albor Digital
              and its owner shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages — including but not
              limited to loss of profits, data, goodwill, or other intangible
              losses — arising out of or in connection with your use of, or
              inability to use, the Site or any content on it.
            </p>
            <p className="mt-3">
              In jurisdictions that do not allow the exclusion of certain
              warranties or limitation of liability for consequential or
              incidental damages, our liability shall be limited to the fullest
              extent permitted by law. Because the Site is provided free of
              charge, our total aggregate liability to you for any claim arising
              under these Terms shall not exceed CAD $0.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Albor Digital
              and its owner from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable legal fees) arising out
              of or in any way connected with: (a) your access to or use of the
              Site; (b) your violation of these Terms; or (c) your violation of
              any rights of a third party.
            </p>
            <p className="mt-3">
              This indemnification obligation is limited to actual, documented
              losses and shall not apply to claims arising from Albor
              Digital&apos;s own negligence or wilful misconduct.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate access to the Site
              for any user or entity who violates these Terms, engages in
              abusive behaviour, or scrapes the directory at scale. We also
              reserve the right to discontinue the Site at any time without
              notice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              11. Governing law and jurisdiction
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the Province of Alberta and the federal laws of Canada
              applicable therein, without regard to conflict of law principles.
            </p>
            <p className="mt-3">
              You irrevocably submit to the exclusive jurisdiction of the courts
              of the Province of Alberta, sitting in Calgary, Alberta, for the
              resolution of any dispute arising under or in connection with these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              12. Changes to these terms
            </h2>
            <p>
              We may update these Terms from time to time. When we do, we will
              revise the &ldquo;Last updated&rdquo; date at the top of this page.
              For material changes, we will post a notice on the Site. Continued
              use of the Site after changes are posted constitutes your
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-medium text-stone-900">
              13. Contact
            </h2>
            <p>Questions about these Terms:</p>
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
              {/* TODO: confirm preferred legal contact email and whether a mailing address is required */}
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
