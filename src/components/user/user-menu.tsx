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

import { getAccessToken, clearAuth } from "@/lib/auth";
import { getMe } from "@/services/user.service";

import type { User } from "@/types/user";

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

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none">
            <UserAvatar name={user?.name} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setOpenProfile(true)}>
            Profile
          </DropdownMenuItem>

          {/* <DropdownMenuItem onClick={() => setOpenPassword(true)}>
            Ubah Password
          </DropdownMenuItem> */}

          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
