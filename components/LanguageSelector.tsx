import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { LANGUAGE_LABELS, type Language } from '../i18n';

export const LanguageSelector: React.FC<{ className?: string; compact?: boolean; dark?: boolean }> = ({ className = '', compact, dark }) => {
  const { language, setLanguage, t } = useTranslation();
  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${dark ? 'border-white/10 bg-white/5 text-cream-200 hover:bg-white/10' : 'border-cream-300 bg-white text-ink-700'} ${className}`}>
      <Globe className={`h-3.5 w-3.5 ${dark ? 'text-gold-300' : 'text-ink-400'}`} />
      <span className="sr-only">{t('language')}</span>
      <select value={language} onChange={e => setLanguage(e.target.value as Language)} className={`cursor-pointer bg-transparent outline-none ${dark ? '[&>option]:text-ink-900' : ''}`}>
        {(Object.keys(LANGUAGE_LABELS) as Language[]).map(l => (
          <option key={l} value={l}>{compact ? l.toUpperCase() : LANGUAGE_LABELS[l]}</option>
        ))}
      </select>
    </label>
  );
};
