interface Props {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

export default function QuestionNavigation({
  total,
  current,
  onSelect,
}: Props) {
  return (
    <div
      className="
        grid
        grid-cols-5
        gap-2
      "
    >
      {Array.from({ length: total }).map((_, index) => {
        const active = current === index;

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              text-sm
              font-medium
              transition-all
              cursor-pointer

              ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-card hover:bg-muted"
              }
            `}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
