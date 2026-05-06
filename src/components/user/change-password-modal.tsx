// components/user/change-password-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { changePassword } from "@/services/user.service";
import { getAccessToken } from "@/lib/auth";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handleSubmit() {
    if (!oldPassword || !newPassword) {
      return Swal.fire("Error", "Semua field wajib diisi", "error");
    }

    try {
      const token = getAccessToken();
      if (!token) return;

      await changePassword(
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        token,
      );

      Swal.fire("Berhasil", "Password berhasil diubah", "success");
      onClose();
    } catch (e: unknown) {
      Swal.fire("Error", (e as Error).message, "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <input
            type="password"
            placeholder="Password Lama"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border rounded-md p-2"
          />

          <input
            type="password"
            placeholder="Password Baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Batal
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Simpan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
