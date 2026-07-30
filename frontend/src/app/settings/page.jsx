// app/settings/page.jsx
// No user/profile/auth backend exists yet.
// Hardcoded defaults removed; form is UI-only with a "coming soon" notice.

"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notifyOnConflict, setNotifyOnConflict] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    // No profile API exists yet — save to local state only and show notice.
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setIsSaving(false);
    toast({
      title: "Preferences saved locally",
      description: "Profile sync is coming soon — these settings aren't persisted to a server yet.",
      variant: "info",
    });
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-2xl">
        {/* Coming soon notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-4">
          <Icon name="construction" size={18} className="mt-0.5 shrink-0 text-primary" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">Profile sync is coming soon.</span>{" "}
            No user authentication backend exists yet. Changes made here are local to this session only.
          </p>
        </div>

        <div className="glass-card rounded-xl p-8">
          <form className="space-y-8" onSubmit={handleSave}>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="person" size={16} className="text-primary" />
                <h3 className="font-label-caps text-label-caps tracking-[0.2em] text-primary">
                  PROFILE
                </h3>
              </div>
              <Input
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </section>

            <section className="space-y-4 border-t border-outline-variant pt-8">
              <div className="flex items-center gap-2">
                <Icon name="notifications" size={16} className="text-primary" />
                <h3 className="font-label-caps text-label-caps tracking-[0.2em] text-primary">
                  NOTIFICATIONS
                </h3>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Notify me on new conflicts
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    Get an alert whenever a submitted scene flags a continuity conflict.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnConflict}
                  onChange={(e) => setNotifyOnConflict(e.target.checked)}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>
            </section>

            <div className="flex justify-end border-t border-outline-variant/30 pt-6">
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
