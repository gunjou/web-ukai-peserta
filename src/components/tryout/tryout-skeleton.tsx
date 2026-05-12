// component/tryout/tryout-skeleton.tsx
export default function TryoutSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="
            rounded-2xl
            border
            bg-card
            p-5
            animate-pulse
          "
        >
          <div className="h-5 w-1/3 rounded bg-muted" />

          <div className="mt-3 h-4 w-1/2 rounded bg-muted" />

          <div className="mt-5 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>

          <div className="mt-5 h-10 w-32 rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
}
