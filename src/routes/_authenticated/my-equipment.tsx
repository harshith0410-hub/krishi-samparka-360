import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, formatCurrency } from "@/i18n/I18nProvider";
import { EmptyState, PageHeader } from "@/components/Chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HOURS, fmtTime, hhmm, todayISO, type BookingRow, type SlotStatus } from "@/lib/equipment";
import { useEquipmentRealtime, useMyEquipment } from "@/lib/equipmentQueries";

export const Route = createFileRoute("/_authenticated/my-equipment")({
  head: () => ({
    meta: [
      { title: "My Equipment — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Manage your listed farm machinery: prices, availability, rental requests, bookings and earnings.",
      },
      { property: "og:title", content: "My Equipment — Krishi Samparka 360" },
      { property: "og:description", content: "Owner dashboard for your rented-out machinery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyEquipmentPage,
});

const BLOCK_STATUSES: SlotStatus[] = ["MAINTENANCE", "OWNER_USE", "UNAVAILABLE", "AVAILABLE"];

function MyEquipmentPage() {
  const { t, locale } = useI18n();
  const { userId } = useAuth();
  const qc = useQueryClient();
  useEquipmentRealtime();

  const { data: mine } = useMyEquipment(userId);
  const { data: bookings } = useQuery({
    enabled: !!userId,
    queryKey: ["bookings", "owner", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_bookings")
        .select("*")
        .eq("owner_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookingRow[];
    },
  });

  const list = mine ?? [];
  const all = bookings ?? [];
  const stats = {
    total: list.length,
    available: list.filter((l) => l.status === "ACTIVE").length,
    booked: new Set(all.filter((b) => b.status === "CONFIRMED" || b.status === "ACTIVE").map((b) => b.equipment_id)).size,
    pending: all.filter((b) => b.status === "PENDING").length,
    completed: all.filter((b) => b.status === "COMPLETED").length,
    earnings: all
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + Number(b.rental_amount) + Number(b.delivery_fee) + Number(b.operator_fee), 0),
  };

  async function setStatus(id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") {
    const { error } = await supabase.from("equipment").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "ARCHIVED" ? t("eq.removed") : t("eq.saved"));
    qc.invalidateQueries({ queryKey: ["equipment"] });
  }

  async function decide(booking: BookingRow, status: "CONFIRMED" | "REJECTED" | "COMPLETED") {
    const { error } = await supabase.from("equipment_bookings").update({ status }).eq("id", booking.id);
    if (error) {
      toast.error(error.message.includes("SLOT_UNAVAILABLE") ? t("eq.slotUnavailable") : error.message);
      return;
    }
    toast.success(t("eq.saved"));
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["availability"] });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <PageHeader title={t("eq.myEquipment")} subtitle={t("eq.subtitle")} />
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/equipment/new">{t("eq.listNew")}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/equipment">{t("eq.rent")}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {(
          [
            [t("eq.stats.total"), String(stats.total)],
            [t("eq.stats.available"), String(stats.available)],
            [t("eq.stats.booked"), String(stats.booked)],
            [t("eq.stats.pending"), String(stats.pending)],
            [t("eq.stats.completed"), String(stats.completed)],
            [t("eq.stats.earnings"), formatCurrency(stats.earnings, locale)],
          ] as const
        ).map(([label, value]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="equipment">
        <TabsList className="flex-wrap">
          <TabsTrigger value="equipment">{t("eq.myEquipment")}</TabsTrigger>
          <TabsTrigger value="requests">{t("eq.requests")}</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="mt-4 space-y-3">
          {list.length === 0 ? (
            <EmptyState message={t("eq.noListings")} />
          ) : (
            list.map((l) => (
              <Card key={l.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">🚜 {l.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(l.price_per_hour), locale)} · {l.district}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {t(`eq.listing.${l.status}` as "eq.listing.ACTIVE")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link to="/equipment/$id" params={{ id: l.id }}>
                        {t("common.details")}
                      </Link>
                    </Button>
                    {l.status === "ACTIVE" ? (
                      <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "PAUSED")}>
                        {t("eq.pause")}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "ACTIVE")}>
                        {t("eq.resume")}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setStatus(l.id, "ARCHIVED")}>
                      {t("eq.remove")}
                    </Button>
                  </div>
                  <AvailabilityEditor equipmentId={l.id} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-3">
          {all.length === 0 ? (
            <EmptyState message={t("common.empty")} />
          ) : (
            all.map((b) => (
              <Card key={b.id}>
                <CardContent className="space-y-2 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {b.booking_date} · {fmtTime(b.start_time)}–{fmtTime(b.end_time)} ({b.duration_hours}h)
                    </p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {t(`eq.status.${b.status}` as "eq.status.PENDING")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("eq.total")}: {formatCurrency(Number(b.total_amount), locale)} ·{" "}
                    {b.need_delivery ? t("eq.delivery") : "—"} / {b.need_operator ? t("eq.operator") : "—"}
                  </p>
                  {b.notes && <p className="text-sm">{b.notes}</p>}
                  <div className="flex flex-wrap gap-2">
                    {b.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => decide(b, "CONFIRMED")}>
                          ✅ {t("eq.accept")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => decide(b, "REJECTED")}>
                          ❌ {t("eq.reject")}
                        </Button>
                      </>
                    )}
                    {(b.status === "CONFIRMED" || b.status === "ACTIVE") && (
                      <Button size="sm" variant="secondary" onClick={() => decide(b, "COMPLETED")}>
                        {t("eq.markComplete")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AvailabilityEditor({ equipmentId }: { equipmentId: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [date, setDate] = useState(todayISO());
  const [from, setFrom] = useState(8);
  const [to, setTo] = useState(12);
  const [status, setStatus] = useState<SlotStatus>("MAINTENANCE");

  const { data: slots } = useQuery({
    queryKey: ["availability", equipmentId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_availability")
        .select("*")
        .eq("equipment_id", equipmentId)
        .eq("date", date)
        .order("start_time");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function add() {
    if (to <= from) return;
    const { error } = await supabase.from("equipment_availability").insert({
      equipment_id: equipmentId,
      date,
      start_time: hhmm(from),
      end_time: hhmm(to),
      status,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["availability", equipmentId, date] });
  }

  async function remove(id: string) {
    await supabase.from("equipment_availability").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["availability", equipmentId, date] });
  }

  return (
    <div className="space-y-2 rounded-xl border border-border p-3">
      <p className="text-sm font-semibold">{t("eq.availability")}</p>
      <p className="text-xs text-muted-foreground">{t("eq.availabilityHelp")}</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("eq.date")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
        <HourSelect value={from} onChange={setFrom} />
        <HourSelect value={to} onChange={setTo} />
        <Select value={status} onValueChange={(v) => setStatus(v as SlotStatus)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`eq.slot.${s}` as "eq.slot.BOOKED")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" type="button" onClick={add}>
          {t("eq.addSlot")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(slots ?? []).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => (s.booking_id ? undefined : remove(s.id))}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {fmtTime(s.start_time)}–{fmtTime(s.end_time)}{" "}
            {t(`eq.slot.${s.status as SlotStatus}` as "eq.slot.BOOKED")}
          </button>
        ))}
      </div>
    </div>
  );
}

function HourSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOURS.concat([21]).map((h) => (
          <SelectItem key={h} value={String(h)}>
            {fmtTime(hhmm(h))}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
