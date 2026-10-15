import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
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
import { PageHeader } from "@/components/Chrome";
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
import { predictPrice } from "@/services/agriService";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "AI Crop Price Prediction — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Forecast crop prices for tomorrow, 7, 15, 30 days or 3 months with confidence scores and a suggested selling window.",
      },
      { property: "og:title", content: "AI Price Prediction — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Trend, season and arrival based price forecasts for Karnataka crops and markets.",
      },
    ],
  }),
  component: PredictionPage,
});

const PERIODS = [
  { days: 1, key: "predict.p1" },
  { days: 7, key: "predict.p7" },
  { days: 15, key: "predict.p15" },
  { days: 30, key: "predict.p30" },
  { days: 90, key: "predict.p90" },
] as const;

function PredictionPage() {
  const { t, pick, locale } = useI18n();
  const loc = useFarmLocation();
  const [cropId, setCropId] = useState("tomato");
  const [marketId, setMarketId] = useState(loc.location.districtId);
  const [days, setDays] = useState(15);

  const p = useMemo(() => predictPrice(cropId, marketId, days), [cropId, marketId, days]);
  const chartData = useMemo(
    () => p.series.map((s) => ({ ...s, date: s.date.slice(5) })),
    [p.series],
  );

  const TrendIcon = p.trend === "rising" ? TrendingUp : p.trend === "falling" ? TrendingDown : Minus;
  const trendLabel =
    p.trend === "rising" ? t("common.rising") : p.trend === "falling" ? t("common.falling") : t("common.stable");
  const cropName = pick(crops.find((c) => c.id === cropId)!.name);
  const marketName = pick(markets.find((m) => m.id === marketId)?.name ?? { en: "", kn: "" });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("predict.title")} subtitle={t("predict.subtitle")} />
      

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
          <Label htmlFor="p-h">{t("predict.period")}</Label>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger id="p-h">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((x) => (
                <SelectItem key={x.days} value={String(x.days)}>
                  {t(x.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("predict.current")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(p.currentPrice, locale)}
              <span className="text-sm font-normal text-muted-foreground">{t("common.perKg")}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("predict.predicted")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(p.predictedPrice, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("predict.change")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`flex items-center gap-2 text-3xl font-bold ${
                p.trend === "rising"
                  ? "text-success"
                  : p.trend === "falling"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              <TrendIcon className="size-6" aria-hidden />
              {p.changePct > 0 ? "+" : ""}
              {p.changePct}%
            </p>
            <p className="text-sm text-muted-foreground">{trendLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.confidence")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold">{p.confidence}%</p>
            <Progress value={p.confidence} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {cropName} — {marketName}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={16} />
              <YAxis tick={{ fontSize: 11 }} width={45} />
              <RTooltip formatter={(v: number) => formatCurrency(v, locale)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                name={t("predict.chartActual")}
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name={t("predict.chartForecast")}
                stroke="var(--color-chart-3)"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/40 bg-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" aria-hidden /> {t("predict.window")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold">
              {p.trend === "rising"
                ? `${Math.max(1, Math.round(p.windowDays * 0.6))}–${p.windowDays} ${t("predict.p7").replace(/[0-9]+ /, "")}`
                : t("predict.p1")}
            </p>
            <p className="text-sm text-muted-foreground">{t("predict.disclaimer")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("predict.explanation")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("predict.subtitle")}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
