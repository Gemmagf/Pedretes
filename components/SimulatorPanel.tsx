import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, CalendarCheck, Coins, Check } from 'lucide-react';
import type { Project, User } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { getGoldPricePerGram, type GoldSource } from '../services/goldAPI';
import { type FormValues, type ProjectTypeConfig } from '../utils/projectTypes';
import { openMinutesFor, suggestDeliveryDate } from '../utils/scheduling';
import { fmtDate, fmtMinutes, fmtNumber } from '../utils/format';
import { Button } from './ui';
import SmartPrediction from './SmartPrediction';

interface Props {
  config: ProjectTypeConfig;
  values: FormValues;
  users: User[];
  projects: Project[];
  onApply: (patch: { agreedPrice: string; deadline: string }) => void;
}

/** Live quote: price breakdown, capacity-aware delivery date, gold value and experience data. */
const SimulatorPanel: React.FC<Props> = ({ config, values, users, projects, onApply }) => {
  const { t, locale } = useTranslation();
  const [margin, setMargin] = useState(1);
  const [urgency, setUrgency] = useState(0);
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [goldSource, setGoldSource] = useState<GoldSource | 'manual'>('fallback');

  useEffect(() => {
    let active = true;
    getGoldPricePerGram().then(q => { if (active) { setGoldPrice(q.price); setGoldSource(q.source); } });
    return () => { active = false; };
  }, []);

  const minutes = config.estimateMinutes(values);
  const lines = useMemo(() => config.priceLines(values, minutes), [config, values, minutes]);
  const base = lines.reduce((a, l) => a + l.amount, 0);
  const total = Math.round(base * margin + urgency);

  const user = users.find(u => u.id === values.assignedTo);
  const schedule = useMemo(() => suggestDeliveryDate({
    minutes,
    user,
    openMinutes: openMinutesFor(projects, user?.id),
  }), [minutes, user, projects]);

  const goldWeight = Number(values.goldWeight) || 0;
  const goldValue = goldWeight && goldPrice ? Math.round(goldWeight * goldPrice) : 0;
  const filters = useMemo(() => ({ style: values.style, material: values.material, stoneType: values.stoneType, shape: values.shape }), [values.style, values.material, values.stoneType, values.shape]);
  const hasInput = minutes > 0 || base > 0;

  return (
    <aside className="card flex flex-col overflow-hidden xl:sticky xl:top-6">
      <div className="border-b border-cream-200 bg-gradient-to-r from-gold-50 to-white px-5 py-4">
        <div className="flex items-center gap-2 text-copper-600">
          <Calculator className="h-5 w-5" />
          <h3 className="text-sm font-bold uppercase tracking-wide">{t('proposalSimulation')}</h3>
        </div>
        <p className="mt-0.5 text-xs text-ink-400">{t('simulatorHint')}</p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label mb-0">{t('difficultyMargin')}</label>
            <span className="font-mono text-xs font-bold text-copper-600">×{margin.toFixed(1)}</span>
          </div>
          <input type="range" min="1" max="2" step="0.1" value={margin} onChange={e => setMargin(parseFloat(e.target.value))} className="w-full" />
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink-400"><span>{t('standard')}</span><span>{t('complex')}</span></div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div>
            <label className="label">{t('urgencyFee')}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400">CHF</span>
              <input type="number" min={0} value={urgency} onChange={e => setUrgency(Number(e.target.value) || 0)} className="input pl-11" />
            </div>
          </div>
          <div>
            <label className="label">{t('goldPriceLabel')}</label>
            <input type="number" min={0} step="0.5" value={goldPrice || ''} onChange={e => { setGoldPrice(Number(e.target.value) || 0); setGoldSource('manual'); }} className="input" />
            <p className="mt-1 text-[10px] text-ink-400">{t(`goldSource_${goldSource}`)}</p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
          <ul className="space-y-1.5 text-sm">
            {lines.map(l => (
              <li key={l.key} className="flex items-baseline justify-between gap-2">
                <span className="text-ink-600">{t(l.key === 'labour' ? 'labour' : 'stones')} <span className="text-xs text-ink-400">· {l.detail}</span></span>
                <span className="font-medium tabular-nums text-ink-900">{fmtNumber(l.amount)}</span>
              </li>
            ))}
            {margin > 1 && <li className="flex justify-between text-xs text-ink-500"><span>{t('difficultyMargin')} ×{margin.toFixed(1)}</span><span>+{fmtNumber(base * (margin - 1))}</span></li>}
            {urgency > 0 && <li className="flex justify-between text-xs text-ink-500"><span>{t('urgencyFee')}</span><span>+{fmtNumber(urgency)}</span></li>}
          </ul>
          <div className="mt-3 flex items-end justify-between border-t border-cream-300 pt-3">
            <span className="kicker">{t('suggestedPrice')}</span>
            <span className="font-serif text-2xl font-semibold text-copper-600">{fmtNumber(total)} <span className="text-sm font-sans text-ink-500">CHF</span></span>
          </div>
          {minutes > 0 && <p className="mt-1 text-right text-[11px] text-ink-400">{fmtMinutes(minutes)} · {fmtNumber(total / (minutes / 60))} CHF/h</p>}
        </div>

        {/* Delivery */}
        <div className="flex items-start gap-3 rounded-2xl border border-cream-200 p-4">
          <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-copper-500" />
          <div className="min-w-0">
            <p className="kicker">{t('suggestedDate')}</p>
            <p className="mt-0.5 text-base font-semibold text-ink-900">{fmtDate(schedule.date, locale, { weekday: 'short', day: '2-digit', month: 'short' })}</p>
            <p className="text-[11px] text-ink-400">
              {user ? t('capacityHint', { days: schedule.workingDays, queue: fmtMinutes(schedule.queueMinutes), name: user.name }) : t('capacityHintTeam', { days: schedule.workingDays })}
            </p>
          </div>
        </div>

        {goldValue > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-gold-200 bg-gold-50/60 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm text-ink-700"><Coins className="h-4 w-4 text-gold-600" />{t('goldValue')} · {goldWeight} g</span>
            <span className="font-semibold text-gold-700">{fmtNumber(goldValue)} CHF</span>
          </div>
        )}

        <SmartPrediction projects={projects} type={config.type} filters={filters} />

        <Button variant="gold" className="w-full" disabled={!hasInput} icon={<Check className="h-4 w-4" />}
          onClick={() => onApply({ agreedPrice: String(total), deadline: schedule.date })}>
          {t('applySuggestion')}
        </Button>
      </div>
    </aside>
  );
};

export default SimulatorPanel;
