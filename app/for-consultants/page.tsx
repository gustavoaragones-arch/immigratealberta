import Link from "next/link";
import type { Metadata } from "next";
import { EyeOff, Mail, Pencil, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "For consultants · ImmigrateAlberta",
  description:
    "Licensed RCICs can request to be added, correct existing information, or remove their listing from ImmigrateAlberta. We verify every change manually against the CICC public registry.",
  alternates: { canonical: "/for-consultants" },
};

const CONTACT_EMAIL = "contact@immigratealberta.ca";

const SUBJECT = {
  list: "List my firm on ImmigrateAlberta",
  correct: "Correct information on my ImmigrateAlberta listing",
  remove: "Remove my listing from ImmigrateAlberta",
};

function mailto(subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}

const LIST_BODY = `Hi ImmigrateAlberta team,

I'd like to be added to the directory. Here is my information:

- Full legal name:
- RCIC number:
- Firm legal name:
- Firm display name (if different):
- Office address (Alberta, must be physical):
- Phone:
- Website:
- Primary email:
- Languages I practice in:
- Service categories I handle (PR/Express Entry, AAIP, study permit, work permit/LMIA, family sponsorship, visitor/super visa, citizenship, refugee/IRB):

Thanks,`;

const CORRECT_BODY = `Hi ImmigrateAlberta team,

I'd like to correct information on my listing.

- My RCIC number:
- Link to my profile on ImmigrateAlberta:
- What needs to change:
- The correct information:

Thanks,`;

const REMOVE_BODY = `Hi ImmigrateAlberta team,

I'm requesting removal of my listing from ImmigrateAlberta.

- My RCIC number:
- Full legal name (for verification):

Thanks,`;

export default function ForConsultantsPage() {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
          For Consultants
        </div>
        <h1 className="mb-4 text-2xl font-medium text-stone-900 md:text-3xl">
          List, correct, or remove your firm.
        </h1>
        <p className="mb-8 text-[15px] leading-relaxed text-stone-600">
          ImmigrateAlberta is an independent, manually-curated directory of
          Regulated Canadian Immigration Consultants practicing in Alberta. We
          don&apos;t accept self-registration. Every change goes through a human
          review against the CICC public registry.
        </p>

        <RequestCard
          icon={
            <Plus
              className="h-5 w-5 text-emerald-700"
              aria-hidden="true"
            />
          }
          title="Add your firm to the directory"
          intro={
            <>
              Send the following to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                {CONTACT_EMAIL}
              </a>
              :
            </>
          }
          items={[
            "Your full legal name and RCIC number (we verify it against the CICC registry)",
            "Your firm's legal name and display name",
            "Office address (must be a physical Alberta location)",
            "Phone, website, and primary email",
            "Languages you practice in",
            "Which of our 8 service categories you handle",
          ]}
          ctaHref={mailto(SUBJECT.list, LIST_BODY)}
          ctaLabel={`Email ${CONTACT_EMAIL}`}
          ctaPrimary
        />

        <RequestCard
          icon={
            <Pencil
              className="h-5 w-5 text-slate-700"
              aria-hidden="true"
            />
          }
          title="Correct information on an existing listing"
          intro={<>Found a typo, outdated phone, or wrong address? Send:</>}
          items={[
            "Your RCIC number (so we can locate your record)",
            "The URL of your profile on ImmigrateAlberta",
            "What needs to change, and the correct information",
          ]}
          ctaHref={mailto(SUBJECT.correct, CORRECT_BODY)}
          ctaLabel="Email a correction"
        />

        <RequestCard
          icon={
            <EyeOff
              className="h-5 w-5 text-stone-500"
              aria-hidden="true"
            />
          }
          title="Remove your listing"
          intro={
            <>
              Under Canadian privacy law (PIPEDA), you can ask us to remove
              your listing at any time. Send:
            </>
          }
          items={[
            "Your RCIC number",
            "A short confirmation that you're requesting removal",
          ]}
          ctaHref={mailto(SUBJECT.remove, REMOVE_BODY)}
          ctaLabel="Email a removal request"
        />

        <div className="mt-8 rounded-lg border-l-2 border-slate-700 bg-stone-100 px-5 py-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            Our verification policy
          </div>
          <p className="mb-2 text-[13px] leading-relaxed text-stone-700">
            We respond to all requests within{" "}
            <strong className="font-medium text-stone-900">
              5 business days
            </strong>
            . Every listing is verified manually against the CICC public
            registry before publication. We may decline to list a consultant
            whose RCIC status is suspended, revoked, or inactive.
          </p>
          <p className="text-[13px] leading-relaxed text-stone-700">
            ImmigrateAlberta is operated by Albor Digital, a registered trade
            name in Alberta. We do not charge consultants for listings, do not
            sell user data, and are not affiliated with the Government of Canada
            or the College of Immigration and Citizenship Consultants.
          </p>
        </div>

        <p className="mt-8 text-center text-[12px] leading-relaxed text-stone-500">
          Looking for an immigration consultant for your own case? Please{" "}
          <Link
            href="/decision-tool"
            className="underline underline-offset-2 hover:text-stone-700"
          >
            use our directory
          </Link>{" "}
          — we can&apos;t provide immigration advice ourselves.
        </p>
      </div>
    </main>
  );
}

function RequestCard({
  icon,
  title,
  intro,
  items,
  ctaHref,
  ctaLabel,
  ctaPrimary = false,
}: {
  icon: React.ReactNode;
  title: string;
  intro: React.ReactNode;
  items: string[];
  ctaHref: string;
  ctaLabel: string;
  ctaPrimary?: boolean;
}) {
  return (
    <div className="mb-3 rounded-xl border border-stone-300 bg-white p-5 md:p-6">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h2 className="text-[16px] font-semibold text-stone-900">{title}</h2>
      </div>
      <p className="mb-3 text-[13px] leading-relaxed text-stone-600">{intro}</p>
      <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-stone-600 marker:text-stone-400">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={
          ctaPrimary
            ? "inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-slate-900"
            : "inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-900 transition-colors hover:border-stone-400 hover:bg-stone-50"
        }
      >
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        {ctaLabel}
      </a>
    </div>
  );
}
