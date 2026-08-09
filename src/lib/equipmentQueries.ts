import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { EquipmentRow, EquipmentImageRow } from "@/lib/equipment";

export type OwnerProfile = {
  id: string;
  full_name: string;
  phone: string;
  district: string | null;
  taluk: string | null;
  village: string | null;
  rating: number;
};

export type Listing = EquipmentRow & {
  images: EquipmentImageRow[];
  owner: OwnerProfile | null;
};

async function attach(rows: EquipmentRow[]): Promise<Listing[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];
  const [{ data: images }, { data: owners }] = await Promise.all([
    supabase.from("equipment_images").select("*").in("equipment_id", ids),
    supabase
      .from("profiles")
      .select("id, full_name, phone, district, taluk, village, rating")
      .in("id", ownerIds),
  ]);
  return rows.map((r) => ({
    ...r,
    images: ((images ?? []) as EquipmentImageRow[])
      .filter((im) => im.equipment_id === r.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    owner: ((owners ?? []) as OwnerProfile[]).find((o) => o.id === r.owner_id) ?? null,
  }));
}

export function useListings() {
  return useQuery({
    queryKey: ["equipment", "listings"],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return attach((data ?? []) as EquipmentRow[]);
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ["equipment", "listing", id],
    queryFn: async (): Promise<Listing | null> => {
      const { data, error } = await supabase.from("equipment").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return (await attach([data as EquipmentRow]))[0] ?? null;
    },
  });
}

export function useMyEquipment(userId: string | null) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["equipment", "mine", userId],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("owner_id", userId!)
        .neq("status", "ARCHIVED")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return attach((data ?? []) as EquipmentRow[]);
    },
  });
}

/** Invalidates equipment queries whenever the shared database changes. */
export function useEquipmentRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("equipment-marketplace")
      .on("postgres_changes", { event: "*", schema: "public", table: "equipment" }, () => {
        qc.invalidateQueries({ queryKey: ["equipment"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "equipment_bookings" }, () => {
        qc.invalidateQueries({ queryKey: ["equipment"] });
        qc.invalidateQueries({ queryKey: ["bookings"] });
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment_availability" },
        () => {
          qc.invalidateQueries({ queryKey: ["availability"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}

export function useAvailability(equipmentId: string, date: string) {
  return useQuery({
    queryKey: ["availability", equipmentId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_availability")
        .select("*")
        .eq("equipment_id", equipmentId)
        .eq("date", date);
      if (error) throw error;
      return data ?? [];
    },
  });
}
