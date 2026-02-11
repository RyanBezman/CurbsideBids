import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type UseAppSessionOptions = {
  onAuthStateChange?: (session: Session | null) => void;
};

export function useAppSession({ onAuthStateChange }: UseAppSessionOptions = {}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      onAuthStateChange?.(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthStateChange]);

  return { user, setUser };
}
