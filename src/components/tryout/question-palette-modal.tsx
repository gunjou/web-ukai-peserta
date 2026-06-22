"use client";

import { CheckCircle2, XCircle, MinusCircle, Flag, X } from "lucide-react";

import { TryoutQuestion, AnswersMap } from "@/types/tryout";

interface Props {
  visible: boolean;
  onClose: () => void;
  questions: TryoutQuestion[];
  answers: AnswersMap;
  currentIndex: number;

  answeredCount: number;
  raguCount: number;

  onSelect: (index: number) => void;

  mode?: "tryout" | "pembahasan";

  title?: string;
  subtitle?: string;

  statuses?: {
    [key: number]: "benar" | "salah" | "kosong";
  };
}

export default function QuestionPaletteModal({
  visible,
  onClose,
  questions,
  answers,
  currentIndex,
  answeredCount,
  raguCount,
  onSelect,
  mode = "tryout",
  title = "Navigasi Soal",
  subtitle = "Pilih soal yang ingin dibuka",
  statuses = {},
}: Props) {
  if (!visible) return null;

  const unansweredCount = questions.length - answeredCount;

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
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        bg-black/60
        backdrop-blur-sm
        xl:hidden
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-h-[85vh]
          rounded-t-3xl
          border
          bg-card
          p-5
          shadow-2xl
          animate-in
          slide-in-from-bottom-5
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>

            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-xl
              p-2
              transition-colors
              hover:bg-muted
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STATS */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div
            className="
              rounded-2xl
              border
              bg-green-500/5
              p-3
              text-center
            "
          >
            <p className="text-xs text-muted-foreground">Dijawab</p>

            <p className="text-xl font-bold text-green-500">{answeredCount}</p>
          </div>

          <div
            className="
              rounded-2xl
              border
              bg-yellow-500/5
              p-3
              text-center
            "
          >
            <p className="text-xs text-muted-foreground">Ragu</p>

            <p className="text-xl font-bold text-yellow-500">{raguCount}</p>
          </div>

          <div
            className="
              rounded-2xl
              border
              p-3
              text-center
            "
          >
            <p className="text-xs text-muted-foreground">Kosong</p>

            <p className="text-xl font-bold">{unansweredCount}</p>
          </div>
        </div>

        {/* GRID */}
        <div
          className="
            mb-5
            max-h-[45vh]
            overflow-y-auto
            px-1
            py-2
          "
        >
          <div className="grid grid-cols-5 gap-3">
            {questions.map((question, index) => {
              const active = currentIndex === index;

              const answer = answers[question.id];

              return (
                <button
                  key={question.id}
                  onClick={() => {
                    onSelect(index);
                    onClose();
                  }}
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
                      <span>{question.nomor}</span>

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

        {/* LEGEND */}
        <div className="border-t pt-4">
          {mode === "tryout" ? (
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Dijawab</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Ragu</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border bg-background" />
                <span>Belum Dijawab</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Benar</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Salah</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <span>Kosong</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
