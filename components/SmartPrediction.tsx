import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import type { Project, ProjectType } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { computePrediction } from '../utils/analytics';
import { fmtMinutes, fmtNumber } from '../utils/format';

interface Props {
  projects: Project[];
  type: ProjectType;
  filters: { style?: string; material?: string; stoneType?: string; shape?: string };
}

/** Time/price expectations from similar past orders (any backend). */
const SmartPrediction: React.FC<Props> = ({ projects, type, filters }) => {
  const { t } = useTranslation();
  const prediction = useMemo(() => computePrediction(projects, type, filters), [projects, type, filters]);

  return (
    <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-4">
      <div className="mb-2 flex items-center gap-2 text-copper-600">
        <Sparkles className="h-4 w-4" />
        <h4 className="text-xs font-bold uppercase tracking-wide">{t('smartPrediction')}</h4>
      </div>
      {!prediction ? (
        <p className="text-xs text-ink-400">{t('noSimilar')}</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-ink-500">{t('basedOnSimilar', { count: prediction.count })}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gold-100 bg-white p-3">
              <p className="kicker">{t('predictedTime')}</p>
              <p className="mt-1 text-base font-semibold text-copper-600">{fmtMinutes(prediction.avgTime)}</p>
              <p className="text-[11px] text-ink-400">{t('timeRange')}: {fmtMinutes(prediction.minTime)} – {fmtMinutes(prediction.maxTime)}</p>
            </div>
            <div className="rounded-xl border border-gold-100 bg-white p-3">
              <p className="kicker">{t('predictedPrice')}</p>
              <p className="mt-1 text-base font-semibold text-copper-600">{prediction.avgPrice ? `${fmtNumber(prediction.avgPrice)} CHF` : '—'}</p>
              {prediction.avgPrice && prediction.avgTime > 0 && (
                <p className="text-[11px] text-ink-400">{fmtNumber(prediction.avgPrice / (prediction.avgTime / 60))} CHF/h</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartPrediction;
