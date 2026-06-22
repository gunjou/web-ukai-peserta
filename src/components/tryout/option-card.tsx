"use client";

interface Props {
  option: string;
  text: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionCard({ option, text, selected, onPress }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`
        group
        w-full
        rounded-xl
        border
        text-left
        transition-all
        duration-150

        hover:shadow-sm

        ${
          selected
            ? `
              border-primary
              bg-primary/5
              shadow-sm
            `
            : `
              border-border
              bg-card
              hover:border-primary/40
              hover:bg-muted/30
            `
        }
      `}
    >
      {/* Mengurangi padding dari p-5 md:p-6 menjadi p-3 md:p-4 */}
      <div className="flex items-center gap-3 p-3 md:p-4">
        {/* Badge Huruf (Dikecilkan dari h-11 w-11 menjadi h-8 w-8) */}
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-sm
            font-bold
            transition-all

            ${
              selected
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            }
          `}
        >
          {option}
        </div>

        {/* Content Teks Jawaban */}
        <div className="min-w-0 flex-1">
          <div
            className="
              prose
              prose-sm
              md:prose-base
              max-w-none
              dark:prose-invert

              [&_img]:max-w-[150px]
              [&_img]:h-auto
              [&_img]:object-contain
              [&_img]:rounded-md
              [&_table]:block
              [&_table]:overflow-x-auto
              [&_table]:whitespace-nowrap

              [&_p]:m-0
              [&_p]:leading-relaxed
            "
            dangerouslySetInnerHTML={{
              __html: text,
            }}
          />
        </div>
      </div>
    </button>
  );
}
