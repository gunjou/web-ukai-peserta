// components/user/profile-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { User } from "@/types/user";
import { getInitials } from "@/lib/get-initials";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ProfileModal({ open, onClose, user }: Props) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          {/* CUSTOM CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              absolute right-4 top-4
              p-2 rounded-md
              hover:text-muted-foreground
              hover:bg-muted/20
              bg-gray-100/50
              text-foreground
              transition
              cursor-pointer
            "
          >
            <X className="w-5 h-5" />
          </button>
          {/* HEADER */}
          <div className="bg-primary/90 text-white p-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {getInitials(user.name)}
            </div>

            <h2 className="mt-3 text-lg font-semibold">{user.name}</h2>
            <p className="text-sm opacity-80">{user.email}</p>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>

          {user.classes?.[0] && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kelas</span>
                <span className="font-medium">{user.classes[0].name}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Batch</span>
                <span className="font-medium">{user.classes[0].batch}</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
