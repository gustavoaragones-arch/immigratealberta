export type ServiceEditorialFAQ = {
  question: string;
  answer: string;
};

export type ServiceEditorialContent = {
  lastReviewed: string; // "YYYY-MM" — shown as "Last reviewed: <Month YYYY>"
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
    lastReviewed: "2026-09",
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
    lastReviewed: "2026-09",
    metaDescription:
      "Verified RCICs in Calgary who handle study permits — PAL, proof of funds, PGWP-eligible programs, and study-to-PR planning. CICC-checked, no paid placements.",
    intro:
      "A study permit authorizes an international student to study at a Designated Learning Institution (DLI) in Canada. In 2026, IRCC set a national cap of 408,000 study permits and requires most applicants to submit a Provincial Attestation Letter (PAL) — issued by the institution on the student's behalf — as part of the application. Alberta has 32,271 application spaces allocated for PAL/TAL-required study permits in 2026. Consultants help applicants navigate the current rules, prepare financial documentation, and plan pathways beyond graduation.",
    whatToLookFor:
      "First, confirm the consultant has current knowledge of the 2026 PAL system — the rules changed on January 1, 2026 to exempt master's and doctoral students at public DLIs, and rules like this shift with each annual Ministerial Instruction. Second, ask about experience with proof-of-funds documentation, including acceptable evidence of financial support such as bank statements, tuition payments, scholarships, or a Guaranteed Investment Certificate (GIC). Third, discuss Post-Graduation Work Permit (PGWP) planning up-front — since November 2024, non-degree graduates must complete a program on IRCC's eligible fields-of-study list, and this affects program selection now, not just after graduation. Fourth, ask whether they support extensions, dependent applications, and DLI transfers, since study permit journeys often involve several follow-on filings.",
    cityContext:
      "Calgary hosts several DLIs including the University of Calgary, SAIT, Mount Royal University, and Bow Valley College. Alberta's PAL process is handled by the institution: after acceptance, the institution requests the PAL from the province on the student's behalf, with delivery times varying by institution. Calgary's Punjabi, Hindi, Tagalog, and Mandarin-speaking communities are well-represented among students from India, the Philippines, and China — you can filter this directory by language to find a consultant who can walk you through the process in your first language.",
    faqs: [
      {
        question:
          "Do I need a Provincial Attestation Letter (PAL) to apply for a study permit in Alberta in 2026?",
        answer:
          "Most new post-secondary study permit applicants need a PAL for 2026. As of January 1, 2026, master's and doctoral students enrolled at public DLIs are exempt, along with primary and secondary students and certain other exempt groups. Alberta's 2026 allocation for PAL/TAL-required applications is 32,271 spaces, and the institution requests the PAL on the student's behalf.",
      },
      {
        question:
          "How does the Post-Graduation Work Permit field-of-study rule affect my program choice?",
        answer:
          "If you applied for your study permit on or after November 1, 2024 and you're pursuing a non-degree program (diploma, certificate, post-graduate certificate), your program must be on IRCC's PGWP-eligible fields-of-study list to qualify for a PGWP after graduation. Degree programs (bachelor's, master's, doctoral) are exempt from this rule. IRCC froze the eligible list for all of 2026, but the list can change in future years — a consultant can help confirm your program's status before you commit.",
      },
      {
        question:
          "Can my study permit consultant also help me plan for permanent residence after graduation?",
        answer:
          "Yes — many Calgary consultants offer pathway planning from the study permit stage forward. One potential route is study permit → PGWP → Canadian work experience → Canadian Experience Class through Express Entry or an Alberta Advantage Immigration Program nomination, depending on eligibility. Discussing this pathway before you enroll helps you choose a program that aligns with both PGWP eligibility and eventual PR options; retrofitting the strategy after graduation is usually harder and more limited.",
      },
    ],
  },

  "edmonton:study-permit": {
    lastReviewed: "2026-09",
    metaDescription:
      "Study permit help in Edmonton from CICC-verified RCICs: PAL exemptions and diploma vs degree PGWP rules for U of A, MacEwan, NAIT and NorQuest.",
    intro:
      "Edmonton's study permit questions often come down to which kind of program you choose. Degree-granting master's and doctoral programs at a public designated learning institution (DLI) no longer need a provincial attestation letter (PAL), but most undergraduate and diploma programs do, and graduate certificates and diplomas aren't covered by that exemption. The consultants below are verified against the CICC public register and can review your letter of acceptance, funding evidence and program choice before you apply.",
    whatToLookFor:
      "Ask how the consultant decides whether your program needs a PAL. The 2026 exemption covers only degree-granting master's and doctoral programs at a public institution; graduate certificates and diplomas aren't covered, and a prerequisite or bridging course still requires a PAL even when the main program is exempt. A good consultant checks this against your letter of acceptance, not the program's marketing name. Ask, too, how they plan beyond the permit itself. If you are considering a diploma at a college or polytechnic, the program's field of study must be on IRCC's eligible list for a post-graduation work permit (PGWP), and you will generally need CLB 5 in all four language skills; degree graduates need CLB 7 but are not subject to the field-of-study list. Be wary of promised approvals or guaranteed PALs. Your institution requests the PAL on your behalf once you're accepted, not a consultant.",
    cityContext:
      "Edmonton's public institutions for international students include the University of Alberta, MacEwan University, NAIT and NorQuest College, so applicants here choose between research degrees, undergraduate programs and applied polytechnic or college diplomas. Those paths face different PAL, language and PGWP rules, which is why program choice deserves as much attention as the application itself. Alberta's 2026 allocation is 32,271 study permit applications requiring an attestation letter, shared among institutions across the province. Because institutions request letters from Alberta's allocation and spaces can run short later in the year, starting early in the intake cycle gives you the most room.",
    faqs: [
      {
        question:
          "I'm starting a master's at the University of Alberta. Do I need a PAL?",
        answer:
          "In most cases, no. Since January 1, 2026, applicants to degree-granting master's and doctoral programs at a public DLI don't need a PAL. You'll still need your letter of acceptance and the other required documents. Graduate certificates and diplomas aren't covered by this exemption, and a prerequisite course you must complete before the master's begins still requires a PAL, so confirm with the university which applies to you.",
      },
      {
        question:
          "Will a NAIT or NorQuest diploma qualify me for a post-graduation work permit?",
        answer:
          "It can, but two conditions apply that don't apply to degree graduates, in addition to the usual PGWP requirements. Your program's field of study must be on IRCC's eligible list, which IRCC has said will stay unchanged through 2026, and you'll generally need a language test result of at least CLB 5 in all four skills. Check your program's eligibility before you enroll, not when you graduate.",
      },
      {
        question:
          "I'm already studying in Edmonton and want to switch schools. Do I need a new PAL?",
        answer:
          "Usually, yes. Since January 22, 2025, changing schools or levels of study generally requires a new PAL when you apply to extend your study permit, unless an exception applies. You don't need one if you're extending at the same institution and the same level of study. Because the rules depend on your exact situation, have a consultant review your case before you accept a new offer.",
      },
      {
        question: "Can a consultant get me a PAL faster?",
        answer:
          "No. Your institution requests the PAL on your behalf after accepting you, drawing on Alberta's allocation, and a consultant can't request or speed one up. What a consultant can do is make sure your study permit application is complete, your funding evidence is clear, and your program choice fits your longer-term plans, since a refusal can mean starting the process again.",
      },
    ],
  },

  // REVIEW: contains time-sensitive facts. Re-check after each ESDC wage-threshold
  // update (usually July; Alberta $37.50 as of 2026-07-17) and each quarterly
  // refusal-to-process rate update for the Edmonton CMA.
  "edmonton:work-permit-lmia": {
    lastReviewed: "2026-09",
    metaDescription:
      "Edmonton work permit and LMIA help from CICC-verified RCICs: low-wage vs high-wage streams, Alberta's $37.50 threshold and fee red flags.",
    intro:
      "Employer-specific work permits in Edmonton usually start with one question: does the job need a Labour Market Impact Assessment (LMIA), and if so, which stream? The answer depends largely on the wage. The consultants below are verified against the CICC public register and can advise workers and employers on LMIA-based and LMIA-exempt options, eligibility and timing. The employer pays the LMIA processing fee; it cannot be recovered from the worker.",
    whatToLookFor:
      "Ask the consultant which LMIA stream your job falls under and why. Since July 17, 2026, a position in Alberta paying $37.50 an hour or more goes through the high-wage stream; below that, it is low-wage. The wage must also meet the prevailing wage for the occupation, so raising pay only to change streams can lead to a negative LMIA decision. A good consultant confirms the actual work location, the occupation code and the wage before anything is filed. Watch for red flags. Employers and anyone recruiting for them may not charge you recruitment fees or pass on the $1,000 LMIA processing fee, and buying or selling a job offer is fraud. Workers still pay their own work permit and biometrics fees.",
    cityContext:
      "Edmonton has been above the 6% unemployment threshold in recent quarterly updates. While a census metropolitan area is at or above that rate, low-wage LMIA applications for jobs there aren't processed. Certain sectors and positions are exempt, including qualifying positions in construction, food manufacturing, hospitals, and nursing and residential care facilities, but restaurants and other food-service positions are not part of the food manufacturing exemption. Rates are reviewed every three months, and the rate that applies is the one in effect when the employer submits the application. For an affected low-wage position, the employer may need to look at an applicable exemption, a high-wage position that genuinely meets the wage requirements, or an LMIA-exempt work-permit route.",
    faqs: [
      {
        question:
          "My employer in Edmonton wants to hire me through a low-wage LMIA. Can they?",
        answer:
          "Only if the position qualifies for an exemption, or Edmonton's unemployment rate falls below 6% in a quarterly update. While the rate is at or above 6%, low-wage LMIA applications for Edmonton jobs aren't processed unless an exemption applies. If none does, ask a consultant whether a high-wage offer that genuinely meets the wage requirements, an LMIA-exempt permit or another pathway fits your situation.",
      },
      {
        question:
          "Does the low-wage freeze apply to jobs just outside Edmonton?",
        answer:
          "It depends on the census area of the work location, not the employer's head office. The Edmonton census metropolitan area extends beyond city limits, so many nearby communities fall inside it. Locations in a smaller census agglomeration or outside any metropolitan area aren't subject to the 6% rule. A consultant can confirm the classification from the job's full postal code.",
      },
      {
        question:
          "Someone offered to sell me an LMIA job offer. Is that legitimate?",
        answer:
          "No. Employers must pay the LMIA processing fee themselves, and neither they nor anyone recruiting for them may charge you recruitment fees, directly or indirectly. Paying for a job offer or LMIA is fraud and can put your immigration future at risk. If you're asked to pay, stop and check the person's licence on the CICC public register before you do anything else.",
      },
      {
        question: "Does an LMIA job offer still help with Express Entry?",
        answer:
          "Not with your ranking score. Since March 25, 2025, job offers, with or without an LMIA, add no Comprehensive Ranking System points. IRCC has said it may reintroduce points for some job offers, but no date or details have been announced. A job offer can still matter for program eligibility and for Alberta's provincial nominee streams, so it's worth discussing with a consultant.",
      },
    ],
  },

  // REVIEW: time-sensitive. PGP intake paused 2026-07-15 "until further notice" —
  // update this entry if IRCC reopens intake. Also re-check spousal processing
  // wording if inland/outland relative times change.
  "edmonton:family-sponsorship": {
    lastReviewed: "2026-09",
    metaDescription:
      "Family sponsorship help in Edmonton from CICC-verified RCICs: spouse and partner applications, inland vs outland, and the 2026 parent program pause.",
    intro:
      "For people in Edmonton looking to sponsor family members, current federal options include spouses, common-law partners and dependent children, while new Parents and Grandparents Program intake is paused. There is no minimum income requirement to sponsor a spouse or partner, but the relationship evidence has to hold up. The consultants below are verified against the CICC public register and can review your eligibility and your file before you apply.",
    whatToLookFor:
      "Ask how the consultant would decide between an inland and an outland application. Inland applications let an eligible spouse or partner already in Canada apply for an open work permit while waiting, but they have recently taken longer to process than outland ones, and outland applicants can travel more freely during processing. A good consultant weighs your spouse's status, work needs and travel plans before recommending one. Ask, too, how they assess relationship evidence, since doubts about whether a relationship is genuine are a frequent reason for refusal. Make sure you understand the undertaking you sign: you are financially responsible for a sponsored spouse or partner for three years after they become a permanent resident, and you must repay any social assistance they receive in that time.",
    cityContext:
      "Sponsors living in Edmonton apply directly to IRCC; unlike Quebec, Alberta does not add a separate provincial undertaking. For parents and grandparents, IRCC is not accepting new interest-to-sponsor forms or issuing invitations until further notice, though applications already submitted are still being processed, with up to 15,000 approvals planned for 2026. For families in Edmonton who want parents or grandparents here for long visits in the meantime, the super visa is a separate option with its own requirements. Spousal processing times also change often, so check IRCC's current estimates rather than relying on older figures.",
    faqs: [
      {
        question: "Can I sponsor my parents from Edmonton right now?",
        answer:
          "Not through the Parents and Grandparents Program for now. IRCC paused new intake on July 15, 2026 and hasn't announced a reopening date. If you already submitted an application, it continues to be processed. If your goal is to have a parent or grandparent stay with you for long periods, a consultant can assess whether the super visa fits your situation.",
      },
      {
        question: "Do I need a minimum income to sponsor my spouse?",
        answer:
          "Generally, no. Sponsoring a spouse, common-law partner or dependent child doesn't require meeting a minimum income. You must still be eligible as a sponsor, which generally means you are not receiving social assistance for reasons other than disability, are not an undischarged bankrupt, and are not in default of a previous undertaking or immigration loan.",
      },
      {
        question:
          "My partner is already in Edmonton. Should we apply inland or outland?",
        answer:
          "It depends on what matters most to you. Inland lets your partner apply for an open work permit while the application is processed, which helps if they need to work. Outland has recently been faster and allows more freedom to travel, and it can be chosen even if your partner is in Canada. A consultant can weigh your partner's status and plans.",
      },
      {
        question: "Who counts as a dependent child?",
        answer:
          "Generally, a child under 22 who doesn't have a spouse or common-law partner. Children 22 or older qualify only if they have depended on their parents financially since before 22 and can't support themselves because of a physical or mental condition. The undertaking lasts 10 years or until the child turns 25, whichever comes first, if the child is under 22 when they become a permanent resident. If they are 22 or older then, it lasts three years.",
      },
    ],
  },

  // REVIEW: time-sensitive. PGP intake paused 2026-07-15 "until further notice";
  // super visa income rules changed 2026-03-31; LICO figures update annually.
  // Copy states listed consultants "have offices in Red Deer" — keep true.
  "red-deer:visitor-super-visa": {
    lastReviewed: "2026-09",
    metaDescription:
      "Super visa and visitor visa help in Red Deer from CICC-verified RCICs: host income rules, $100,000 insurance, and local advice without the drive.",
    intro:
      "In Red Deer, you don't have to travel to Calgary or Edmonton for visitor or super visa help. The consultants below have offices in Red Deer, are verified against the CICC public register and can review an invitation, a host's income evidence or an insurance policy before you apply. With new Parents and Grandparents Program intake currently paused, the super visa remains an option for families who want parents or grandparents to make longer visits.",
    whatToLookFor:
      "Ask the consultant which visa actually fits the visit. A visitor visa usually allows stays of up to six months, while a super visa lets eligible parents and grandparents stay up to five years per entry. For a super visa, ask how they check the host's income against the low-income cut-off for the household size, including the more flexible options IRCC introduced on March 31, 2026, and how they confirm the medical insurance qualifies: at least $100,000 in coverage, valid for at least one year from entry, from an eligible insurer. Incomplete invitation letters, inadequate insurance and poorly documented income can create problems for an application. Be wary of anyone who promises approval; the decision belongs to IRCC.",
    cityContext:
      "For most visitor and super visa files, the core work is document review: the invitation letter, the host's notice of assessment and proof of status, and the insurance certificate. That makes a consultant close to home practical, especially for families preparing a super visa while new Parents and Grandparents Program intake is paused. The super visa income test uses the low-income cut-off itself, not the higher threshold used for sponsoring parents for permanent residence. In Red Deer, a local consultant can often review your documents in person before you submit.",
    faqs: [
      {
        question:
          "Can I get super visa help in Red Deer, or do I need to go to Calgary or Edmonton?",
        answer:
          "You can get help locally. The consultants listed on this page have offices in Red Deer and are verified against the CICC public register. Much of a super visa or visitor visa file is document review, so a local consultant can check your invitation letter, income evidence and insurance before you apply, without a trip to a larger city.",
      },
      {
        question:
          "How much income do I need to host my parents on a super visa?",
        answer:
          "It depends on your household size, which includes you, your family members and the parents or grandparents you're inviting. The requirement is the low-income cut-off for that household size, not the higher threshold used for sponsoring parents for permanent residence. Since March 31, 2026, hosts have more flexibility in which tax year they use and, in some cases, can count the visiting parent's income.",
      },
      {
        question: "What insurance does a super visa need?",
        answer:
          "The policy must provide at least $100,000 in emergency medical coverage, be valid for at least one year from the date of entry, and cover health care, hospitalization and repatriation. It must come from a Canadian insurer or an eligible foreign insurer, and you need proof of it when you apply. A quote alone isn't accepted.",
      },
      {
        question:
          "I'm visiting Red Deer and found a job. Can I apply for a work permit from inside Canada?",
        answer:
          "Generally not as a visitor. The temporary policy that let visitors apply for an employer-supported work permit from inside Canada ended on August 28, 2024. Some other work permit applications can still be made in specific situations, so speak with a consultant before your authorized stay ends.",
      },
    ],
  },
};

const PLACEHOLDER_MARKER = "[PLACEHOLDER";
const LAST_REVIEWED_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function isReady(e: ServiceEditorialContent): boolean {
  const fields = [
    e.metaDescription,
    e.intro,
    e.whatToLookFor,
    e.cityContext,
    ...e.faqs.flatMap((f) => [f.question, f.answer]),
  ];
  return (
    LAST_REVIEWED_RE.test(e.lastReviewed) &&
    fields.every((f) => f.trim() !== "" && !f.includes(PLACEHOLDER_MARKER))
  );
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
