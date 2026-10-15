import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    const isDemoAuthed = localStorage.getItem("demo_auth_user") === "true";

    // If neither real session nor demo session exists, redirect to auth
    if (!data.session && !isDemoAuthed) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  },
});
