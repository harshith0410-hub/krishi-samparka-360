import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, CloudRain, Droplets, Sun, Thermometer, Wind } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useFarmLocation } from "@/hooks/useFarmLocation";
import { LocationPicker } from "@/components/LocationPicker";
import { DemoBadge, PageHeader } from "@/components/Chrome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeather } from "@/services/agriService";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Farm Weather & Advisories — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Local temperature, humidity, wind, rainfall probability, UV index, a 7-day outlook and agricultural alerts for your farm.",
      },
      { property: "og:title", content: "Weather Intelligence — Krishi Samparka 360" },
      {
        property: "og:description",
        content: "Weather and farm advisories tailored to your district.",
      },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const { t, lang } = useI18n();
  const loc = useFarmLocation();
  const w = useMemo(() => getWeather(loc.location), [loc.location]);

  const metrics = [
    { icon: Thermometer, label: t("weather.temp"), value: `${w.tempC}°C` },
    { icon: Droplets, label: t("weather.humidity"), value: `${w.humidity}%` },
    { icon: Wind, label: t("weather.wind"), value: `${w.windKph} km/h` },
    { icon: CloudRain, label: t("weather.rainChance"), value: `${w.rainChance}%` },
    { icon: CloudRain, label: t("weather.rainfall"), value: `${w.rainfallMm} mm` },
    { icon: Sun, label: t("weather.uv"), value: String(w.uv) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <PageHeader title={t("weather.title")} subtitle={t("weather.subtitle")} />
      <DemoBadge />
      <LocationPicker loc={loc} compact />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m, i) => (
          <Card key={i}>
            <CardContent className="space-y-1 pt-6">
              <m.icon className="size-5 text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {w.alerts.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" aria-hidden />
              {t("weather.alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {w.alerts.map((a) => (
              <p
                key={a.id}
                className={`rounded-xl border p-3 text-sm ${
                  a.severity === "high"
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-sun/50 bg-sun/10"
                }`}
              >
                {lang === "kn" ? a.kn : a.en}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("weather.forecast7")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {w.forecast.map((f) => (
            <div key={f.date} className="rounded-xl border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">{f.date.slice(5)}</p>
              <p className="text-lg font-bold">
                {f.max}° / {f.min}°
              </p>
              <p className="text-xs text-muted-foreground">
                {t("weather.rainChance")}: {f.rainChance}%
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("weather.advice")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("weather.adviceText")}</p>
          <p>{t("weather.verify")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
