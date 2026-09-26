export type ServiceEditorialFAQ = {
  question: string;
  answer: string;
};

export type ServiceEditorialContent = {
  metaDescription: string; // 120-155 chars, written for search snippet (Google truncates ~155)
  intro: string; // 60-80 words — what this service means, who it's for
  whatToLookFor: string; // 100-150 words — 3-4 practical considerations
  cityContext: string; // 80-120 words — city-specific context
  faqs: ServiceEditorialFAQ[]; // 3-4 questions with 40-80 word answers
};

/**
 * Editorial content for specific city × service combinations.
 * Keyed as `${citySlug}:${serviceSlug}`.
 *
 * IMPORTANT: adding content here without deploying = no effect.
 * Missing keys = page renders without editorial (default: no editorial section).
 * Any field still containing "[PLACEHOLDER" = whole entry is treated as not
 * ready and the page renders without editorial, so placeholders never ship.
 *
 * We deliberately only cover a subset of pages — the ones Google
 * explicitly rejected in the "Crawled - currently not indexed" report.
 * DO NOT mass-generate content for all 64 city×service combinations;
 * that pattern triggers Google's spam detection.
 *
 * FAQs must be city-specific — never copy a question verbatim across cities.
 */
export const SERVICE_EDITORIAL: Record<string, ServiceEditorialContent> = {
  "calgary:pr-express-entry": {
    metaDescription:
      "Verified RCICs in Calgary who handle Express Entry — Federal Skilled Worker, CEC, category-based draws, and AAIP nomination. CICC-checked, no paid placements.",
    intro:
      "Express Entry is the federal system that manages permanent residence applications through the Federal Skilled Worker, Federal Skilled Trades, and Canadian Experience Class programs. In 2026, IRCC prioritized ten selection categories — including physicians, researchers, senior managers, STEM, healthcare, trades, and French-language candidates — often at CRS cutoffs well below the general pool. Consultants help candidates identify the strongest pathway, prepare documentation correctly, and time provincial nomination through AAIP alongside their federal profile.",
    whatToLookFor:
      "First, verify RCIC status directly against the CICC public registry — every consultant listed here has been checked, but confirming yourself is a good habit. Second, ask about experience with your specific pathway: a consultant who handles mostly Alberta Opportunity Stream cases may not be the strongest choice for a category-based STEM draw, and vice versa. Third, clarify whether they support you through the full process, including Confirmation of Permanent Residence (CoPR) and landing, or only up to the initial application. Fourth, CICC-regulated consultants must provide a written service agreement that sets out the services, professional fees, billing arrangements, payment schedule and applicable disbursements — ask for it before you commit.",
    cityContext:
      "Calgary is home to candidates working across a wide range of occupations, while Alberta's 2026 immigration priorities include healthcare, technology, construction, manufacturing, aviation, and agriculture. Some of these priorities intersect with federal Express Entry categories and AAIP pathways. The AAIP Express Entry Stream requires a minimum CRS of 300 and an active Express Entry profile with a primary occupation aligned to the WEOI submission; a provincial nomination adds 600 CRS points. Calgary's large Punjabi, Hindi, Tagalog, and Spanish-speaking communities mean many consultants offer service in-language — you can filter this directory by language to find a match.",
    faqs: [
      {
        question:
          "Should I use an RCIC or an immigration lawyer for my Express Entry application?",
        answer:
          "For most Express Entry applications, an RCIC is the right choice — they're licensed federally by the CICC specifically for this work. Lawyers become the right choice when your case involves inadmissibility (criminal history, misrepresentation findings), a refusal you want to appeal, or judicial review at the Federal Court. If you're unsure, our Alberta immigration lawyers page explains the distinction in more detail.",
      },
      {
        question:
          "How does the AAIP Express Entry Stream interact with my federal Express Entry profile?",
        answer:
          "The AAIP Express Entry Stream selects candidates directly from the federal Express Entry pool. You maintain your federal profile, and if Alberta selects you and issues a nomination, 600 CRS points are added to your score — which substantially raises your CRS and normally puts you in a position to receive an invitation in an eligible Express Entry round. Effective April 7, 2026, AAIP charges a $135 non-refundable Expression of Interest fee at the registration stage.",
      },
      {
        question:
          "What documents should I have ready before my first consultation with a Calgary Express Entry consultant?",
        answer:
          "Have your language test results (IELTS General, CELPIP, or TEF/TCF for French), an Educational Credential Assessment (ECA) if any of your credentials are from outside Canada, work experience letters that list your duties matched to NOC codes, your current passport, and any provincial nomination documentation if you already hold one. If you're claiming Canadian work experience for a category-based draw, gather T4s and reference letters covering the 12-month minimum.",
      },
    ],
  },

  "calgary:study-permit": {
    metaDescription:
      "[PLACEHOLDER — 120-155 char meta description for search snippet.]",
    intro:
      "[PLACEHOLDER — 60-80 words on what study permits are, who needs them, and why the process is more nuanced than it appears (financial documentation, PAL requirements post-2024, DLI verification).]",
    whatToLookFor:
      "[PLACEHOLDER — 100-150 words on 3-4 practical considerations. Points to include: (1) knowledge of Provincial Attestation Letter (PAL) requirements introduced in 2024; (2) experience with GIC and proof-of-funds documentation; (3) guidance on Post-Graduation Work Permit (PGWP) eligibility at time of study permit application; (4) whether they help with study-to-PR pathway planning.]",
    cityContext:
      "[PLACEHOLDER — 80-120 words on Calgary-specific context: presence of major DLIs (U of C, SAIT, Mount Royal, Bow Valley College); typical source countries for Calgary international students; language-matching for South Asian, Chinese, and Filipino student communities.]",
    faqs: [
      {
        question:
          "Do I need a Provincial Attestation Letter (PAL) to apply for a study permit in Alberta?",
        answer:
          "[PLACEHOLDER — 40-80 words. Explain PAL requirement introduced in 2024 for most study permit applicants outside K-12 and graduate programs.]",
      },
      {
        question:
          "What is the difference between a study permit and a student visa?",
        answer:
          "[PLACEHOLDER — 40-80 words. Clarify the distinction: study permit authorizes studies, TRV/eTA authorizes entry to Canada.]",
      },
      {
        question:
          "Can my study permit consultant help me plan for permanent residence after graduation?",
        answer:
          "[PLACEHOLDER — 40-80 words. Explain PGWP-to-CEC-to-PR pathway planning as a service some consultants provide from initial study permit stage.]",
      },
    ],
  },

  "edmonton:study-permit": {
    metaDescription:
      "[PLACEHOLDER — 120-155 char meta description for search snippet.]",
    intro:
      "[PLACEHOLDER — 60-80 words. Similar to Calgary study-permit but reference Edmonton-specific angle.]",
    whatToLookFor:
      "[PLACEHOLDER — 100-150 words. Same 3-4 considerations, worded differently to avoid duplicate content flags.]",
    cityContext:
      "[PLACEHOLDER — 80-120 words on Edmonton-specific context: presence of U of A, MacEwan, NAIT, NorQuest as major DLIs; Edmonton's over-index of Hindi-speaking consultants (64 in DB) supporting Indian student community; Fort McMurray as secondary study destination for oil-sands trades programs.]",
    faqs: [
      // 3 city-specific questions, non-overlapping with Calgary FAQs
    ],
  },

  "edmonton:work-permit-lmia": {
    metaDescription:
      "[PLACEHOLDER — 120-155 char meta description for search snippet.]",
    intro:
      "[PLACEHOLDER — 60-80 words on work permits and LMIA, the difference between them, when each applies.]",
    whatToLookFor:
      "[PLACEHOLDER — 100-150 words on 3-4 considerations: LMIA-exempt streams (CUSMA, ICT, IEC), employer compliance history, wage/prevailing wage documentation, provincial support letters.]",
    cityContext:
      "[PLACEHOLDER — 80-120 words on Edmonton-specific context: healthcare and public sector as major LMIA employers, oil and gas sector (esp. Fort Mac corridor), skilled trades demand.]",
    faqs: [
      // 3 city-specific questions
    ],
  },

  "edmonton:family-sponsorship": {
    metaDescription:
      "[PLACEHOLDER — 120-155 char meta description for search snippet.]",
    intro:
      "[PLACEHOLDER — 60-80 words on family sponsorship: who can sponsor whom, spousal vs parents/grandparents distinction, common timeline expectations.]",
    whatToLookFor:
      "[PLACEHOLDER — 100-150 words on 3-4 considerations: genuine relationship documentation, income requirements for PGP, in-Canada vs outside Canada sponsorship strategy, dealing with prior refusals.]",
    cityContext:
      "[PLACEHOLDER — 80-120 words on Edmonton-specific context.]",
    faqs: [
      // 3 city-specific questions
    ],
  },

  "red-deer:visitor-super-visa": {
    metaDescription:
      "[PLACEHOLDER — 120-155 char meta description for search snippet.]",
    intro:
      "[PLACEHOLDER — 60-80 words. Visitor visas vs Super Visa: the Super Visa is a 10-year multiple-entry visa specifically for parents/grandparents of Canadian citizens/PRs.]",
    whatToLookFor:
      "[PLACEHOLDER — 100-150 words on 3-4 considerations: medical insurance requirements ($100k+ Canadian coverage), income requirements for the inviting family, letter of invitation composition, ties-to-home-country documentation.]",
    cityContext:
      "[PLACEHOLDER — 80-120 words on Red Deer as a smaller market: consultants often serve broader Central Alberta region; fewer specialists but personalized service; typical Super Visa applicant profile in this region.]",
    faqs: [
      // 3 city-specific questions
    ],
  },
};

const PLACEHOLDER_MARKER = "[PLACEHOLDER";

function isReady(e: ServiceEditorialContent): boolean {
  const fields = [
    e.metaDescription,
    e.intro,
    e.whatToLookFor,
    e.cityContext,
    ...e.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  return fields.every((f) => f.trim() !== "" && !f.includes(PLACEHOLDER_MARKER));
}

/**
 * Look up editorial content for a city × service combination.
 * Returns null if no editorial exists for this combination, or if any field
 * still contains placeholder text (page renders as before).
 */
export function getServiceEditorial(
  citySlug: string,
  serviceSlug: string,
): ServiceEditorialContent | null {
  const entry = SERVICE_EDITORIAL[`${citySlug}:${serviceSlug}`];
  return entry && isReady(entry) ? entry : null;
}
