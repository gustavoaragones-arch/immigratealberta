"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  HelpCircle,
  Scale,
  Stamp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tile = {
  icon: LucideIcon;
  label: string;
  href: string;
};

const tiles: Tile[] = [
  {
    icon: Stamp,
    label: "PR or Express Entry",
    href: "/decision-tool/city?case=pr-express-entry",
  },
  {
    icon: GraduationCap,
    label: "Study permit",
    href: "/decision-tool/city?case=study-permit",
  },
  {
    icon: Briefcase,
    label: "Work permit or LMIA",
    href: "/decision-tool/city?case=work-permit-lmia",
  },
  {
    icon: Users,
    label: "Family sponsorship",
    href: "/decision-tool/city?case=family-sponsorship",
  },
  {
    icon: Scale,
    label: "Refugee or IRB matter",
    href: "/decision-tool/city?case=refugee-irb",
  },
  {
    icon: HelpCircle,
    label: "I'm not sure yet",
    href: "/decision-tool/city?case=unsure",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export function DecisionToolPreview() {
  return (
    <div className="mx-auto max-w-[600px] rounded-xl border border-stone-300 bg-white p-6 md:p-7">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-stone-500">
        Find your match · 60 seconds
      </div>
      <div className="mb-5 text-[17px] font-medium text-stone-900">
        What kind of case do you have?
      </div>

      <motion.div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <motion.div key={tile.label} variants={item}>
              <Link
                href={tile.href}
                className="group flex items-center gap-2.5 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-all hover:-translate-y-px hover:scale-[1.02] hover:border-stone-400 hover:shadow-sm"
              >
                <Icon
                  className="h-4 w-4 text-stone-500 transition-colors group-hover:text-stone-700"
                  aria-hidden="true"
                />
                <span>{tile.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-4 text-center text-xs text-stone-500">
        Next: city, then your matches.
      </div>
    </div>
  );
}
