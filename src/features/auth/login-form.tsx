"use client";

import { useState } from "react";
import Swal from "sweetalert2";

import { Eye, EyeOff, GraduationCap } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { login } from "@/services/auth.service";
import ButtonLoader from "@/components/loading/button-loader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    platform: "web",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await login(form);

      setAuth(result.data.access_token, result.data.refresh_token);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang kembali",
        confirmButtonColor: "#b0550d",
        background: "var(--card)",
        color: "var(--foreground)",
      });

      console.log(result);

      // nanti redirect dashboard
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: (error as Error).message,
        confirmButtonColor: "#a11d1d",
        background: "var(--card)",
        color: "var(--foreground)",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      className="
        w-full
        max-w-md
        rounded-3xl
        border
        bg-card/80
        backdrop-blur
        shadow-xl
      "
    >
      <div className="flex flex-col gap-8 p-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
            "
          >
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">UKAI Syndrome</h1>

            <p className="text-sm text-muted-foreground">
              Login untuk melanjutkan pembelajaran
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>

            <Input
              type="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="
                h-11
                rounded-xl
              "
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="
                  h-11
                  rounded-xl
                  pr-12
                "
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="
              mt-2
              h-11
              rounded-xl
              bg-primary
              text-primary-foreground
              hover:bg-primary/90
            "
          >
            {loading ? <ButtonLoader /> : "Masuk"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
