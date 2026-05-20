"use client";

type Props = {
  verifiedCount: number;
  lastCheckedISO: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function HeroPill({ verifiedCount, lastCheckedISO }: Props) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] tracking-wide text-stone-600">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-700 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-700" />
      </span>
      <span>
        {verifiedCount} RCICs verified · last checked {formatDate(lastCheckedISO)}
      </span>
    </div>
  );
}
