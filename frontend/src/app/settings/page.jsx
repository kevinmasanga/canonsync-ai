// app/settings/page.jsx

"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("Sarah Jenkins");
  const [email, setEmail] = useState("s.jenkins@studio.com");
  const [notifyOnConflict, setNotifyOnConflict] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    // TODO: replace with a real profile-update API call
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    toast({ title: "Settings saved", variant: "success" });
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-2xl">
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