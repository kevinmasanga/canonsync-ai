// app/login/page.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: replace with real authApi.login(...) call
    await new Promise((r) => setTimeout(r, 700));

    setIsSubmitting(false);
    toast({
      title: "Welcome back",
      description: "You're logged in to CanonSync AI.",
      variant: "success",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-gutter">
      <div className="ambient-glow" />

      <main className="relative z-10 flex w-full flex-col items-center">
        {/* Brand */}
        <div className="animate-fade-in mb-stack-loose flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low shadow-sm">
            <span className="select-none text-4xl font-bold text-primary">C</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-background">CanonSync AI</h1>
          <p className="mt-1 font-body-md text-body-md tracking-wide text-on-surface-variant">
            Continuity, checked.
          </p>
        </div>

        {/* Card */}
        <div className="auth-card w-full max-w-[420px] rounded-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="writer@production-studio.com"
                className="input-etched w-full rounded-lg px-4 py-3 font-body-md text-on-surface placeholder-on-tertiary-fixed-variant"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] font-semibold text-primary transition-colors hover:text-primary-container"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-etched w-full rounded-lg px-4 py-3 font-body-md text-on-surface placeholder-on-tertiary-fixed-variant"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-tertiary-fixed-variant transition-colors hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "visibility" : "visibility_off"} size={20} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-bold text-on-primary-container transition-all hover:bg-primary-container/90 active:scale-[0.98] disabled:opacity-60"
              >
                <span className="font-headline-sm text-headline-sm">
                  {isSubmitting ? "Logging in…" : "Log In"}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-outline-variant/30 pt-6 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don&rsquo;t have an account?{" "}
              <Link
                href="/register"
                className="ml-1 font-bold text-primary underline-offset-4 decoration-primary/30 transition-all hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-label-caps text-[10px] uppercase tracking-[0.2em] text-on-tertiary-fixed-variant">
            v2.4.0 Forensic Build
          </p>
        </div>
      </main>
    </div>
  );
}