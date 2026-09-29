import React, { useMemo } from 'react';
import { Sparkles, Check } from 'lucide-react';
import type { Project, ProjectType } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { predictPerStone } from '../utils/analytics';
import { fmtMinutes, fmtNumber } from '../utils/format';
import type { TranslationKey } from '../i18n';

interface Props {
  projects: Project[];
  type: ProjectType;
  filters: { style?: string; material?: string; stoneType?: string; shape?: string };
  stoneCount: number;
  onApply?: (patch: { totalTime: string; pricePerStone: string }) => void;
}

const ATTR_KEY: Record<'style' | 'stoneType' | 'material' | 'shape', TranslationKey> = { style: 'style', stoneType: 'stoneType', material: 'material', shape: 'shape' };

/** Per-stone time and price learned from similar past orders, projected to the entered stone count. */
const SmartPrediction: React.FC<Props> = ({ projects, type, filters, stoneCount, onApply }) => {
  const { t, locale } = useTranslation();
  const prediction = useMemo(() => predictPerStone(projects, type, filters), [projects, type, filters]);
  const count = Math.max(1, stoneCount || 1);

  return (
    <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-copper-600"><Sparkles className="h-4 w-4" /><h4 className="text-xs font-bold uppercase tracking-wide">{t('smartPrediction')}</h4></span>
        {prediction && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${prediction.confidence === 'high' ? 'bg-emerald-50 text-emerald-700' : prediction.confidence === 'medium' ? 'bg-gold-100 text-gold-700' : 'bg-cream-100 text-ink-500'}`}>{t(`confidence_${prediction.confidence}`)}</span>}
      </div>
      {!prediction ? (
        <p className="text-xs text-ink-400">{t('noSimilar')}</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-ink-500">
            {t('basedOnSimilar', { count: prediction.count })}
            {prediction.matched.length > 0 && <> · {t('matched')}: {prediction.matched.map(k => t(ATTR_KEY[k])).join(', ')}</>}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gold-100 bg-white p-3">
              <p className="kicker">{t('minutesPerStone')}</p>
              <p className="mt-1 text-base font-semibold text-copper-600 tnum">{fmtNumber(prediction.minutesPerStone.median, locale, 1)} min</p>
              <p className="text-[11px] text-ink-400">{t('timeRange')}: {fmtNumber(prediction.minutesPerStone.p25, locale, 0)}–{fmtNumber(prediction.minutesPerStone.p75, locale, 0)} min</p>
            </div>
            <div className="rounded-xl border border-gold-100 bg-white p-3">
              <p className="kicker">{t('pricePerStone')}</p>
              <p className="mt-1 text-base font-semibold text-copper-600 tnum">{prediction.pricePerStone ? `${fmtNumber(prediction.pricePerStone.median, locale, 1)} CHF` : '—'}</p>
              {prediction.pricePerStone && <p className="text-[11px] text-ink-400">{t('timeRange')}: {fmtNumber(prediction.pricePerStone.p25, locale, 0)}–{fmtNumber(prediction.pricePerStone.p75, locale, 0)} CHF</p>}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-ink-600">
            <span>
              {t('projected', { count })}: <span className="font-semibold text-ink-900">{fmtMinutes(prediction.minutesPerStone.median * count)}</span>
              {prediction.pricePerStone && <> · <span className="font-semibold text-ink-900">{fmtNumber(prediction.pricePerStone.median * count)} CHF</span></>}
              {prediction.chfPerHour && <span className="text-ink-400"> · {t('similarRate', { rate: prediction.chfPerHour })}</span>}
            </span>
            {onApply && (
              <button onClick={() => onApply({ totalTime: String(Math.round(prediction.minutesPerStone.median * count)), pricePerStone: prediction.pricePerStone ? String(Math.round(prediction.pricePerStone.median * 10) / 10) : '' })}
                className="inline-flex items-center gap-1 rounded-lg border border-gold-300 bg-white px-2.5 py-1 font-semibold text-copper-700 hover:bg-gold-50">
                <Check className="h-3.5 w-3.5" />{t('applyExperience')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SmartPrediction;
