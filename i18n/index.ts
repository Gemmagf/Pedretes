import { de } from './de';
import { en } from './en';
import { cat } from './cat';
import type { Translations, TranslationKey } from './de';

export type Language = 'de' | 'en' | 'cat';
export type { TranslationKey, Translations };

export const translations: Record<Language, Translations> = { de, en, cat };

export const LANGUAGE_LABELS: Record<Language, string> = { de: 'Deutsch', en: 'English', cat: 'Català' };
