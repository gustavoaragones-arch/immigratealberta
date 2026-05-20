"use client";

import { motion } from "framer-motion";
import { CircleDollarSign, EyeOff, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Pillar = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const pillars: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Manually verified",
    body: "Every RCIC checked one-by-one against the CICC public registry. You can verify any of them yourself in one click.",
  },
  {
    icon: EyeOff,
    title: "No paid placement",
    body: "Consultants can't pay to rank higher. Listings are ordered by trust signals, not advertising spend.",
  },
  {
    icon: CircleDollarSign,
    title: "Free to use",
    body: "We don't charge users. We don't sell your data. We're not the consultant — we just help you find a real one.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

export function TrustPillars() {
  return (
    <section className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-14">
        <div className="mb-8 text-center text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Why this directory exists
        </div>
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} variants={item}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span className="text-sm font-medium text-stone-900">
                    {p.title}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-stone-600">
                  {p.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
