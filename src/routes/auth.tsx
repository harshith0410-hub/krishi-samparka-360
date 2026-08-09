import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/i18n/I18nProvider";
import { PageHeader } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Sign in to rent farm equipment near you or list your own machinery for rent on Krishi Samparka 360.",
      },
      { property: "og:title", content: "Sign in — Krishi Samparka 360" },
      { property: "og:description", content: "One account to rent and rent out farm equipment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/equipment";
  return value;
}

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const target = safePath(search.redirect);

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + target,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) navigate({ to: target });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: target });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(String(result.error));
      return;
    }
    if (result.redirected) return;
    navigate({ to: target });
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <PageHeader title={t("auth.title")} subtitle={t("auth.subtitle")} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Button variant="secondary" className="w-full" onClick={google}>
            {t("auth.google")}
          </Button>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-card px-2">—</span>
          </div>
          <form className="space-y-3" onSubmit={submit}>
            {mode === "up" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("auth.phone")}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    maxLength={20}
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
          </form>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? `${t("auth.noAccount")} ${t("auth.signUp")}` : `${t("auth.haveAccount")} ${t("auth.signIn")}`}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
