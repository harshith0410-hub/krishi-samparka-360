import type { Bilingual, PoiType } from "./agri";

export type Provider = {
  id: string;
  type: PoiType;
  name: Bilingual;
  place: Bilingual;
  lat: number;
  lng: number;
  detail: Bilingual;
  /** Unit price in ₹, meaning depends on type. */
  rate: number;
  rateUnit: "hour" | "day" | "tonne" | "kg";
  available: boolean;
  rating: number;
  phone: string;
};

const p = (
  id: string,
  type: PoiType,
  en: string,
  kn: string,
  placeEn: string,
  placeKn: string,
  lat: number,
  lng: number,
  detailEn: string,
  detailKn: string,
  rate: number,
  rateUnit: Provider["rateUnit"],
  available: boolean,
  rating: number,
  phone: string,
): Provider => ({
  id,
  type,
  name: { en, kn },
  place: { en: placeEn, kn: placeKn },
  lat,
  lng,
  detail: { en: detailEn, kn: detailKn },
  rate,
  rateUnit,
  available,
  rating,
  phone,
});

export const providers: Provider[] = [
  // Equipment
  p("eq1", "equipment", "Mahindra 575 Tractor", "ಮಹೀಂದ್ರಾ 575 ಟ್ರಾಕ್ಟರ್", "Mandya", "ಮಂಡ್ಯ", 12.53, 76.9, "Tractor with rotavator", "ರೊಟವೇಟರ್ ಸಹಿತ ಟ್ರಾಕ್ಟರ್", 750, "hour", true, 4.6, "+91 90000 11001"),
  p("eq2", "equipment", "Combine Harvester", "ಕೊಯ್ಲು ಯಂತ್ರ", "Mysuru", "ಮೈಸೂರು", 12.32, 76.65, "Paddy and ragi harvesting", "ಭತ್ತ ಮತ್ತು ರಾಗಿ ಕೊಯ್ಲು", 2200, "hour", true, 4.4, "+91 90000 11002"),
  p("eq3", "equipment", "Seed Drill Unit", "ಬಿತ್ತನೆ ಯಂತ್ರ", "Tumakuru", "ತುಮಕೂರು", 13.34, 77.12, "9-row seed drill", "9 ಸಾಲಿನ ಬಿತ್ತನೆ ಯಂತ್ರ", 520, "hour", false, 4.2, "+91 90000 11003"),
  p("eq4", "equipment", "Power Sprayer", "ಸಿಂಪಡಣೆ ಯಂತ್ರ", "Hassan", "ಹಾಸನ", 13.01, 76.1, "Battery power sprayer", "ಬ್ಯಾಟರಿ ಚಾಲಿತ ಸಿಂಪಡಣೆ", 180, "hour", true, 4.5, "+91 90000 11004"),
  p("eq5", "equipment", "Thresher Machine", "ಒಕ್ಕಣೆ ಯಂತ್ರ", "Davanagere", "ದಾವಣಗೆರೆ", 14.47, 75.93, "Multi-crop thresher", "ಬಹು ಬೆಳೆ ಒಕ್ಕಣೆ ಯಂತ್ರ", 900, "hour", true, 4.1, "+91 90000 11005"),

  // Labor
  p("lb1", "office", "Ravi Labour Group", "ರವಿ ಕಾರ್ಮಿಕ ತಂಡ", "Mandya", "ಮಂಡ್ಯ", 12.51, 76.88, "Harvesting — 8 workers", "ಕೊಯ್ಲು — 8 ಕಾರ್ಮಿಕರು", 480, "day", true, 4.5, "+91 90000 22001"),
  p("lb2", "office", "Lakshmi Weeding Team", "ಲಕ್ಷ್ಮಿ ಕಳೆ ತೆಗೆಯುವ ತಂಡ", "Mysuru", "ಮೈಸೂರು", 12.29, 76.62, "Weeding — 12 workers", "ಕಳೆ ತೆಗೆಯುವಿಕೆ — 12 ಕಾರ್ಮಿಕರು", 420, "day", true, 4.7, "+91 90000 22002"),
  p("lb3", "office", "Shivanna Sowing Crew", "ಶಿವಣ್ಣ ಬಿತ್ತನೆ ತಂಡ", "Tumakuru", "ತುಮಕೂರು", 13.32, 77.1, "Sowing — 6 workers", "ಬಿತ್ತನೆ — 6 ಕಾರ್ಮಿಕರು", 450, "day", false, 4.2, "+91 90000 22003"),

  // Transport
  p("tr1", "transport", "Tata Ace Mini Truck", "ಟಾಟಾ ಏಸ್ ಮಿನಿ ಟ್ರಕ್", "Mandya", "ಮಂಡ್ಯ", 12.52, 76.9, "Up to 1 tonne", "1 ಟನ್ ವರೆಗೆ", 22, "tonne", true, 4.4, "+91 90000 33001"),
  p("tr2", "transport", "Eicher 14 ft Truck", "ಐಷರ್ 14 ಅಡಿ ಟ್ರಕ್", "Mysuru", "ಮೈಸೂರು", 12.31, 76.63, "Up to 6 tonnes", "6 ಟನ್ ವರೆಗೆ", 18, "tonne", true, 4.3, "+91 90000 33002"),
  p("tr3", "transport", "Pickup Van", "ಪಿಕಪ್ ವ್ಯಾನ್", "Ramanagara", "ರಾಮನಗರ", 12.72, 77.28, "Up to 800 kg", "800 ಕೆ.ಜಿ ವರೆಗೆ", 26, "tonne", true, 4.0, "+91 90000 33003"),
  p("tr4", "transport", "Tractor Trailer", "ಟ್ರಾಕ್ಟರ್ ಟ್ರೈಲರ್", "Hassan", "ಹಾಸನ", 13.0, 76.09, "Short distance haulage", "ಸಮೀಪದ ಸಾಗಣೆ", 30, "tonne", false, 3.9, "+91 90000 33004"),

  // Storage
  p("wh1", "warehouse", "Mandya Agri Warehouse", "ಮಂಡ್ಯ ಕೃಷಿ ಗೋದಾಮು", "Mandya", "ಮಂಡ್ಯ", 12.54, 76.91, "Capacity 2,000 tonnes", "ಸಾಮರ್ಥ್ಯ 2,000 ಟನ್", 3, "kg", true, 4.3, "+91 90000 44001"),
  p("cs1", "coldStorage", "Mysuru Cold Storage", "ಮೈಸೂರು ಶೀತಲ ಸಂಗ್ರಹ", "Mysuru", "ಮೈಸೂರು", 12.33, 76.66, "Capacity 800 tonnes", "ಸಾಮರ್ಥ್ಯ 800 ಟನ್", 6, "kg", true, 4.6, "+91 90000 44002"),
  p("wh2", "warehouse", "Tumakuru Godown", "ತುಮಕೂರು ಗೋದಾಮು", "Tumakuru", "ತುಮಕೂರು", 13.35, 77.13, "Capacity 1,200 tonnes", "ಸಾಮರ್ಥ್ಯ 1,200 ಟನ್", 2.5, "kg", true, 4.1, "+91 90000 44003"),
  p("cs2", "coldStorage", "Kolar Cold Chain", "ಕೋಲಾರ ಶೀತಲ ಸರಪಳಿ", "Kolar", "ಕೋಲಾರ", 13.14, 78.13, "Capacity 500 tonnes", "ಸಾಮರ್ಥ್ಯ 500 ಟನ್", 7, "kg", false, 4.4, "+91 90000 44004"),

  // Buyers
  p("by1", "buyer", "Sri Krishna Traders", "ಶ್ರೀ ಕೃಷ್ಣ ಟ್ರೇಡರ್ಸ್", "Mysuru", "ಮೈಸೂರು", 12.3, 76.64, "Buying tomato, onion", "ಟೊಮೇಟೊ, ಈರುಳ್ಳಿ ಖರೀದಿ", 27, "kg", true, 4.5, "+91 90000 55001"),
  p("by2", "buyer", "Nandini Agro Exports", "ನಂದಿನಿ ಅಗ್ರೋ ಎಕ್ಸ್‌ಪೋರ್ಟ್ಸ್", "Bengaluru", "ಬೆಂಗಳೂರು", 13.02, 77.55, "Buying grapes, pomegranate", "ದ್ರಾಕ್ಷಿ, ದಾಳಿಂಬೆ ಖರೀದಿ", 95, "kg", true, 4.7, "+91 90000 55002"),
  p("by3", "buyer", "Malnad Coffee Buyers", "ಮಲೆನಾಡು ಕಾಫಿ ಬಯರ್ಸ್", "Shivamogga", "ಶಿವಮೊಗ್ಗ", 13.93, 75.57, "Buying coffee, pepper", "ಕಾಫಿ, ಕರಿಮೆಣಸು ಖರೀದಿ", 330, "kg", true, 4.2, "+91 90000 55003"),
  p("by4", "buyer", "Hubballi Grain Mandi Buyer", "ಹುಬ್ಬಳ್ಳಿ ಧಾನ್ಯ ಖರೀದಿದಾರ", "Dharwad", "ಧಾರವಾಡ", 15.36, 75.13, "Buying jowar, maize", "ಜೋಳ, ಮೆಕ್ಕೆಜೋಳ ಖರೀದಿ", 29, "kg", true, 4.0, "+91 90000 55004"),
];

export type Scheme = {
  id: string;
  name: Bilingual;
  description: Bilingual;
  eligibility: Bilingual;
  benefits: Bilingual;
  documents: Bilingual;
  apply: Bilingual;
  url: string;
};

export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    name: { en: "PM-KISAN", kn: "ಪಿಎಂ-ಕಿಸಾನ್" },
    description: {
      en: "Central income support scheme for landholding farmer families.",
      kn: "ಭೂಮಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಆದಾಯ ಬೆಂಬಲ ಯೋಜನೆ.",
    },
    eligibility: {
      en: "Landholding farmer families, subject to exclusion criteria notified by the scheme.",
      kn: "ಭೂಮಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳು; ಯೋಜನೆಯ ಹೊರಗಿಡುವ ನಿಯಮಗಳಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ.",
    },
    benefits: {
      en: "Income support paid in instalments directly to the beneficiary bank account.",
      kn: "ಫಲಾನುಭವಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಕಂತುಗಳಲ್ಲಿ ನೇರ ಆದಾಯ ಬೆಂಬಲ.",
    },
    documents: {
      en: "Aadhaar, land records, bank account details.",
      kn: "ಆಧಾರ್, ಭೂ ದಾಖಲೆಗಳು, ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ.",
    },
    apply: {
      en: "Register on the PM-KISAN portal or through the nearest Common Service Centre.",
      kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಥವಾ ಹತ್ತಿರದ ಸಾಮಾನ್ಯ ಸೇವಾ ಕೇಂದ್ರದಲ್ಲಿ ನೋಂದಣಿ ಮಾಡಿ.",
    },
    url: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: { en: "Pradhan Mantri Fasal Bima Yojana", kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ" },
    description: {
      en: "Crop insurance scheme covering notified crops against notified risks.",
      kn: "ಅಧಿಸೂಚಿತ ಬೆಳೆಗಳಿಗೆ ಅಧಿಸೂಚಿತ ಅಪಾಯಗಳ ವಿರುದ್ಧ ಬೆಳೆ ವಿಮಾ ಯೋಜನೆ.",
    },
    eligibility: {
      en: "Farmers growing notified crops in notified areas, including sharecroppers and tenant farmers as per guidelines.",
      kn: "ಅಧಿಸೂಚಿತ ಪ್ರದೇಶಗಳಲ್ಲಿ ಅಧಿಸೂಚಿತ ಬೆಳೆ ಬೆಳೆಯುವ ರೈತರು; ಮಾರ್ಗಸೂಚಿಯಂತೆ ಗುತ್ತಿಗೆ ರೈತರೂ ಸೇರಿದ್ದಾರೆ.",
    },
    benefits: {
      en: "Insurance claim against crop loss from notified risks.",
      kn: "ಅಧಿಸೂಚಿತ ಅಪಾಯಗಳಿಂದ ಬೆಳೆ ನಷ್ಟವಾದಾಗ ವಿಮಾ ಪರಿಹಾರ.",
    },
    documents: {
      en: "Aadhaar, land records, sowing certificate, bank account details.",
      kn: "ಆಧಾರ್, ಭೂ ದಾಖಲೆ, ಬಿತ್ತನೆ ಪ್ರಮಾಣಪತ್ರ, ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ.",
    },
    apply: {
      en: "Apply through the PMFBY portal, banks, or authorised insurance intermediaries.",
      kn: "PMFBY ಪೋರ್ಟಲ್, ಬ್ಯಾಂಕ್ ಅಥವಾ ಅಧಿಕೃತ ವಿಮಾ ಮಧ್ಯವರ್ತಿಗಳ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
    },
    url: "https://pmfby.gov.in/",
  },
  {
    id: "shc",
    name: { en: "Soil Health Card Scheme", kn: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಯೋಜನೆ" },
    description: {
      en: "Provides farmers with soil nutrient status and fertilizer recommendations.",
      kn: "ರೈತರಿಗೆ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಸ್ಥಿತಿ ಮತ್ತು ಗೊಬ್ಬರ ಶಿಫಾರಸು ಒದಗಿಸುತ್ತದೆ.",
    },
    eligibility: { en: "All farmers.", kn: "ಎಲ್ಲಾ ರೈತರು." },
    benefits: {
      en: "Soil test based nutrient recommendations to reduce input cost.",
      kn: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಆಧಾರಿತ ಪೋಷಕಾಂಶ ಶಿಫಾರಸು — ಇನ್‌ಪುಟ್ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ.",
    },
    documents: {
      en: "Land details and farmer identification.",
      kn: "ಭೂಮಿ ವಿವರ ಮತ್ತು ರೈತ ಗುರುತಿನ ದಾಖಲೆ.",
    },
    apply: {
      en: "Contact the local agriculture department or soil testing laboratory.",
      kn: "ಸ್ಥಳೀಯ ಕೃಷಿ ಇಲಾಖೆ ಅಥವಾ ಮಣ್ಣು ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    },
    url: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "kcc",
    name: { en: "Kisan Credit Card", kn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್" },
    description: {
      en: "Short-term credit facility for cultivation and allied activities.",
      kn: "ಕೃಷಿ ಮತ್ತು ಸಂಬಂಧಿತ ಚಟುವಟಿಕೆಗಳಿಗೆ ಅಲ್ಪಾವಧಿ ಸಾಲ ಸೌಲಭ್ಯ.",
    },
    eligibility: {
      en: "Farmers, tenant farmers, oral lessees and sharecroppers as per bank norms.",
      kn: "ಬ್ಯಾಂಕ್ ನಿಯಮಗಳಂತೆ ರೈತರು, ಗುತ್ತಿಗೆ ರೈತರು ಮತ್ತು ಪಾಲುದಾರ ರೈತರು.",
    },
    benefits: {
      en: "Credit limit for crop production and allied needs.",
      kn: "ಬೆಳೆ ಉತ್ಪಾದನೆ ಮತ್ತು ಸಂಬಂಧಿತ ಅಗತ್ಯಗಳಿಗೆ ಸಾಲ ಮಿತಿ.",
    },
    documents: {
      en: "Identity proof, address proof, land records.",
      kn: "ಗುರುತಿನ ಚೀಟಿ, ವಿಳಾಸ ದಾಖಲೆ, ಭೂ ದಾಖಲೆ.",
    },
    apply: {
      en: "Apply at your bank branch or through the Kisan Credit Card portal.",
      kn: "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಶಾಖೆಯಲ್ಲಿ ಅಥವಾ ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
    },
    url: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    id: "raitha-samparka",
    name: { en: "Karnataka Raitha Samparka Kendra", kn: "ಕರ್ನಾಟಕ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ" },
    description: {
      en: "State agriculture department centres providing inputs, advisory and scheme support at hobli level.",
      kn: "ಹೋಬಳಿ ಮಟ್ಟದಲ್ಲಿ ಇನ್‌ಪುಟ್, ಸಲಹೆ ಮತ್ತು ಯೋಜನೆ ಬೆಂಬಲ ನೀಡುವ ರಾಜ್ಯ ಕೃಷಿ ಇಲಾಖೆ ಕೇಂದ್ರಗಳು.",
    },
    eligibility: { en: "Farmers in Karnataka.", kn: "ಕರ್ನಾಟಕದ ರೈತರು." },
    benefits: {
      en: "Seeds, inputs, advisory services and help with scheme applications.",
      kn: "ಬಿತ್ತನೆ ಬೀಜ, ಇನ್‌ಪುಟ್, ಸಲಹಾ ಸೇವೆ ಮತ್ತು ಯೋಜನೆ ಅರ್ಜಿ ಸಹಾಯ.",
    },
    documents: {
      en: "Farmer ID / FRUITS ID and land records.",
      kn: "ರೈತ ಗುರುತು / FRUITS ID ಮತ್ತು ಭೂ ದಾಖಲೆ.",
    },
    apply: {
      en: "Visit the Raitha Samparka Kendra in your hobli.",
      kn: "ನಿಮ್ಮ ಹೋಬಳಿಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
    },
    url: "https://raitamitra.karnataka.gov.in/",
  },
];
