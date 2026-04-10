import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { getSimilarProjects } from '../services/supabase';
import { getGoldPricePerGram } from '../services/goldAPI';
import { PredictionData } from '../types';
import { Sparkles, TrendingUp } from 'lucide-react';

interface Props {
  projectType: 'Alliance' | 'Fassung' | 'Pave';
  style?: string;
  material?: string;
  stoneType?: string;
  shape?: string;
  goldWeight?: number; // grams
}

const fmtTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const SmartPrediction: React.FC<Props> = ({ projectType, style, material, stoneType, shape, goldWeight }) => {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [goldPrice, setGoldPrice] = useState<{ price: number; source: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGoldPricePerGram().then(setGoldPrice);
  }, []);

  useEffect(() => {
    if (!style && !material && !stoneType) { setPrediction(null); return; }
    setLoading(true);
    getSimilarProjects(projectType, { style, material, stoneType, shape })
      .then(p => { setPrediction(p); setLoading(false); });
  }, [projectType, style, material, stoneType, shape]);

  const goldCost = goldWeight && goldPrice ? Math.round(goldWeight * goldPrice.price) : null;

  if (!prediction && !goldPrice) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-jewelry-copper">
        <Sparkles className="w-4 h-4" />
        <h4 className="font-bold text-sm uppercase tracking-wide">{t('smartPrediction')}</h4>
      </div>

      {loading && <p className="text-xs text-gray-400 animate-pulse">{t('loading')}</p>}

      {prediction && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{t('basedOnSimilar', { count: prediction.count })}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('predictedTime')}</p>
              <p className="font-bold text-jewelry-copper text-base">{fmtTime(prediction.avgTime)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {t('timeRange')}: {fmtTime(prediction.minTime)} – {fmtTime(prediction.maxTime)}
              </p>
            </div>
            {prediction.avgPrice && (
              <div className="bg-white rounded-xl p-3 border border-amber-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('predictedPrice')}</p>
                <p className="font-bold text-jewelry-copper text-base">{prediction.avgPrice} CHF</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {Math.round(prediction.avgPrice / (prediction.avgTime / 60))} CHF/h
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gold price */}
      {goldPrice && (
        <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">{t('goldPriceLabel')}</p>
              <p className="font-bold text-gray-800 text-sm">{goldPrice.price} CHF/g</p>
            </div>
          </div>
          {goldCost && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Cost or</p>
              <p className="font-bold text-yellow-600 text-sm">{goldCost} CHF</p>
            </div>
          )}
          {goldPrice.source !== 'live' && (
            <span className="text-[9px] text-gray-300 absolute right-6 bottom-4">
              {goldPrice.source === 'fallback' ? 'valor referència' : 'memòria cau'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartPrediction;
