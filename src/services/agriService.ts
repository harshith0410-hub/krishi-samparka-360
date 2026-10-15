import { crops, markets, type Crop, type Market } from "@/data/agri";

/**
 * Demo data service layer.
 * Every value here is deterministic pseudo-data derived from a seed so the
 * UI behaves like a real API without pretending to be live. Swap the bodies
 * of these functions for real AGMARKNET / weather / maps calls later.
 */

export const DEMO_MODE = true;

export function dataTimestamp() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d;
}

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function getCrop(cropId: string): Crop | undefined {
  return crops.find((c) => c.id === cropId);
}

export function getMarket(marketId: string): Market | undefined {
  return markets.find((m) => m.id === marketId);
}

/** Modal price in ₹/kg for a crop at a market on a given day offset. */
export function priceFor(cropId: string, marketId: string, dayOffset = 0): number | null {
  const crop = getCrop(cropId);
  const market = getMarket(marketId);
  if (!crop || !market) return null;
  const swing = (hash(`${cropId}|${marketId}|${dayKey(dayOffset)}`) - 0.5) * 2 * crop.volatility;
  const seasonal = Math.sin((new Date().getMonth() + dayOffset / 30) * 0.9) * crop.volatility * 0.3;
  const price = crop.basePrice * market.priceIndex * (1 + swing * 0.35 + seasonal * 0.3);
  return Math.max(0.5, Math.round(price * 100) / 100);
}

export function priceHistory(cropId: string, marketId: string, days = 30) {
  const out: { date: string; price: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const price = priceFor(cropId, marketId, -i);
    if (price !== null) out.push({ date: dayKey(-i), price });
  }
  return out;
}

export function arrivalsFor(cropId: string, marketId: string) {
  return Math.round(20 + hash(`arr|${cropId}|${marketId}|${dayKey()}`) * 480);
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Road distance approximation from straight-line distance. */
export const roadKm = (km: number) => Math.round(km * 1.28);

export function transportCost(distanceKm: number, quantityKg: number) {
  const tonnes = Math.max(0.5, quantityKg / 1000);
  const vehicles = Math.ceil(tonnes / 6);
  const perKmPerTonne = tonnes <= 1 ? 26 : tonnes <= 3 ? 20 : 16;
  const loading = 350 * vehicles + quantityKg * 0.35;
  return Math.round(distanceKm * perKmPerTonne * tonnes + loading);
}

export function travelMinutes(distanceKm: number) {
  return Math.round((distanceKm / 38) * 60);
}

export type MarketOption = {
  market: Market;
  price: number;
  distanceKm: number;
  travelMin: number;
  gross: number;
  transport: number;
  fees: number;
  net: number;
  demand: Market["demand"];
  arrivals: number;
};

export type BestMarketResult = {
  recommended: MarketOption | null;
  alternatives: MarketOption[];
  all: MarketOption[];
};

/**
 * Ranks markets on estimated NET revenue, not on headline price.
 */
export function calculateBestMarket(params: {
  cropId: string;
  quantityKg: number;
  origin: { lat: number; lng: number };
  radiusKm?: number;
}): BestMarketResult {
  const { cropId, quantityKg, origin, radiusKm = 250 } = params;
  const options: MarketOption[] = [];

  for (const market of markets) {
    const price = priceFor(cropId, market.id);
    if (price === null) continue;
    const straight = haversineKm(origin, market);
    const distanceKm = roadKm(straight);
    if (distanceKm > radiusKm) continue;
    const gross = price * quantityKg;
    const transport = transportCost(distanceKm, quantityKg);
    const fees = Math.round(gross * market.feeRate);
    options.push({
      market,
      price,
      distanceKm,
      travelMin: travelMinutes(distanceKm),
      gross: Math.round(gross),
      transport,
      fees,
      net: Math.round(gross - transport - fees),
      demand: market.demand,
      arrivals: arrivalsFor(cropId, market.id),
    });
  }

  const demandBoost = { high: 1.015, medium: 1, low: 0.985 };
  options.sort((a, b) => b.net * demandBoost[b.demand] - a.net * demandBoost[a.demand]);

  return {
    recommended: options[0] ?? null,
    alternatives: options.slice(1, 6),
    all: options,
  };
}

export type Prediction = {
  currentPrice: number;
  predictedPrice: number;
  changePct: number;
  trend: "rising" | "falling" | "stable";
  confidence: number;
  series: { date: string; price?: number; forecast?: number }[];
  windowDays: number;
};

export function predictPrice(cropId: string, marketId: string, horizonDays: number): Prediction {
  const crop = getCrop(cropId);
  const current = priceFor(cropId, marketId);
  if (!crop || current === null) {
    return {
      currentPrice: 0,
      predictedPrice: 0,
      changePct: 0,
      trend: "stable",
      confidence: 0,
      series: [],
      windowDays: horizonDays,
    };
  }

  const history = priceHistory(cropId, marketId, 30);
  const recent = history.slice(-7).map((h) => h.price);
  const older = history.slice(-21, -7).map((h) => h.price);
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const momentum = (avg(recent) - avg(older)) / Math.max(0.01, avg(older));
  const seasonal = Math.sin((new Date().getMonth() + horizonDays / 30) * 0.9) * 0.04;
  const drift = momentum * Math.min(1, horizonDays / 30) + seasonal;
  const predicted = Math.max(0.5, current * (1 + drift));
  const changePct = ((predicted - current) / current) * 100;

  const series: Prediction["series"] = history.map((h) => ({ date: h.date, price: h.price }));
  const last = series[series.length - 1];
  if (last) last.forecast = current;
  const steps = Math.min(horizonDays, 30);
  for (let i = 1; i <= steps; i++) {
    const d = new Date();
    d.setDate(d.getDate() + Math.round((i / steps) * horizonDays));
    series.push({
      date: d.toISOString().slice(0, 10),
      forecast: Math.round((current + (predicted - current) * (i / steps)) * 100) / 100,
    });
  }

  const confidence = Math.round(
    Math.max(35, 92 - crop.volatility * 55 - Math.min(30, horizonDays / 3)),
  );

  return {
    currentPrice: current,
    predictedPrice: Math.round(predicted * 100) / 100,
    changePct: Math.round(changePct * 10) / 10,
    trend: changePct > 2 ? "rising" : changePct < -2 ? "falling" : "stable",
    confidence,
    series,
    windowDays: horizonDays,
  };
}

export type SellDecision = {
  action: "sellNow" | "wait" | "other";
  bestMarketId: string | null;
  expectedNet: number;
  risk: "high" | "medium" | "low";
  confidence: number;
};

export function sellDecision(params: {
  cropId: string;
  quantityKg: number;
  origin: { lat: number; lng: number };
  localMarketId?: string;
}): SellDecision | null {
  const { cropId, quantityKg, origin, localMarketId } = params;
  const ranked = calculateBestMarket({ cropId, quantityKg, origin });
  const best = ranked.recommended;
  if (!best) return null;
  const forecast = predictPrice(cropId, best.market.id, 7);
  const local = localMarketId ? ranked.all.find((o) => o.market.id === localMarketId) : undefined;

  let action: SellDecision["action"] = "sellNow";
  if (forecast.changePct > 6 && forecast.confidence > 55) action = "wait";
  else if (local && best.net > local.net * 1.04) action = "other";

  const crop = getCrop(cropId);
  const risk = !crop ? "medium" : crop.volatility > 0.38 ? "high" : crop.volatility > 0.22 ? "medium" : "low";

  return {
    action,
    bestMarketId: best.market.id,
    expectedNet: best.net,
    risk,
    confidence: forecast.confidence,
  };
}

export type WeatherData = {
  tempC: number;
  humidity: number;
  windKph: number;
  rainChance: number;
  rainfallMm: number;
  uv: number;
  forecast: { date: string; min: number; max: number; rainChance: number }[];
  alerts: { id: string; severity: "high" | "medium"; en: string; kn: string }[];
};

export function getWeather(origin: { lat: number; lng: number }): WeatherData {
  const seed = `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}|${dayKey()}`;
  const r = (k: string) => hash(seed + k);
  const rainChance = Math.round(r("rain") * 100);
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const base = 22 + r(`t${i}`) * 8;
    return {
      date: d.toISOString().slice(0, 10),
      min: Math.round(base - 5),
      max: Math.round(base + 6),
      rainChance: Math.round(r(`r${i}`) * 100),
    };
  });

  const alerts: WeatherData["alerts"] = [];
  if (rainChance >= 60)
    alerts.push({
      id: "rain",
      severity: "high",
      en: "Heavy rain likely in the next 24 hours. Postpone fertilizer application and protect harvested produce.",
      kn: "ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆ ಸಾಧ್ಯತೆ. ಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ಮುಂದೂಡಿ ಮತ್ತು ಕೊಯ್ಲು ಮಾಡಿದ ಉತ್ಪನ್ನವನ್ನು ರಕ್ಷಿಸಿ.",
    });
  const maxTemp = Math.max(...forecast.map((f) => f.max));
  if (maxTemp >= 36)
    alerts.push({
      id: "heat",
      severity: "medium",
      en: "High temperatures expected this week. Plan irrigation in the early morning or evening.",
      kn: "ಈ ವಾರ ಹೆಚ್ಚಿನ ತಾಪಮಾನ ನಿರೀಕ್ಷೆ. ಬೆಳಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರಾವರಿ ಯೋಜಿಸಿ.",
    });

  return {
    tempC: Math.round(22 + r("temp") * 10),
    humidity: Math.round(45 + r("hum") * 45),
    windKph: Math.round(4 + r("wind") * 18),
    rainChance,
    rainfallMm: Math.round(r("mm") * 24),
    uv: Math.round(3 + r("uv") * 8),
    forecast,
    alerts,
  };
}
// --- LIVE API INTEGRATIONS ---

export interface LiveWeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
}

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  modal_price: string;
  min_price: string;
  max_price: string;
  arrival_date: string;
}

// Fetch Live Weather Data (OpenWeatherMap)
export async function fetchLiveWeather(city: string = "Bengaluru"): Promise<LiveWeatherData> {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather API Error: ${response.statusText}`);
  return await response.json();
}

// Fetch Live Mandi Prices (Data.gov.in)
export async function fetchLiveMandiPrices(
  stateName: string = "Karnataka",
  commodity: string = ""
): Promise<MandiRecord[]> {
  const apiKey = import.meta.env.VITE_DATAGOV_API_KEY;
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  
  // Base URL with limit set to 50
  let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=50`;

  // Conditionally add state and commodity filters
  if (stateName) {
    url += `&filters[state]=${encodeURIComponent(stateName)}`;
  }
  if (commodity) {
    url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Data.gov.in API Error: ${response.statusText}`);
  const data = await response.json();
  return data.records || [];
}