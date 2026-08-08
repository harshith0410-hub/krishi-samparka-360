export type Bilingual = { en: string; kn: string };

export type CropCategory =
  | "vegetables"
  | "fruits"
  | "flowers"
  | "grains"
  | "pulses"
  | "commercial";

export type Crop = {
  id: string;
  name: Bilingual;
  category: CropCategory;
  /** Reference modal price in ₹ per kg. Demo baseline only. */
  basePrice: number;
  /** 0-1, how much the price typically swings. */
  volatility: number;
  season: Bilingual;
};

export const crops: Crop[] = [
  // Vegetables
  c("tomato", "Tomato", "ಟೊಮೇಟೊ", "vegetables", 26, 0.45, "Kharif / Rabi", "ಮುಂಗಾರು / ಹಿಂಗಾರು"),
  c("onion", "Onion", "ಈರುಳ್ಳಿ", "vegetables", 32, 0.4, "Kharif", "ಮುಂಗಾರು"),
  c("potato", "Potato", "ಆಲೂಗಡ್ಡೆ", "vegetables", 24, 0.25, "Rabi", "ಹಿಂಗಾರು"),
  c("carrot", "Carrot", "ಕ್ಯಾರೆಟ್", "vegetables", 30, 0.3, "Rabi", "ಹಿಂಗಾರು"),
  c("beetroot", "Beetroot", "ಬೀಟ್‌ರೂಟ್", "vegetables", 22, 0.28, "Rabi", "ಹಿಂಗಾರು"),
  c("capsicum", "Capsicum", "ದೊಣ್ಣೆ ಮೆಣಸಿನಕಾಯಿ", "vegetables", 45, 0.35, "Rabi", "ಹಿಂಗಾರು"),
  c("brinjal", "Brinjal", "ಬದನೆಕಾಯಿ", "vegetables", 20, 0.3, "Kharif", "ಮುಂಗಾರು"),
  c("cabbage", "Cabbage", "ಎಲೆಕೋಸು", "vegetables", 16, 0.32, "Rabi", "ಹಿಂಗಾರು"),
  c("cauliflower", "Cauliflower", "ಹೂಕೋಸು", "vegetables", 25, 0.34, "Rabi", "ಹಿಂಗಾರು"),
  c("beans", "Beans", "ಹುರುಳಿಕಾಯಿ", "vegetables", 48, 0.35, "Kharif", "ಮುಂಗಾರು"),
  c("okra", "Okra", "ಬೆಂಡೆಕಾಯಿ", "vegetables", 34, 0.3, "Kharif", "ಮುಂಗಾರು"),
  c("pumpkin", "Pumpkin", "ಕುಂಬಳಕಾಯಿ", "vegetables", 14, 0.22, "Kharif", "ಮುಂಗಾರು"),
  c("cucumber", "Cucumber", "ಸೌತೆಕಾಯಿ", "vegetables", 18, 0.26, "Summer", "ಬೇಸಿಗೆ"),
  c("bottle-gourd", "Bottle Gourd", "ಸೋರೆಕಾಯಿ", "vegetables", 15, 0.24, "Kharif", "ಮುಂಗಾರು"),
  c("bitter-gourd", "Bitter Gourd", "ಹಾಗಲಕಾಯಿ", "vegetables", 36, 0.3, "Kharif", "ಮುಂಗಾರು"),
  c("green-chilli", "Green Chilli", "ಹಸಿ ಮೆಣಸಿನಕಾಯಿ", "vegetables", 42, 0.42, "Kharif", "ಮುಂಗಾರು"),
  c("spinach", "Spinach", "ಪಾಲಕ್ ಸೊಪ್ಪು", "vegetables", 20, 0.35, "All season", "ಎಲ್ಲಾ ಋತು"),
  // Fruits
  c("banana", "Banana", "ಬಾಳೆಹಣ್ಣು", "fruits", 34, 0.2, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("mango", "Mango", "ಮಾವಿನ ಹಣ್ಣು", "fruits", 65, 0.35, "Summer", "ಬೇಸಿಗೆ"),
  c("papaya", "Papaya", "ಪಪ್ಪಾಯಿ", "fruits", 22, 0.24, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("watermelon", "Watermelon", "ಕಲ್ಲಂಗಡಿ", "fruits", 14, 0.3, "Summer", "ಬೇಸಿಗೆ"),
  c("grapes", "Grapes", "ದ್ರಾಕ್ಷಿ", "fruits", 72, 0.3, "Rabi", "ಹಿಂಗಾರು"),
  c("orange", "Orange", "ಕಿತ್ತಳೆ", "fruits", 55, 0.26, "Rabi", "ಹಿಂಗಾರು"),
  c("pomegranate", "Pomegranate", "ದಾಳಿಂಬೆ", "fruits", 98, 0.3, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("guava", "Guava", "ಸೀಬೆಹಣ್ಣು", "fruits", 40, 0.24, "Kharif", "ಮುಂಗಾರು"),
  c("pineapple", "Pineapple", "ಅನಾನಸ್", "fruits", 38, 0.25, "All season", "ಎಲ್ಲಾ ಋತು"),
  // Flowers
  c("rose", "Rose", "ಗುಲಾಬಿ", "flowers", 120, 0.5, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("jasmine", "Jasmine", "ಮಲ್ಲಿಗೆ", "flowers", 380, 0.55, "Summer", "ಬೇಸಿಗೆ"),
  c("marigold", "Marigold", "ಸೇವಂತಿಗೆ", "flowers", 60, 0.45, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("chrysanthemum", "Chrysanthemum", "ಚಂಡು ಹೂವು", "flowers", 90, 0.45, "Rabi", "ಹಿಂಗಾರು"),
  c("lotus", "Lotus", "ಕಮಲ", "flowers", 150, 0.4, "Kharif", "ಮುಂಗಾರು"),
  c("lily", "Lily", "ಲಿಲ್ಲಿ", "flowers", 130, 0.42, "All season", "ಎಲ್ಲಾ ಋತು"),
  // Commercial / plantation
  c("coconut", "Coconut", "ತೆಂಗಿನಕಾಯಿ", "commercial", 28, 0.18, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("arecanut", "Arecanut", "ಅಡಿಕೆ", "commercial", 420, 0.22, "Rabi", "ಹಿಂಗಾರು"),
  c("coffee", "Coffee", "ಕಾಫಿ", "commercial", 320, 0.2, "Rabi", "ಹಿಂಗಾರು"),
  c("cotton", "Cotton", "ಹತ್ತಿ", "commercial", 72, 0.22, "Kharif", "ಮುಂಗಾರು"),
  c("sugarcane", "Sugarcane", "ಕಬ್ಬು", "commercial", 3.2, 0.12, "All season", "ಎಲ್ಲಾ ಋತು"),
  c("pepper", "Pepper", "ಕರಿಮೆಣಸು", "commercial", 620, 0.25, "Rabi", "ಹಿಂಗಾರು"),
  c("cardamom", "Cardamom", "ಏಲಕ್ಕಿ", "commercial", 1850, 0.28, "Kharif", "ಮುಂಗಾರು"),
  c("rubber", "Rubber", "ರಬ್ಬರ್", "commercial", 175, 0.2, "All season", "ಎಲ್ಲಾ ಋತು"),
  // Grains
  c("rice", "Rice", "ಭತ್ತ", "grains", 24, 0.14, "Kharif", "ಮುಂಗಾರು"),
  c("ragi", "Ragi", "ರಾಗಿ", "grains", 32, 0.16, "Kharif", "ಮುಂಗಾರು"),
  c("maize", "Maize", "ಮೆಕ್ಕೆಜೋಳ", "grains", 22, 0.18, "Kharif", "ಮುಂಗಾರು"),
  c("wheat", "Wheat", "ಗೋಧಿ", "grains", 26, 0.14, "Rabi", "ಹಿಂಗಾರು"),
  c("jowar", "Jowar", "ಜೋಳ", "grains", 30, 0.17, "Rabi", "ಹಿಂಗಾರು"),
  c("bajra", "Bajra", "ಸಜ್ಜೆ", "grains", 25, 0.17, "Kharif", "ಮುಂಗಾರು"),
  // Pulses
  c("green-gram", "Green Gram", "ಹೆಸರುಕಾಳು", "pulses", 88, 0.2, "Kharif", "ಮುಂಗಾರು"),
  c("black-gram", "Black Gram", "ಉದ್ದಿನಕಾಳು", "pulses", 84, 0.2, "Kharif", "ಮುಂಗಾರು"),
  c("toor-dal", "Toor Dal", "ತೊಗರಿಬೇಳೆ", "pulses", 105, 0.22, "Kharif", "ಮುಂಗಾರು"),
  c("bengal-gram", "Bengal Gram", "ಕಡಲೆಕಾಳು", "pulses", 68, 0.18, "Rabi", "ಹಿಂಗಾರು"),
  c("horse-gram", "Horse Gram", "ಹುರುಳಿ", "pulses", 62, 0.18, "Rabi", "ಹಿಂಗಾರು"),
];

function c(
  id: string,
  en: string,
  kn: string,
  category: CropCategory,
  basePrice: number,
  volatility: number,
  seasonEn: string,
  seasonKn: string,
): Crop {
  return {
    id,
    name: { en, kn },
    category,
    basePrice,
    volatility,
    season: { en: seasonEn, kn: seasonKn },
  };
}

export type PoiType =
  | "market"
  | "warehouse"
  | "coldStorage"
  | "equipment"
  | "labor"
  | "transport"
  | "buyer"
  | "office";

export type Market = {
  id: string;
  name: Bilingual;
  district: Bilingual;
  lat: number;
  lng: number;
  /** Market fee as a share of gross revenue. */
  feeRate: number;
  /** Relative price index for this market (1 = state baseline). */
  priceIndex: number;
  demand: "high" | "medium" | "low";
  openHours: Bilingual;
};

export const markets: Market[] = [
  m("yeshwanthpur", "Yeshwanthpur APMC", "ಯಶವಂತಪುರ APMC", "Bengaluru", "ಬೆಂಗಳೂರು", 13.0246, 77.5498, 0.015, 1.12, "high"),
  m("binnypet", "Binny Mill Market", "ಬಿನ್ನಿಮಿಲ್ ಮಾರುಕಟ್ಟೆ", "Bengaluru", "ಬೆಂಗಳೂರು", 12.9698, 77.5629, 0.012, 1.08, "high"),
  m("mysuru", "Mysuru APMC", "ಮೈಸೂರು APMC", "Mysuru", "ಮೈಸೂರು", 12.3052, 76.6394, 0.012, 1.03, "high"),
  m("mandya", "Mandya APMC", "ಮಂಡ್ಯ APMC", "Mandya", "ಮಂಡ್ಯ", 12.5223, 76.8977, 0.01, 0.96, "medium"),
  m("ramanagara", "Ramanagara APMC", "ರಾಮನಗರ APMC", "Ramanagara", "ರಾಮನಗರ", 12.7217, 77.2807, 0.01, 0.98, "medium"),
  m("tumakuru", "Tumakuru APMC", "ತುಮಕೂರು APMC", "Tumakuru", "ತುಮಕೂರು", 13.3379, 77.1173, 0.011, 0.99, "medium"),
  m("kolar", "Kolar APMC", "ಕೋಲಾರ APMC", "Kolar", "ಕೋಲಾರ", 13.1367, 78.1292, 0.012, 1.05, "high"),
  m("chikkaballapur", "Chikkaballapur APMC", "ಚಿಕ್ಕಬಳ್ಳಾಪುರ APMC", "Chikkaballapur", "ಚಿಕ್ಕಬಳ್ಳಾಪುರ", 13.4355, 77.7315, 0.01, 1.0, "medium"),
  m("hassan", "Hassan APMC", "ಹಾಸನ APMC", "Hassan", "ಹಾಸನ", 13.0068, 76.0996, 0.01, 0.97, "medium"),
  m("shivamogga", "Shivamogga APMC", "ಶಿವಮೊಗ್ಗ APMC", "Shivamogga", "ಶಿವಮೊಗ್ಗ", 13.9299, 75.568, 0.011, 0.98, "medium"),
  m("davanagere", "Davanagere APMC", "ದಾವಣಗೆರೆ APMC", "Davanagere", "ದಾವಣಗೆರೆ", 14.4644, 75.9218, 0.01, 0.95, "medium"),
  m("hubballi", "Hubballi APMC", "ಹುಬ್ಬಳ್ಳಿ APMC", "Dharwad", "ಧಾರವಾಡ", 15.3647, 75.124, 0.012, 1.02, "high"),
  m("belagavi", "Belagavi APMC", "ಬೆಳಗಾವಿ APMC", "Belagavi", "ಬೆಳಗಾವಿ", 15.8497, 74.4977, 0.011, 1.0, "medium"),
  m("kalaburagi", "Kalaburagi APMC", "ಕಲಬುರಗಿ APMC", "Kalaburagi", "ಕಲಬುರಗಿ", 17.3297, 76.8343, 0.01, 0.94, "medium"),
  m("raichur", "Raichur APMC", "ರಾಯಚೂರು APMC", "Raichur", "ರಾಯಚೂರು", 16.2076, 77.3463, 0.01, 0.93, "low"),
  m("vijayapura", "Vijayapura APMC", "ವಿಜಯಪುರ APMC", "Vijayapura", "ವಿಜಯಪುರ", 16.8302, 75.71, 0.01, 0.95, "medium"),
  m("mangaluru", "Mangaluru APMC", "ಮಂಗಳೂರು APMC", "Dakshina Kannada", "ದಕ್ಷಿಣ ಕನ್ನಡ", 12.9141, 74.856, 0.012, 1.07, "high"),
  m("udupi", "Udupi APMC", "ಉಡುಪಿ APMC", "Udupi", "ಉಡುಪಿ", 13.3409, 74.7421, 0.011, 1.04, "medium"),
];

function m(
  id: string,
  en: string,
  kn: string,
  dEn: string,
  dKn: string,
  lat: number,
  lng: number,
  feeRate: number,
  priceIndex: number,
  demand: Market["demand"],
): Market {
  return {
    id,
    name: { en, kn },
    district: { en: dEn, kn: dKn },
    lat,
    lng,
    feeRate,
    priceIndex,
    demand,
    openHours: { en: "6:00 AM – 6:00 PM", kn: "ಬೆಳಗ್ಗೆ 6:00 – ಸಂಜೆ 6:00" },
  };
}

export type District = { id: string; name: Bilingual; lat: number; lng: number };

export const districts: District[] = markets.map((mk) => ({
  id: mk.id,
  name: mk.district,
  lat: mk.lat,
  lng: mk.lng,
}));
