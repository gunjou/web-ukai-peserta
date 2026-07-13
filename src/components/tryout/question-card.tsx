"use client";

import { TryoutQuestion } from "@/types/tryout";

interface Props {
  question: TryoutQuestion;
}

export default function QuestionCard({ question }: Props) {
  return (
    // Mengurangi space-y-8 menjadi space-y-4 untuk merapatkan judul dengan teks soal
    <div className="space-y-4">
      {/* HEADER: Dibuat super minimalis dan sejajar */}
      <div className="flex items-center gap-2.5 border-b pb-3">
        {/* Badge Nomor (Dikecilkan dari h-14 ke h-7 dengan bentuk bulat kompak) */}
        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            bg-primary
            text-xs
            font-bold
            text-white
          "
        >
          {question.nomor}
        </div>

        {/* Judul Soal (Menghapus teks "Pertanyaan" yang redundan, mengecilkan teks ke text-base) */}
        <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground">
          Soal No. {question.nomor}
        </h2>
      </div>

      {/* CONTENT: Tipografi yang disesuaikan agar hemat ruang vertikal */}
      <div
        className="
          prose
          prose-sm
          md:prose-base
          max-w-none
          dark:prose-invert
          whitespace-pre-line

          [&_img]:max-w-full
          [&_img]:h-auto
          [&_img]:rounded-lg
          [&_img]:my-3

          [&_table]:block
          [&_table]:overflow-x-auto
          [&_table]:whitespace-nowrap

          [&_p]:leading-relaxed
          [&_p]:my-2
          [&_li]:leading-relaxed

          [&_h1]:text-xl
          [&_h2]:text-lg
          [&_h3]:text-base

          [&_strong]:font-bold
        "
        dangerouslySetInnerHTML={{
          __html: question.pertanyaan,
        }}
      />
    </div>
  );
}
