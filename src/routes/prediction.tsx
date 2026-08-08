import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { DemoBadge, PageHeader } from "@/components/Chrome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crops, markets } from "@/data/agri";
import { predictPrice, priceHistory } from "@/services/agriService";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "AI Crop Price Prediction — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Forecast crop prices for the next 7, 15 or 30 days with confidence scores and a best-time-to-sell recommendation.",
      },
      { property: "og:title", content: "AI Price Prediction — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Model-based price forecasts for Karnataka crops and markets.",
      },
    ],
  }),
  component: PredictionPage,
});

function PredictionPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const [cropId, setCropId] = useState("tomato");
  const [marketId, setMarketId] = useState(loc.location.districtId);
  const [horizon, setHorizon] = useState<7 | 15 | 30>(15);

  const forecast = useMemo(
    () => predictPrice({ cropId, marketId, days: horizon }),
    [cropId, marketId, horizon],
  );

  const chartData = useMemo(() => {
    const past = priceHistory(cropId, marketId, 21).map((h) => ({
      date: h.date.slice(5),
      actual: h.price,
    }));
    const future = forecast.points.map((p) => ({
      date: p.date.slice(5),
      forecast: p.price,
      low: p.low,
      high: p.high,
    }));
    if (past.length && future.length) {
      const last = past[past.length - 1]!;
      (last as Record<string, unknown>)["forecast"] = last.actual;
    }
    return [...past, ...future];
  }, [cropId, marketId, forecast]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("prediction.title")} subtitle={t("prediction.subtitle")} />
      <DemoBadge />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-crop">{t("markets.selectCrop")}</Label>
          <Select value={cropId} onValueChange={setCropId}>
            <SelectTrigger id="p-crop">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {crops.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {pick(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-mkt">{t("common.market")}</Label>
          <Select value={marketId} onValueChange={setMarketId}>
            <SelectTrigger id="p-mkt">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {markets.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {pick(m.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-h">{t("prediction.horizon")}</Label>
          <Select
            value={String(horizon)}
            onValueChange={(v) => setHorizon(Number(v) as 7 | 15 | 30)}
          >
            <SelectTrigger id="p-h">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("prediction.days7")}</SelectItem>
              <SelectItem value="15">{t("prediction.days15")}</SelectItem>
              <SelectItem value="30">{t("prediction.days30")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("prediction.expected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(forecast.expected, locale)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(forecast.rangeLow, locale)} –{" "}
              {formatCurrency(forecast.rangeHigh, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("prediction.confidence")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">{forecast.confidence}%</p>
            <Progress value={forecast.confidence} />
          </CardContent>
        </Card>
        <Card className="border-primary/40 bg-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" aria-hidden />
              {t("prediction.bestTime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{forecast.bestSellDate}</p>
            <p className="text-sm text-muted-foreground">{pick(forecast.advice)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("prediction.chartTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={45} />
              <RTooltip formatter={(v: number) => formatCurrency(v, locale)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                name={t("prediction.actual")}
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name={t("prediction.forecast")}
                stroke="var(--color-chart-3)"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="low"
                name={t("prediction.low")}
                stroke="var(--color-chart-4)"
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="high"
                name={t("prediction.high")}
                stroke="var(--color-chart-5)"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("prediction.factors")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {forecast.factors.map((f, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <p className="font-medium">{pick(f.label)}</p>
              <p className="text-sm text-muted-foreground">{f.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
