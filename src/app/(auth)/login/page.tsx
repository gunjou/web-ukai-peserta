// FILE: src/app/(auth)/login/page.tsx

"use client";

import { useEffect, useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import Swal from "sweetalert2";
import Image from "next/image";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { useUserStore } from "@/stores/user.store";
import { getMe } from "@/services/user.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const { setAuth } = useAuthStore();
  const setUser = useUserStore((s) => s.setUser);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await login({
        email,
        password,
        platform: "web",
      });

      setAuth(result.data.access_token, result.data.refresh_token);

      try {
        const userRes = await getMe(result.data.access_token);
        setUser(userRes.data);
      } catch (e) {
        console.error("Failed fetch user:", e);
      }

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang kembali",
        confirmButtonColor: "#b0550d",
        background: "#2b0f0f",
        color: "#ffffff",
        timer: 1000,
      });

      setTimeout(() => {
        router.push("/dashboard/modul-materi");
      }, 1000);

      // nanti redirect
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: (error as Error).message || "Terjadi kesalahan",
        confirmButtonColor: "#a11d1d",
        background: "#2b0f0f",
        color: "#ffffff",
        timer: 1500,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      router.replace("/dashboard/modul-materi");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-gradient-to-br
        from-[var(--brand-maroon)]
        via-[var(--brand-maroon-secondary)]
        to-[var(--brand-dark)]
        px-5
        py-10
      "
    >
      {/* Background Glow */}
      <div
        className="
          absolute
          left-[-120px]
          top-[-120px]
          h-[300px]
          w-[300px]
          rounded-full
          bg-[var(--brand-gold)]/20
          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-150px]
          right-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-red-900/20
          blur-3xl
        "
      />

      {/* Loading Overlay */}
      <div
        className={`
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/40 backdrop-blur-md
          transition-all duration-300
          ${loading ? "opacity-100 visible" : "invisible opacity-0"}
        `}
      >
        <div
          className="
            h-14
            w-14
            rounded-full
            border-4
            border-[var(--brand-gold)]
            border-t-transparent
            animate-spin
          "
        />
      </div>

      {/* Login Card */}
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border border-white/10
          bg-white/8
          p-8
          shadow-[0_0_40px_rgba(0,0,0,0.35)]
          backdrop-blur-xl
        "
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="
              mb-4
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              bg-[var(--brand-gold)]/15
              ring-1 ring-[var(--brand-gold)]/30
            "
          >
            <Image
              src="/images/logo_syndrome.svg"
              alt="UKAI Syndrome"
              width={65}
              height={65}
              className="object-contain"
            />
          </div>

          <h1
            className="
              text-center
              text-3xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Selamat Datang
          </h1>

          <p
            className="
              mt-2
              text-center
              text-sm
              text-white
            "
          >
            Login untuk melanjutkan pembelajaran
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Email
            </label>

            <input
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                h-12
                w-full
                rounded-xl
                border border-white/15
                bg-white/10
                px-4
                text-white
                outline-none
                transition-all
                focus:border-[var(--brand-gold)]
                focus:ring-2
                focus:ring-[var(--brand-gold)]/30
              "
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  h-12
                  w-full
                  rounded-xl
                  border border-white/15
                  bg-white/10
                  px-4
                  pr-12
                  text-white
                  outline-none
                  transition-all
                  focus:border-[var(--brand-gold)]
                  focus:ring-2
                  focus:ring-[var(--brand-gold)]/30
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  transition-colors
                  hover:text-white
                "
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white" />
                ) : (
                  <Eye className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Remember */}
          <label
            className="
              flex
              items-center
              gap-2
              text-sm
              text-white
            "
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="
                h-4
                w-4
                accent-[var(--brand-gold)]
              "
            />
            Ingat saya
          </label>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-[var(--brand-gold)]
              to-yellow-600
              text-base
              font-semibold
              text-white
              shadow-lg
              transition-all
              hover:scale-[1.02]
              hover:shadow-xl
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="
            mt-6
            text-center
            text-sm
            leading-relaxed
            text-white
          "
        >
          Belum punya akun?
          <br />
          Hubungi admin untuk mendapatkan akses.
        </p>
      </div>
    </main>
  );
}
