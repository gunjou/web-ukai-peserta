"use client";

import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { TryoutQuestion, Answer } from "@/types/tryout";

interface Props {
  currentIndex: number;
  questions: TryoutQuestion[];
  currentAnswer: Answer | undefined;
  currentQuestion: TryoutQuestion | undefined;
  toggleRagu: (questionId: number) => void;
  setCurrentIndex: (index: number) => void;
  onSubmitPress: () => void;
}

export default function TryoutFooter({
  currentIndex,
  questions,
  currentAnswer,
  currentQuestion,
  toggleRagu,
  setCurrentIndex,
  onSubmitPress,
}: Props) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Ragu */}
          <button
            onClick={() => currentQuestion && toggleRagu(currentQuestion.id)}
            className={`
              flex shrink-0 items-center justify-center gap-2
              rounded-lg border px-3 py-2
              text-sm font-medium transition
              ${
                currentAnswer?.ragu
                  ? "border-purple-500 bg-purple-500 text-white"
                  : "border-border hover:border-purple-400"
              }
            `}
          >
            <Flag
              className={`h-4 w-4 ${currentAnswer?.ragu ? "fill-current" : ""}`}
            />
            <span className="hidden md:inline">
              {currentAnswer?.ragu ? "Ditandai" : "Ragu-ragu"}
            </span>
          </button>

          {/* Prev */}
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={isFirst}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-lg border px-3 py-2.5
              text-sm md:text-base font-medium
              ${isFirst ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}
            `}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <div className="hidden lg:flex flex-col min-w-[220px] px-4">
            <div className="flex justify-between text-xs mb-1">
              <span>
                {currentIndex + 1}/{questions.length}
              </span>

              <span>{progress}%</span>
            </div>

            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Next / Submit */}
          {!isLast ? (
            <button
              onClick={() =>
                setCurrentIndex(
                  Math.min(questions.length - 1, currentIndex + 1)
                )
              }
              className="
                flex flex-[1.5] items-center justify-center gap-2
                rounded-lg bg-primary px-3 py-2.5
                text-sm md:text-base font-medium text-white
                hover:bg-primary/90
              "
            >
              <span>Soal Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onSubmitPress}
              className="
                flex flex-[1.5] items-center justify-center gap-2
                rounded-lg bg-green-600 px-3 py-2.5
                text-sm md:text-base font-medium text-white
                hover:bg-green-700
              "
            >
              <Send className="h-4 w-4" />
              <span>Kumpulkan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
