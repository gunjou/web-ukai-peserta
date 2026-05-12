// components/user/user-menu.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import UserAvatar from "./user-avatar";
import ProfileModal from "./profile-modal";
import ChangePasswordModal from "./change-password-modal";

import { getAccessToken, clearAuth, clearUser } from "@/lib/auth";
import { getMe } from "@/services/user.service";

import type { User } from "@/types/user";
import Swal from "sweetalert2";

export default function UserMenu() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const res = await getMe(token);
        setUser(res.data as User);
      } catch (e) {
        console.error(e);
      }
    }

    fetchUser();
  }, []);

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Yakin ingin logout?",
      text: "Anda akan keluar dari sesi saat ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d38c0e",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    clearAuth();
    clearUser();

    await Swal.fire({
      icon: "success",
      title: "Logout berhasil",
      timer: 1000,
      showConfirmButton: false,
    });

    router.replace("/login");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="outline-none cursor-pointer">
            <UserAvatar name={user?.name} />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => setOpenProfile(true)}
            className="cursor-pointer transition-colors data-[highlighted]:bg-primary data-[highlighted]:text-white"
          >
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenPassword(true)}
            className="cursor-pointer transition-colors data-[highlighted]:bg-primary data-[highlighted]:text-white"
          >
            Ubah Password
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer transition-colors data-[highlighted]:bg-primary data-[highlighted]:text-white"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        user={user}
      />

      <ChangePasswordModal
        open={openPassword}
        onClose={() => setOpenPassword(false)}
      />
    </>
  );
}
