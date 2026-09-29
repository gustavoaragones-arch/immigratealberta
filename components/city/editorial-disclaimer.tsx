const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-09" → "September 2026". Input is validated by isReady upstream. */
function formatReviewed(lastReviewed: string): string {
  const [year, month] = lastReviewed.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function EditorialDisclaimer({ lastReviewed }: { lastReviewed: string }) {
  return (
    <aside className="mt-8 border-t border-stone-200 pt-5 text-[12.5px] leading-relaxed text-stone-500">
      <p>
        <strong className="font-medium text-stone-700">
          Immigration rules change often.
        </strong>{" "}
        Canadian immigration programs, requirements and intake levels can change
        quickly, sometimes with little notice, as governments adjust immigration
        levels and policies. We review this page regularly, but always confirm
        current requirements with official sources such as{" "}
        <a
          href="https://www.canada.ca/en/immigration-refugees-citizenship.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          Immigration, Refugees and Citizenship Canada (IRCC)
        </a>{" "}
        before you apply. This page is general information, not legal advice.
      </p>
      <p className="mt-1.5 italic">
        Last reviewed: {formatReviewed(lastReviewed)}
      </p>
    </aside>
  );
}
