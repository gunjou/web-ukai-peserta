import { Inbox } from "lucide-react";

interface Props {
  title: string;

  description?: string;
}

export default function EmptyState({ title, description }: Props) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        bg-card
        px-6
        py-16
        text-center
      "
    >
      {/* Icon */}
      <div
        className="
          mb-5
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-primary/10
          text-primary
        "
      >
        <Inbox className="h-8 w-8" />
      </div>

      {/* Title */}
      <h3
        className="
          text-lg
          font-semibold
        "
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="
            mt-2
            max-w-md
            text-sm
            text-muted-foreground
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}
