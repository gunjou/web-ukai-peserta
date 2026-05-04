"use client";

import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import UserAvatar from "./user-avatar";
import { getAccessToken, clearAuth } from "@/lib/auth";

import { getMe } from "@/services/user.service";
import { useEffect, useState } from "react";

export default function UserMenu() {
  const router = useRouter();

  const [user, setUser] = useState<null | {
    name: string;
    email: string;
  }>(null);

  useEffect(() => {
    async function fetchUser() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const res = await getMe(token);
        setUser(res.data);
      } catch (e) {
        console.error(e);
      }
    }

    fetchUser();
  }, []);

  function handleLogout() {
    clearAuth(); // 🔥 hapus token

    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none">
          <UserAvatar name={user?.name} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {/* PROFILE (DISABLED) */}
        <DropdownMenuItem disabled>Profile</DropdownMenuItem>

        {/* LOGOUT */}
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
