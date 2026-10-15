import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Fallback demo user ID for local testing
        setUserId("demo-farmer-id-123");
      }
      setIsLoading(false);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId("demo-farmer-id-123");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isDemoAuthed = typeof window !== "undefined" && localStorage.getItem("demo_auth_user") === "true";

  return {
    userId,
    isAuthenticated: !!userId || isDemoAuthed,
    isLoading,
  };
}