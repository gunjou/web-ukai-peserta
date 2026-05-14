interface Props {
  current: number;
  total: number;
}

export default function TryoutHeader({ current, total }: Props) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        bg-card
        px-6
        py-4
      "
    >
      <div>
        <h1 className="text-lg font-semibold">Pengerjaan Tryout</h1>

        <p className="text-sm text-muted-foreground">
          Soal {current} dari {total}
        </p>
      </div>

      <div
        className="
          rounded-xl
          bg-primary/10
          px-4 py-2
          text-sm
          font-medium
          text-primary
        "
      >
        Sedang Berlangsung
      </div>
    </div>
  );
}
