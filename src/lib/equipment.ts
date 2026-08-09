import type { Bilingual } from "@/data/agri";

export type EquipmentCondition = "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_MAINTENANCE";
export type ListingStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type SlotStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "PENDING"
  | "MAINTENANCE"
  | "OWNER_USE"
  | "UNAVAILABLE";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "ACTIVE"
  | "COMPLETED";

export type EquipmentRow = {
  id: string;
  owner_id: string;
  category: string;
  name: string;
  brand: string | null;
  model: string | null;
  manufacturing_year: number | null;
  condition: EquipmentCondition;
  description: string | null;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  taluk: string | null;
  village: string | null;
  pin_code: string | null;
  price_per_hour: number;
  price_per_day: number;
  half_day_price: number;
  security_deposit: number;
  delivery_available: boolean;
  delivery_fee: number;
  operator_available: boolean;
  operator_fee: number;
  fuel_included: boolean;
  pickup_available: boolean;
  maintenance_included: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
};

export type EquipmentImageRow = {
  id: string;
  equipment_id: string;
  url: string;
  label: string;
  sort_order: number;
};

export type AvailabilityRow = {
  id: string;
  equipment_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  booking_id: string | null;
};

export type BookingRow = {
  id: string;
  equipment_id: string;
  owner_id: string;
  farmer_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  hourly_rate: number;
  rental_amount: number;
  delivery_fee: number;
  operator_fee: number;
  security_deposit: number;
  total_amount: number;
  need_delivery: boolean;
  need_operator: boolean;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
};

export type CategoryGroup = { id: string; label: Bilingual; items: { id: string; label: Bilingual }[] };

const i = (id: string, en: string, kn: string) => ({ id, label: { en, kn } });

export const equipmentCategories: CategoryGroup[] = [
  {
    id: "tractors",
    label: { en: "Tractors", kn: "ಟ್ರ್ಯಾಕ್ಟರ್‌ಗಳು" },
    items: [
      i("tractor", "Tractor", "ಟ್ರ್ಯಾಕ್ಟರ್"),
      i("mini-tractor", "Mini Tractor", "ಮಿನಿ ಟ್ರ್ಯಾಕ್ಟರ್"),
      i("compact-tractor", "Compact Tractor", "ಕಾಂಪ್ಯಾಕ್ಟ್ ಟ್ರ್ಯಾಕ್ಟರ್"),
    ],
  },
  {
    id: "tillage",
    label: { en: "Tillage", kn: "ಉಳುಮೆ" },
    items: [
      i("rotavator", "Rotavator", "ರೊಟವೇಟರ್"),
      i("cultivator", "Cultivator", "ಕಲ್ಟಿವೇಟರ್"),
      i("plough", "Plough", "ನೇಗಿಲು"),
      i("disc-plough", "Disc Plough", "ಡಿಸ್ಕ್ ನೇಗಿಲು"),
      i("harrow", "Harrow", "ಕುಂಟೆ"),
      i("power-tiller", "Power Tiller", "ಪವರ್ ಟಿಲ್ಲರ್"),
    ],
  },
  {
    id: "sowing",
    label: { en: "Sowing", kn: "ಬಿತ್ತನೆ" },
    items: [
      i("seed-drill", "Seed Drill", "ಬಿತ್ತನೆ ಯಂತ್ರ"),
      i("planter", "Planter", "ಪ್ಲಾಂಟರ್"),
      i("paddy-transplanter", "Paddy Transplanter", "ಭತ್ತ ನಾಟಿ ಯಂತ್ರ"),
      i("vegetable-seeder", "Vegetable Seeder", "ತರಕಾರಿ ಬಿತ್ತನೆ ಯಂತ್ರ"),
    ],
  },
  {
    id: "harvesting",
    label: { en: "Harvesting", kn: "ಕೊಯ್ಲು" },
    items: [
      i("combine-harvester", "Combine Harvester", "ಕಂಬೈನ್ ಹಾರ್ವೆಸ್ಟರ್"),
      i("reaper", "Reaper", "ರೀಪರ್"),
      i("reaper-binder", "Reaper Binder", "ರೀಪರ್ ಬೈಂಡರ್"),
      i("crop-harvester", "Crop Harvester", "ಬೆಳೆ ಕೊಯ್ಲು ಯಂತ್ರ"),
      i("potato-harvester", "Potato Harvester", "ಆಲೂಗಡ್ಡೆ ಕೊಯ್ಲು ಯಂತ್ರ"),
      i("groundnut-harvester", "Groundnut Harvester", "ಕಡಲೆಕಾಯಿ ಕೊಯ್ಲು ಯಂತ್ರ"),
    ],
  },
  {
    id: "spraying",
    label: { en: "Spraying", kn: "ಸಿಂಪಡಣೆ" },
    items: [
      i("power-sprayer", "Power Sprayer", "ಪವರ್ ಸ್ಪ್ರೇಯರ್"),
      i("battery-sprayer", "Battery Sprayer", "ಬ್ಯಾಟರಿ ಸ್ಪ್ರೇಯರ್"),
      i("boom-sprayer", "Boom Sprayer", "ಬೂಮ್ ಸ್ಪ್ರೇಯರ್"),
      i("tractor-sprayer", "Tractor Mounted Sprayer", "ಟ್ರ್ಯಾಕ್ಟರ್ ಸ್ಪ್ರೇಯರ್"),
      i("mist-blower", "Mist Blower", "ಮಿಸ್ಟ್ ಬ್ಲೋವರ್"),
    ],
  },
  {
    id: "irrigation",
    label: { en: "Irrigation", kn: "ನೀರಾವರಿ" },
    items: [
      i("water-pump", "Water Pump", "ನೀರಿನ ಪಂಪ್"),
      i("diesel-pump", "Diesel Pump", "ಡೀಸೆಲ್ ಪಂಪ್"),
      i("electric-pump", "Electric Pump", "ವಿದ್ಯುತ್ ಪಂಪ್"),
    ],
  },
  {
    id: "post-harvest",
    label: { en: "Post-Harvest", kn: "ಕೊಯ್ಲಿನ ನಂತರ" },
    items: [
      i("thresher", "Thresher", "ಒಕ್ಕಣೆ ಯಂತ್ರ"),
      i("grain-cleaner", "Grain Cleaner", "ಧಾನ್ಯ ಶುದ್ಧೀಕರಣ ಯಂತ್ರ"),
      i("winnower", "Winnower", "ತೂರುವ ಯಂತ್ರ"),
      i("chaff-cutter", "Chaff Cutter", "ಮೇವು ಕತ್ತರಿಸುವ ಯಂತ್ರ"),
      i("maize-sheller", "Maize Sheller", "ಜೋಳ ಬಿಡಿಸುವ ಯಂತ್ರ"),
      i("paddy-thresher", "Paddy Thresher", "ಭತ್ತ ಒಕ್ಕಣೆ ಯಂತ್ರ"),
    ],
  },
  {
    id: "other",
    label: { en: "Other", kn: "ಇತರೆ" },
    items: [
      i("tractor-trailer", "Tractor Trailer", "ಟ್ರ್ಯಾಕ್ಟರ್ ಟ್ರೈಲರ್"),
      i("trolley", "Trolley", "ಟ್ರಾಲಿ"),
      i("mulcher", "Mulcher", "ಮಲ್ಚರ್"),
      i("brush-cutter", "Brush Cutter", "ಬ್ರಶ್ ಕಟರ್"),
      i("earth-auger", "Earth Auger", "ಅರ್ಥ್ ಆಗರ್"),
      i("agri-drone", "Agricultural Drone", "ಕೃಷಿ ಡ್ರೋನ್"),
      i("other-equipment", "Other Equipment", "ಇತರೆ ಯಂತ್ರೋಪಕರಣ"),
    ],
  },
];

export const allCategoryItems = equipmentCategories.flatMap((g) => g.items);

export function categoryLabel(id: string): Bilingual {
  return allCategoryItems.find((c) => c.id === id)?.label ?? { en: id, kn: id };
}

export const PHOTO_LABELS: { id: string; label: Bilingual }[] = [
  i("front", "Front", "ಮುಂಭಾಗ"),
  i("side", "Side", "ಪಕ್ಕ"),
  i("rear", "Rear", "ಹಿಂಭಾಗ"),
  i("detail", "Details", "ವಿವರ"),
];

export const HOURS = Array.from({ length: 15 }, (_, k) => k + 6); // 6:00 – 20:00

export function hhmm(hour: number) {
  return `${String(hour).padStart(2, "0")}:00:00`;
}

export function fmtTime(value: string) {
  const [h] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

export function costBreakdown(opts: {
  hourlyRate: number;
  hours: number;
  delivery: boolean;
  deliveryFee: number;
  operator: boolean;
  operatorFee: number;
  deposit: number;
}) {
  const rental = Math.round(opts.hourlyRate * opts.hours);
  const delivery = opts.delivery ? Math.round(opts.deliveryFee) : 0;
  const operator = opts.operator ? Math.round(opts.operatorFee * opts.hours) : 0;
  const deposit = Math.round(opts.deposit);
  return { rental, delivery, operator, deposit, total: rental + delivery + operator + deposit };
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)) * 10) / 10;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
