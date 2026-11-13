import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function AccountButton() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleAccount() {
    if (busy) return;
    setBusy(true);
    try {
      if (user) {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error("Sign-out failed. Please try again.");
        toast("Signed out", { description: "Your session has been ended." });
      } else {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          toast("Sign-in was not completed", { description: "Please try Google sign-in again." });
        }
      }
    } catch (error) {
      toast("Account request failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleAccount}
      disabled={busy || loading}
      title={user ? `Signed in as ${user.email}` : "Sign in using Google only"}
      aria-busy={busy || loading}
      className="h-auto w-[147px] shrink-0 rounded-[10px] border border-ink bg-ink p-3 text-sm font-normal leading-[21px] text-primary-foreground hover:bg-ink"
    >
      {busy ? "Please wait…" : user ? "Sign out" : "Google sign in"}
    </Button>
  );
}
