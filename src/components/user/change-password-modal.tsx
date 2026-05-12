// components/user/change-password-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { changePassword } from "@/services/user.service";
import { getAccessToken } from "@/lib/auth";
import Swal from "sweetalert2";
import { Eye, EyeOff, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Semua field wajib diisi",
        timer: 1500,
      });
    }

    if (newPassword !== confirmPassword) {
      return await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Konfirmasi password tidak sama",
        timer: 1500,
      });
    }

    try {
      setLoading(true);

      const token = getAccessToken();
      if (!token) return;

      await changePassword(
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        token,
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1000,
        text: "Password berhasil diubah",
        confirmButtonColor: "#d38c0e",
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      onClose();
    } catch (e: unknown) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          typeof e === "object" && e !== null && "message" in e
            ? String((e as { message: string }).message)
            : "Terjadi kesalahan",
        confirmButtonColor: "#a11d1d",
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  }

  function inputPassword({
    value,
    onChange,
    show,
    toggle,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    toggle: () => void;
    placeholder: string;
  }) {
    return (
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-md p-2 pr-10"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
          {/* CUSTOM CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              absolute right-4 top-4
              p-2 rounded-md
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
              transition
              cursor-pointer
            "
          >
            <X className="w-5 h-5" />
          </button>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {inputPassword({
            value: oldPassword,
            onChange: setOldPassword,
            show: showOld,
            toggle: () => setShowOld(!showOld),
            placeholder: "Password Lama",
          })}

          {inputPassword({
            value: newPassword,
            onChange: setNewPassword,
            show: showNew,
            toggle: () => setShowNew(!showNew),
            placeholder: "Password Baru",
          })}

          {inputPassword({
            value: confirmPassword,
            onChange: setConfirmPassword,
            show: showConfirm,
            toggle: () => setShowConfirm(!showConfirm),
            placeholder: "Konfirmasi Password Baru",
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
