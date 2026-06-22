"use client";

import { CheckCircle2, XCircle, MinusCircle, Flag } from "lucide-react";
import { TryoutQuestion, AnswersMap } from "@/types/tryout";

interface Props {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  questions?: TryoutQuestion[];
  answers?: AnswersMap;
  mode?: "tryout" | "pembahasan";
  statuses?: { [key: number]: "benar" | "salah" | "kosong" };
}

export default function QuestionNavigation({
  total,
  current,
  onSelect,
  questions = [],
  answers = {},
  mode = "tryout",
  statuses = {},
}: Props) {
  const getButtonColor = (index: number) => {
    const question = questions[index];

    if (!question) {
      return "bg-card border-border";
    }

    if (mode === "pembahasan") {
      const status = statuses[question.id];

      switch (status) {
        case "benar":
          return "bg-green-500 text-white border-green-500";
        case "salah":
          return "bg-red-500 text-white border-red-500";
        case "kosong":
          return "bg-gray-400 text-white border-gray-400";
        default:
          return "bg-muted text-muted-foreground border-border";
      }
    }

    const answer = answers[question.id];

    if (answer?.answer) {
      return "bg-green-500 text-white border-green-500";
    }

    if (answer?.ragu) {
      return "bg-yellow-500 text-white border-yellow-500";
    }

    return `
      bg-background
      border-border
      hover:border-primary/40
      hover:bg-muted
    `;
  };

  const getReviewIcon = (index: number) => {
    if (mode !== "pembahasan") return null;

    const status = statuses[questions[index]?.id];

    switch (status) {
      case "benar":
        return <CheckCircle2 className="h-4 w-4" />;

      case "salah":
        return <XCircle className="h-4 w-4" />;

      default:
        return <MinusCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-2 py-4">
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: total }).map((_, index) => {
          const active = current === index;

          const question = questions[index];
          const answer = answers[question?.id];

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border-2
                text-sm
                font-semibold
                transition-all
                duration-200

                ${getButtonColor(index)}

                ${
                  active
                    ? `
                      ring-2
                      ring-primary
                      ring-offset-2
                      scale-105
                      shadow-md
                    `
                    : ""
                }
              `}
            >
              {mode === "pembahasan" ? (
                getReviewIcon(index)
              ) : (
                <>
                  <span>{index + 1}</span>

                  {answer?.ragu && (
                    <Flag
                      className="
                        absolute
                        top-1
                        right-1
                        h-3
                        w-3
                        fill-current
                      "
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
