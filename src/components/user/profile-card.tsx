// components/user/profile-card.tsx
"use client";

import { getInitials } from "@/lib/get-initials";

interface Props {
  user: {
    name: string;
    email: string;
    role: string;
    classes?: {
      id: number;
      name: string;
      batch: string;
    }[];
  };
}

export default function ProfileCard({ user }: Props) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-primary
          text-white
          font-semibold
        "
      >
        {getInitials(user.name)}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-1">
        <p className="font-semibold leading-tight">{user.name}</p>

        <p className="text-sm text-muted-foreground">{user.email}</p>

        <p className="text-xs capitalize text-muted-foreground">
          Role: {user.role}
        </p>

        {/* Class */}
        {user.classes && user.classes.length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            <p className="font-medium">Kelas:</p>
            <p>
              {user.classes[0].name} • {user.classes[0].batch}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
