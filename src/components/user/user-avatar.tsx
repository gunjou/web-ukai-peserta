// components/user/user-avatar.tsx
"use client";

import { getInitials } from "@/lib/get-initials";

interface Props {
  name?: string;
}

export default function UserAvatar({ name }: Props) {
  const initials = getInitials(name || "");

  return (
    <div
      className="
        h-10 w-10
        rounded-full
        bg-primary/10
        text-primary
        flex items-center justify-center
        font-semibold
        text-sm
      "
    >
      {initials}
    </div>
  );
}
