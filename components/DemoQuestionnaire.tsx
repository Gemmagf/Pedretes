import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Gem, Watch, Layers, Package, Scissors, Wrench, UtensilsCrossed, Paintbrush, Car, Hammer, Building2, ArrowRight } from 'lucide-react';
import { useDemo } from '../context/DemoContext';
import { useTranslation } from '../context/LanguageContext';
import type { CraftType, TeamSize, MainChallenge, DemoAnswers } from '../utils/demoData';
import { Button } from './ui';

const CRAFTS: { value: CraftType; icon: React.ReactNode }[] = [
  { value: 'jewelry', icon: <Gem className="h-5 w-5" /> },
  { value: 'watchmaking', icon: <Watch className="h-5 w-5" /> },
  { value: 'ceramics', icon: <Layers className="h-5 w-5" /> },
  { value: 'leather', icon: <Package className="h-5 w-5" /> },
  { value: 'textiles', icon: <Scissors className="h-5 w-5" /> },
  { value: 'bakery', icon: <UtensilsCrossed className="h-5 w-5" /> },
  { value: 'painter', icon: <Paintbrush className="h-5 w-5" /> },
  { value: 'mechanic', icon: <Car className="h-5 w-5" /> },
  { value: 'workshop', icon: <Hammer className="h-5 w-5" /> },
  { value: 'architect', icon: <Building2 className="h-5 w-5" /> },
  { value: 'other', icon: <Wrench className="h-5 w-5" /> },
];
const TEAM_SIZES: TeamSize[] = ['solo', 'small', 'medium', 'large'];
const CHALLENGES: MainChallenge[] = ['time', 'clients', 'costs', 'all'];

const optionCls = (active: boolean) =>
  `flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all hover:border-gold-400 hover:bg-gold-50/60 ${active ? 'border-copper-500 bg-gold-50' : 'border-cream-200'}`;

const DemoQuestionnaire: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const { enterDemo } = useDemo();
  const [step, setStep] = useState(0);
  const [craft, setCraft] = useState<CraftType | null>(null);
  const [teamSize, setTeamSize] = useState<TeamSize | null>(null);
  const [challenge, setChallenge] = useState<MainChallenge | null>(null);
  const [workshopName, setWorkshopName] = useState('');

  const start = () => {
    if (!craft || !teamSize || !challenge) return;
    const answers: DemoAnswers = { craft, teamSize, challenge, workshopName: workshopName.trim() || 'Mein Atelier' };
    enterDemo(answers);
    onClose();
  };

  const steps = [
    {
      title: t('q1Title'), sub: t('q1Sub'),
      content: (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CRAFTS.map(c => (
            <button key={c.value} onClick={() => { setCraft(c.value); setStep(1); }} className={optionCls(craft === c.value)}>
              <span className="shrink-0 text-copper-600">{c.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-ink-900">{t(`craft_${c.value}`)}</span>
                <span className="block truncate text-[10px] leading-tight text-ink-400">{t(`craftSub_${c.value}`)}</span>
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('q2Title'), sub: t('q2Sub'),
      content: (
        <div className="flex flex-col gap-2">
          {TEAM_SIZES.map(s => (
            <button key={s} onClick={() => { setTeamSize(s); setStep(2); }} className={optionCls(teamSize === s)}>
              <span><span className="block font-semibold text-ink-900">{t(`team_${s}`)}</span><span className="block text-xs text-ink-400">{t(`teamSub_${s}`)}</span></span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: t('q3Title'), sub: t('q3Sub'),
      content: (
        <div className="flex flex-col gap-2">
          {CHALLENGES.map(c => (
            <button key={c} onClick={() => setChallenge(c)} className={optionCls(challenge === c)}>
              <span><span className="block font-semibold text-ink-900">{t(`ch_${c}`)}</span><span className="block text-xs text-ink-400">{t(`chSub_${c}`)}</span></span>
            </button>
          ))}
          {challenge && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-3">
              <input className="input" placeholder={t('workshopNamePlaceholder')} value={workshopName} onChange={e => setWorkshopName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') start(); }} />
              <Button variant="gold" size="lg" className="w-full" onClick={start} icon={<ArrowRight className="h-4 w-4" />}>{t('startDemo')}</Button>
            </motion.div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/40 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 p-5">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink-900">{steps[step].title}</h2>
            <p className="mt-0.5 text-sm text-ink-400">{steps[step].sub}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-800" aria-label={t('close')}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-1.5 px-5 pt-4">
          {steps.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-copper-500' : 'bg-cream-200'}`} />)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="p-5">
            {steps[step].content}
          </motion.div>
        </AnimatePresence>
        {step > 0 && (
          <div className="px-5 pb-4">
            <button onClick={() => setStep(s => s - 1)} className="text-xs font-medium text-ink-400 hover:text-ink-800">← {t('back')}</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DemoQuestionnaire;
