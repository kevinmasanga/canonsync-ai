// app/register/page.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

const ROLES = [
  { value: "story_editor", label: "Story Editor" },
  { value: "staff_writer", label: "Staff Writer" },
];

export default function RegisterPage() {
  const { toast } = useToast();
  const [role, setRole] = useState("story_editor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirm = formData.get("confirm");

    if (password !== confirm) {
      toast({
        title: "Passwords don't match",
        description: "Double check both password fields and try again.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    // TODO: replace with real authApi.register(...) call
    await new Promise((r) => setTimeout(r, 700));
    setIsSubmitting(false);

    toast({
      title: "Account created",
      description: "Welcome to CanonSync AI.",
      variant: "success",
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-gutter">
      <div className="ambient-glow" />

      <main className="relative z-10 w-full max-w-md">
        <div className="auth-card rounded-xl p-8 md:p-10">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
              <Icon name="edit_note" />
            </div>
            <h1 className="mb-2 font-headline-md text-headline-md text-on-surface">
              Join CanonSync AI
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Scale your writers&rsquo; room with automated continuity and cinematic oversight.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="ml-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                Full Name
              </label>
              <div className="relative">
                <Icon
                  name="person"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  className="input-etched w-full rounded-lg py-3 pl-10 pr-4 font-body-md text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                Work Email
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="s.jenkins@studio.com"
                  className="input-etched w-full rounded-lg py-3 pl-10 pr-4 font-body-md text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                Professional Role
              </label>
              <div className="flex rounded-lg border border-outline-variant bg-surface-container-lowest p-1">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex-1 rounded-md px-3 py-2 text-center transition-all ${
                      role === r.value
                        ? "bg-primary-container font-bold text-on-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <span className="font-data-point text-data-point">{r.label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="role" value={role} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <Icon
                    name="lock"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-etched w-full rounded-lg py-3 pl-10 pr-4 font-body-md text-on-surface"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="ml-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Confirm
                </label>
                <div className="relative">
                  <Icon
                    name="key"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                  />
                  <input
                    name="confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-etched w-full rounded-lg py-3 pl-10 pr-4 font-body-md text-on-surface"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-4 font-bold text-on-primary transition-transform active:scale-95 disabled:opacity-60"
            >
              <span className="text-body-lg font-bold">
                {isSubmitting ? "Creating account…" : "Create Account"}
              </span>
              {!isSubmitting && <Icon name="arrow_forward" />}
            </button>
          </form>

          <div className="mt-8 border-t border-outline-variant pt-6 text-center">
            <p className="font-body-md text-on-surface-variant">
              Already have a seat?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 px-8 text-center font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant/40">
          Secured by enterprise-grade encryption. All story data remains the property of the
          production house.
        </p>
      </main>
    </div>
  );
}