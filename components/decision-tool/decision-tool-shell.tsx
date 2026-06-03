import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  stepNumber: 1 | 2 | 3;
  stepLabel: string;
  question?: string;
  backHref?: string | null;
  children: React.ReactNode;
};

export function DecisionToolShell({
  stepNumber,
  stepLabel,
  question,
  backHref = null,
  children,
}: Props) {
  return (
    <main className="pb-12">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-8 flex items-center justify-between text-[12px] text-stone-500">
          <span>
            Step {stepNumber} of 3 · {stepLabel}
          </span>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-stone-600 transition-colors hover:text-stone-900"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Back
            </Link>
          ) : null}
        </div>

        {question ? (
          <h1 className="mb-8 text-2xl font-medium text-stone-900 md:text-3xl">
            {question}
          </h1>
        ) : null}

        {children}
      </div>
    </main>
  );
}
