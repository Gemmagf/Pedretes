// Preu de l'or en temps real (CHF per gram)
// Font: metals.live (USD/oz) + frankfurter.app (USD→CHF)
// Fallback: ~95 CHF/g si les APIs fallen

let cachedPrice: number | null = null;
let cacheTime = 0;
const CACHE_MS = 30 * 60 * 1000; // 30 minuts

export const getGoldPricePerGram = async (): Promise<{ price: number; source: 'live' | 'cached' | 'fallback' }> => {
  if (cachedPrice && Date.now() - cacheTime < CACHE_MS) {
    return { price: cachedPrice, source: 'cached' };
  }

  try {
    const [goldRes, fxRes] = await Promise.all([
      fetch('https://api.metals.live/v1/spot'),
      fetch('https://api.frankfurter.app/latest?from=USD&to=CHF'),
    ]);

    const goldData = await goldRes.json();
    const fxData = await fxRes.json();

    const goldUsdPerOz: number = Array.isArray(goldData) ? goldData[0]?.gold : goldData?.gold;
    const usdToChf: number = fxData?.rates?.CHF ?? 0.89;

    if (!goldUsdPerOz) throw new Error('No gold price data');

    const pricePerGram = Math.round((goldUsdPerOz * usdToChf / 31.1035) * 100) / 100;
    cachedPrice = pricePerGram;
    cacheTime = Date.now();
    return { price: pricePerGram, source: 'live' };
  } catch {
    return { price: cachedPrice ?? 95, source: cachedPrice ? 'cached' : 'fallback' };
  }
};
