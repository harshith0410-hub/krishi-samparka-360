import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Star, Tractor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { PageHeader, EmptyState } from "@/components/Chrome";
import { MapPanel } from "@/components/MapPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HOURS,
  categoryLabel,
  costBreakdown,
  fmtTime,
  hhmm,
  todayISO,
} from "@/lib/equipment";
import { useAvailability, useEquipmentRealtime, useListing } from "@/lib/equipmentQueries";

export const Route = createFileRoute("/equipment/$id")({
  head: () => ({
    meta: [
      { title: "Equipment details — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "See rental price, availability, condition, delivery and operator options for this farm machine, then send a rental request.",
      },
      { property: "og:title", content: "Equipment details — Krishi Samparka 360" },
      { property: "og:description", content: "Check availability and request this farm machine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EquipmentDetail,
});

function EquipmentDetail() {
  const { id } = Route.useParams();
  const { t, pick, locale } = useI18n();
  const { userId } = useAuth();
  const navigate = useNavigate();
  useEquipmentRealtime();

  const { data: listing, isLoading } = useListing(id);
  const [date, setDate] = useState(todayISO());
  const { data: slots } = useAvailability(id, date);
  const [startHour, setStartHour] = useState(8);
  const [hours, setHours] = useState(4);
  const [delivery, setDelivery] = useState(false);
  const [operator, setOperator] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return <Skeleton className="m-4 h-96 rounded-2xl" />;
  if (!listing)
    return (
      <div className="mx-auto max-w-3xl p-6">
        <EmptyState message={t("common.empty")} />
      </div>
    );

  const isOwner = userId === listing.owner_id;
  const cost = costBreakdown({
    hourlyRate: Number(listing.price_per_hour),
    hours,
    delivery,
    deliveryFee: Number(listing.delivery_fee),
    operator,
    operatorFee: Number(listing.operator_fee),
    deposit: Number(listing.security_deposit),
  });

  async function submit() {
    if (!listing) return;
    if (!userId) {
      navigate({ to: "/auth", search: { redirect: `/equipment/${id}` } });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("equipment_bookings").insert({
      equipment_id: listing.id,
      owner_id: listing.owner_id,
      farmer_id: userId,
      booking_date: date,
      start_time: hhmm(startHour),
      end_time: hhmm(startHour + hours),
      duration_hours: hours,
      hourly_rate: Number(listing.price_per_hour),
      rental_amount: cost.rental,
      delivery_fee: cost.delivery,
      operator_fee: cost.operator,
      security_deposit: cost.deposit,
      total_amount: cost.total,
      need_delivery: delivery,
      need_operator: operator,
      notes: notes.slice(0, 500),
      status: "PENDING",
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("SLOT_UNAVAILABLE")
          ? t("eq.slotUnavailable")
          : error.message.includes("OWN_EQUIPMENT")
            ? t("eq.ownEquipment")
            : error.message,
      );
      return;
    }
    toast.success(t("eq.requestSent"));
    navigate({ to: "/my-rentals" });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <PageHeader
        title={listing.name}
        subtitle={`${pick(categoryLabel(listing.category))}${listing.brand ? ` · ${listing.brand}` : ""}${listing.model ? ` ${listing.model}` : ""}`}
      />

      {listing.images.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {listing.images.map((im) => (
            <img
              key={im.id}
              src={im.url}
              alt={`${listing.name} ${im.label}`}
              loading="lazy"
              className="h-36 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl bg-muted">
          <Tractor className="size-10 text-muted-foreground" aria-hidden />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-2xl font-bold">
              {formatCurrency(Number(listing.price_per_hour), locale)}
              <span className="text-base font-normal text-muted-foreground"> / hour</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label={t("eq.pricePerDay")} value={formatCurrency(Number(listing.price_per_day), locale)} />
              <Info label={t("eq.halfDay")} value={formatCurrency(Number(listing.half_day_price), locale)} />
              <Info label={t("eq.deposit")} value={formatCurrency(Number(listing.security_deposit), locale)} />
              <Info label={t("eq.condition")} value={t(`eq.cond.${listing.condition}` as "eq.cond.GOOD")} />
              <Info
                label={t("eq.deliveryAvailable")}
                value={listing.delivery_available ? formatCurrency(Number(listing.delivery_fee), locale) : "—"}
              />
              <Info
                label={t("eq.operatorAvailable")}
                value={listing.operator_available ? formatCurrency(Number(listing.operator_fee), locale) : "—"}
              />
              <Info label={t("eq.fuelIncluded")} value={listing.fuel_included ? "✓" : "—"} />
              <Info label={t("eq.maintenanceIncluded")} value={listing.maintenance_included ? "✓" : "—"} />
            </div>
            {listing.description && <p className="text-sm text-muted-foreground">{listing.description}</p>}
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden /> {listing.village ? `${listing.village}, ` : ""}
              {listing.taluk ? `${listing.taluk}, ` : ""}
              {listing.district}
            </p>
            <p className="text-xs text-muted-foreground">{t("eq.approxLocation")}</p>
            <p className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-sun text-sun" aria-hidden />
              {(listing.owner?.rating ?? 5).toFixed(1)} · {listing.owner?.full_name || t("eq.owner")}
            </p>
            <MapPanel
              center={{ lat: listing.latitude, lng: listing.longitude }}
              points={[
                {
                  id: listing.id,
                  type: "equipment",
                  lat: listing.latitude,
                  lng: listing.longitude,
                  title: listing.name,
                  subtitle: listing.district,
                },
              ]}
              height={220}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-semibold">{t("eq.request")}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="d">{t("eq.date")}</Label>
              <Input id="d" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>{t("eq.startTime")}</Label>
                <Select value={String(startHour)} onValueChange={(v) => setStartHour(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {fmtTime(hhmm(h))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("eq.duration")}</Label>
                <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(slots ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(slots ?? []).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {fmtTime(s.start_time)}–{fmtTime(s.end_time)}{" "}
                    {t(`eq.slot.${s.status}` as "eq.slot.BOOKED")}
                  </span>
                ))}
              </div>
            )}

            {listing.delivery_available && (
              <div className="flex items-center gap-3">
                <Switch id="dl" checked={delivery} onCheckedChange={setDelivery} />
                <Label htmlFor="dl">{t("eq.needDelivery")}</Label>
              </div>
            )}
            {listing.operator_available && (
              <div className="flex items-center gap-3">
                <Switch id="op" checked={operator} onCheckedChange={setOperator} />
                <Label htmlFor="op">{t("eq.needOperator")}</Label>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nt">{t("eq.notes")}</Label>
              <Textarea id="nt" value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="rounded-xl border border-border p-3 text-sm">
              <p className="mb-2 font-semibold">{t("eq.costBreakdown")}</p>
              <Row label={`${t("eq.rental")} (${hours}h)`} value={formatCurrency(cost.rental, locale)} />
              {cost.delivery > 0 && <Row label={t("eq.delivery")} value={formatCurrency(cost.delivery, locale)} />}
              {cost.operator > 0 && <Row label={t("eq.operator")} value={formatCurrency(cost.operator, locale)} />}
              {cost.deposit > 0 && <Row label={t("eq.deposit")} value={formatCurrency(cost.deposit, locale)} />}
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
                <span>{t("eq.total")}</span>
                <span>{formatCurrency(cost.total, locale)}</span>
              </div>
            </div>

            {isOwner ? (
              <p className="text-sm text-muted-foreground">{t("eq.ownEquipment")}</p>
            ) : (
              <Button className="w-full" onClick={submit} disabled={busy}>
                {t("eq.request")}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">{t("eq.needTransport")}</p>
            <Button asChild size="sm" variant="ghost">
              <Link to="/services">{t("eq.findTransport")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
