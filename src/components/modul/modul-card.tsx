"use client";

import Link from "next/link";

import { Modul } from "@/services/modul.service";
import { BookText } from "lucide-react";

interface Props {
  modul: Modul;

  href: string;
}

export default function ModulCard({ modul, href }: Props) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        bg-card
        p-5
        transition-all
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      {/* Icon */}
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >
        <BookText className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3
        className="
          line-clamp-2
          text-base
          font-semibold
          transition-colors
          group-hover:text-primary
        "
      >
        {modul.title}
      </h3>
    </Link>
  );
}
