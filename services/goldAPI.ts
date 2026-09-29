import { GOLD_FALLBACK_CHF_PER_GRAM } from '../utils/constants';

export type GoldSource = 'live' | 'cached' | 'fallback';
export interface GoldQuote { price: number; source: GoldSource; }

let cached: { price: number; at: number } | null = null;
const CACHE_MS = 30 * 60 * 1000;
const TROY_OUNCE_GRAMS = 31.1035;

const withTimeout = (input: string, ms = 6000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(input, { signal: controller.signal }).finally(() => clearTimeout(timer));
};

/** Gold spot in USD per troy ounce, trying two free sources. */
const fetchGoldUsdPerOz = async (): Promise<number> => {
  try {
    const r = await withTimeout('https://api.gold-api.com/price/XAU');
    const j = await r.json();
    if (typeof j?.price === 'number' && j.price > 0) return j.price;
  } catch { /* try next */ }
  const r = await withTimeout('https://api.metals.live/v1/spot');
  const j = await r.json();
  const v = Array.isArray(j) ? j[0]?.gold : j?.gold;
  if (typeof v !== 'number' || v <= 0) throw new Error('no gold price');
  return v;
};

const fetchUsdToChf = async (): Promise<number> => {
  const r = await withTimeout('https://api.frankfurter.app/latest?from=USD&to=CHF');
  const j = await r.json();
  const rate = j?.rates?.CHF;
  return typeof rate === 'number' && rate > 0 ? rate : 0.88;
};

/** Gold price in CHF per gram (live → cached → fallback). */
export const getGoldPricePerGram = async (): Promise<GoldQuote> => {
  if (cached && Date.now() - cached.at < CACHE_MS) return { price: cached.price, source: 'cached' };
  try {
    const [usdPerOz, usdToChf] = await Promise.all([fetchGoldUsdPerOz(), fetchUsdToChf()]);
    const price = Math.round((usdPerOz * usdToChf / TROY_OUNCE_GRAMS) * 100) / 100;
    cached = { price, at: Date.now() };
    return { price, source: 'live' };
  } catch {
    return cached ? { price: cached.price, source: 'cached' } : { price: GOLD_FALLBACK_CHF_PER_GRAM, source: 'fallback' };
  }
};
