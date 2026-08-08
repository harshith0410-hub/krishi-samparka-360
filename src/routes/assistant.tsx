import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { DemoBadge, PageHeader } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { crops } from "@/data/agri";
import { calculateBestMarket, predictPrice, priceFor } from "@/services/agriService";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Farm Assistant — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Ask about crop prices, the best market to sell in, or whether to sell now or wait — answered in Kannada or English.",
      },
      { property: "og:title", content: "AI Farm Assistant — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Bilingual answers on prices, markets and selling decisions.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "bot"; text: string };

function AssistantPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: t("assistant.greeting") }]);

  function answer(q: string): string {
    const lower = q.toLowerCase();
    const crop =
      crops.find((c) => lower.includes(c.name.en.toLowerCase()) || q.includes(c.name.kn)) ?? null;
    if (!crop) return t("assistant.noData");

    if (lower.includes("market") || lower.includes("sell") || q.includes("ಮಾರುಕಟ್ಟೆ")) {
      const best = calculateBestMarket({
        cropId: crop.id,
        quantityKg: 500,
        origin: loc.location,
      }).recommended;
      if (!best) return t("assistant.noData");
      return `${pick(crop.name)} → ${pick(best.market.name)} (${best.distanceKm} ${t("common.km")}), ${t(
        "markets.net",
      )}: ${formatCurrency(best.net, locale)} · 500 ${t("common.kg")}`;
    }

    if (lower.includes("wait") || lower.includes("predict") || q.includes("ಕಾಯ")) {
      const p = predictPrice(crop.id, loc.location.districtId, 15);
      return `${pick(crop.name)}: ${formatCurrency(p.currentPrice, locale)} → ${formatCurrency(
        p.predictedPrice,
        locale,
      )} (${p.changePct}%), ${t("common.confidence")}: ${p.confidence}%`;
    }

    const price = priceFor(crop.id, loc.location.districtId);
    return price === null
      ? t("assistant.noData")
      : `${pick(crop.name)}: ${formatCurrency(price, locale)}${t("common.perKg")}`;
  }

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }, { role: "bot", text: answer(q) }]);
    setInput("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <PageHeader title={t("assistant.title")} subtitle={t("assistant.subtitle")} />
      <DemoBadge />

      <Card>
        <CardContent className="space-y-3 pt-6">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && <Bot className="mt-1 size-5 shrink-0 text-primary" aria-hidden />}
              <p
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {([1, 2, 3] as const).map((n) => (
          <Button
            key={n}
            variant="outline"
            size="sm"
            onClick={() => send(t(`assistant.suggest${n}` as "assistant.suggest1"))}
          >
            {t(`assistant.suggest${n}` as "assistant.suggest1")}
          </Button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("assistant.placeholder")}
          aria-label={t("assistant.placeholder")}
        />
        <Button type="submit">
          <Send className="size-4" aria-hidden /> {t("assistant.send")}
        </Button>
      </form>
    </div>
  );
}
