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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtTime, type BookingRow } from "@/lib/equipment";
import { useEquipmentRealtime } from "@/lib/equipmentQueries";

export const Route = createFileRoute("/_authenticated/my-rentals")({
  head: () => ({
    meta: [
      { title: "My Rentals — Krishi Samparka 360" },
      {
        name: "description",
        content:
          "Track your farm equipment rental requests: upcoming, active, completed and cancelled bookings with prices and pickup details.",
      },
      { property: "og:title", content: "My Rentals — Krishi Samparka 360" },
      { property: "og:description", content: "Your equipment rental bookings in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyRentalsPage,
});

function MyRentalsPage() {
  const { t, locale } = useI18n();
  const { userId } = useAuth();
  const qc = useQueryClient();
  useEquipmentRealtime();

  const { data } = useQuery({
    enabled: !!userId,
    queryKey: ["bookings", "farmer", userId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("equipment_bookings")
        .select("*")
        .eq("farmer_id", userId!)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return (rows ?? []) as BookingRow[];
    },
  });

  const all = data ?? [];
  const groups = {
    upcoming: all.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED"),
    active: all.filter((b) => b.status === "ACTIVE"),
    completed: all.filter((b) => b.status === "COMPLETED"),
    cancelled: all.filter((b) => b.status === "CANCELLED" || b.status === "REJECTED"),
  };

  async function cancel(id: string) {
    const { error } = await supabase.from("equipment_bookings").update({ status: "CANCELLED" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("eq.saved"));
    qc.invalidateQueries({ queryKey: ["bookings"] });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <PageHeader title={t("eq.myRentals")} subtitle={t("eq.subtitle")} />
      <Button asChild variant="secondary">
        <Link to="/equipment">{t("eq.rent")}</Link>
      </Button>

      <Tabs defaultValue="upcoming">
        <TabsList className="flex-wrap">
          <TabsTrigger value="upcoming">{t("eq.tabUpcoming")}</TabsTrigger>
          <TabsTrigger value="active">{t("eq.tabActive")}</TabsTrigger>
          <TabsTrigger value="completed">{t("eq.tabCompleted")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("eq.tabCancelled")}</TabsTrigger>
        </TabsList>
        {(["upcoming", "active", "completed", "cancelled"] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {groups[key].length === 0 ? (
              <EmptyState message={t("common.empty")} />
            ) : (
              groups[key].map((b) => (
                <Card key={b.id}>
                  <CardContent className="space-y-2 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">
                        {b.booking_date} · {fmtTime(b.start_time)}–{fmtTime(b.end_time)}
                      </p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {t(`eq.status.${b.status}` as "eq.status.PENDING")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("eq.total")}: {formatCurrency(Number(b.total_amount), locale)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link to="/equipment/$id" params={{ id: b.equipment_id }}>
                          {t("common.details")}
                        </Link>
                      </Button>
                      {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                        <Button size="sm" variant="outline" onClick={() => cancel(b.id)}>
                          {t("eq.cancel")}
                        </Button>
                      )}
                    </div>
                    {b.status === "COMPLETED" && <ReviewForm booking={b} userId={userId} />}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ReviewForm({ booking, userId }: { booking: BookingRow; userId: string | null }) {
  const { t } = useI18n();
  const [equipmentRating, setEquipmentRating] = useState("5");
  const [ownerRating, setOwnerRating] = useState("5");
  const [serviceRating, setServiceRating] = useState("5");
  const [done, setDone] = useState(false);

  async function submit() {
    if (!userId) return;
    const { error } = await supabase.from("equipment_reviews").insert({
      booking_id: booking.id,
      equipment_id: booking.equipment_id,
      reviewer_id: userId,
      reviewer_role: "FARMER",
      equipment_rating: Number(equipmentRating),
      owner_rating: Number(ownerRating),
      service_rating: Number(serviceRating),
    });
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success(t("eq.reviewThanks"));
  }

  if (done) return <p className="text-sm text-muted-foreground">{t("eq.reviewThanks")}</p>;

  return (
    <div className="space-y-2 rounded-xl border border-border p-3">
      <p className="text-sm font-semibold">{t("eq.review")}</p>
      <div className="flex flex-wrap gap-2">
        <Stars label={t("eq.rateEquipment")} value={equipmentRating} onChange={setEquipmentRating} />
        <Stars label={t("eq.rateOwner")} value={ownerRating} onChange={setOwnerRating} />
        <Stars label={t("eq.rateService")} value={serviceRating} onChange={setServiceRating} />
      </div>
      <Button size="sm" onClick={submit}>
        {t("eq.submitReview")}
      </Button>
    </div>
  );
}

function Stars({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[5, 4, 3, 2, 1].map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n} ★
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
