import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isolateIdentityCache } from '@/lib/auth-cache';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let disposed = false;
    let identity: string | null = null;
    let authEventSeen = false;
    let pending = Promise.resolve();
    function applySession(nextUser: User | null, event: string) {
      pending = pending.then(async () => {
        if (disposed) return;
        const nextIdentity = nextUser?.id ?? null;
        // Clear even on INITIAL_SESSION after a public/protected tree remount:
        // a different account must never inherit the previous account's cache.
        await isolateIdentityCache(queryClient, identity, nextIdentity);
        if (disposed) return;
        identity = nextIdentity;
        setUser(nextUser);
        setLoading(false);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          await router.invalidate();
          if (event !== 'SIGNED_OUT') await queryClient.invalidateQueries();
        }
      });
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      authEventSeen = true;
      // Leave the auth callback before doing asynchronous query/router work.
      queueMicrotask(() => applySession(session?.user ?? null, event));
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!authEventSeen) applySession(session?.user ?? null, 'INITIAL_SESSION');
    });
    return () => { disposed = true; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  return createElement(AuthContext.Provider, { value: { user, loading } }, children);
}
export function useAuth() { return useContext(AuthContext); }
