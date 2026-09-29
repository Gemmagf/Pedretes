import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n';
import { LOCALES } from '../utils/format';
import { STORAGE_KEYS } from '../utils/constants';

type Params = Record<string, string | number>;

interface LanguageContextType {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Params) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const readStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.language);
    if (stored === 'de' || stored === 'en' || stored === 'cat') return stored;
  } catch { /* storage unavailable */ }
  return 'de';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEYS.language, lang); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'cat' ? 'ca' : language;
  }, [language]);

  const t = useCallback((key: TranslationKey, params?: Params) => {
    let text: string = translations[language][key] ?? translations.de[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) text = text.split(`{${k}}`).join(String(v));
    }
    return text;
  }, [language]);

  const value = useMemo(() => ({ language, locale: LOCALES[language], setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};
