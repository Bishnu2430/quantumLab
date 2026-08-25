"use client";

import React from "react";
import Link from "next/link";
import { BookOpenCheck, ArrowRight } from "lucide-react";

interface PrerequisiteItem {
  title: string;
  href: string;
}

interface PrerequisitesProps {
  items: PrerequisiteItem[];
}

export const Prerequisites: React.FC<PrerequisitesProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#CBD5E1] space-y-2 text-xs">
      <div className="flex items-center gap-2 font-bold text-[#0F172A] uppercase font-mono tracking-wider">
        <BookOpenCheck className="w-4 h-4 text-[#2563EB]" />
        <span>Recommended Prerequisites</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-lg font-bold transition shadow-xs"
          >
            <span>{item.title}</span>
            <ArrowRight className="w-3 h-3 text-[#2563EB]" />
          </Link>
        ))}
      </div>
    </div>
  );
};
