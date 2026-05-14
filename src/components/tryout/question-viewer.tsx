import { TryoutQuestion } from "@/types/tryout";

interface Props {
  question: TryoutQuestion;
}

export default function QuestionViewer({ question }: Props) {
  return (
    <div className="space-y-6">
      {/* QUESTION */}
      <div
        className="
          prose
          max-w-none
          dark:prose-invert
        "
        dangerouslySetInnerHTML={{
          __html: question.pertanyaan,
        }}
      />

      {/* OPTIONS */}
      <div className="space-y-3">
        {Object.entries(question.pilihan).map(([key, value]) => (
          <button
            key={key}
            className="
                flex
                w-full
                items-start
                gap-3
                rounded-xl
                border
                bg-card
                p-4
                text-left
                transition-all
                hover:border-primary
                hover:bg-primary/5
              "
          >
            <div
              className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  text-sm
                  font-semibold
                "
            >
              {key}
            </div>

            <span>{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
