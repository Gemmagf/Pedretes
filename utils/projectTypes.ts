import type { ProjectType } from '../types';
import type { TranslationKey } from '../i18n';
import { HOURLY_RATE } from './constants';

export type FormFieldName =
  | 'client' | 'assignedTo' | 'stoneType' | 'material' | 'style' | 'shape' | 'layout' | 'fixation'
  | 'stoneCount' | 'stoneSize' | 'timePerStone' | 'totalTime' | 'pricePerStone' | 'goldWeight' | 'deadline';

export type FormValues = Record<FormFieldName | 'projectName' | 'agreedPrice', string>;

export interface FieldDef {
  name: FormFieldName;
  labelKey: TranslationKey;
  kind: 'select' | 'number' | 'date' | 'text';
  /** Select options, or suggestions for a free-text field. */
  options?: string[];
  step?: string;
  min?: number;
}

export interface PriceLine { key: 'labour' | 'stones'; amount: number; detail: string; }

export interface ProjectTypeConfig {
  type: ProjectType;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  hourlyRate: number;
  fields: FieldDef[];
  /** Estimated working minutes for the job. */
  estimateMinutes: (v: FormValues) => number;
  /** Price components before margin and urgency fee (rate = configured target CHF/h). */
  priceLines: (v: FormValues, minutes: number, rate: number) => PriceLine[];
}

const num = (s: string) => Number(s) || 0;

/** The atelier prices per stone (labour included); time × rate is the fallback when no stone price is set. */
const perStonePricing = (v: FormValues, minutes: number, rate: number): PriceLine[] => {
  if (num(v.pricePerStone) && num(v.stoneCount)) {
    return [{ key: 'stones', amount: num(v.pricePerStone) * num(v.stoneCount), detail: `${num(v.stoneCount)} × ${num(v.pricePerStone)} CHF` }];
  }
  return minutes > 0 ? [{ key: 'labour', amount: (minutes / 60) * rate, detail: `${(minutes / 60).toFixed(1)} h × ${rate} CHF` }] : [];
};

/** Options of the atelier's real order forms ("Formular Sareta"). */
export const OPTIONS = {
  stoneTypes: ['weiße Diamanten', 'Korund + farbige Diamanten', 'empfindliche Steine'],
  materials: ['WG + GG + Roségold', 'Rotgold', 'Platin'],
  allianceStyles: ['Fadenpavé', 'Arkaden', 'Fishtail', 'Fishtail gegenschnitt', 'Abgedeckt', 'Castel', 'Side by side', 'Kanalfassung', 'Shared Prong'],
  allianceShapes: ['eckig', 'rund'],
  fassungShapes: ['Rund', 'Oval', 'Kissen', 'Tropfen', 'Emerald', 'Asher', 'Baguette', 'Cabochon', 'Navette', 'Marquise', 'Sugarloaf', 'Prinzess', 'Herz', 'Radiant', 'Halbmond'],
  fassungStyles: ['Geschlossen', 'runde Griffe', 'spitzige Griffe', 'Fassung "tächli" mit Tropfen oder Marquise', 'Eingerieben', 'extra dicke Griffe oder komplex zum einkitten'],
  paveStyles: ['wildes Pavé', 'Fadenpavé', 'Fadenpavé verlauf', 'Honeycomb', 'Freiform verschnitten (z.B Ornamente)', 'Eingerieben', 'Eingerieben innen', 'Stern', 'Entourage spezial (z.B Arkade)', 'Abgedeckt', 'Arkade', 'Fishtail', 'Kanalfassung', 'Castel'],
  paveLayouts: ['vorhanden', 'nicht vorhanden'],
  paveFixations: ['einfache Fixierung', 'komplexe Fixierung'],
};

const common = {
  client: { name: 'client', labelKey: 'client', kind: 'select' } as FieldDef,
  assignedTo: { name: 'assignedTo', labelKey: 'assignedTo', kind: 'select' } as FieldDef,
  stoneCount: { name: 'stoneCount', labelKey: 'stoneCount', kind: 'number', min: 0 } as FieldDef,
  pricePerStone: { name: 'pricePerStone', labelKey: 'pricePerStone', kind: 'number', min: 0, step: '0.5' } as FieldDef,
  goldWeight: { name: 'goldWeight', labelKey: 'goldBack', kind: 'number', min: 0, step: '0.1' } as FieldDef,
  deadline: { name: 'deadline', labelKey: 'deadline', kind: 'date' } as FieldDef,
  totalTime: { name: 'totalTime', labelKey: 'totalTime', kind: 'number', min: 0 } as FieldDef,
};

export const PROJECT_TYPE_CONFIG: Record<ProjectType, ProjectTypeConfig> = {
  Alliance: {
    type: 'Alliance',
    titleKey: 'allianceFormTitle',
    subtitleKey: 'allianceSubtitle',
    hourlyRate: HOURLY_RATE,
    fields: [
      common.client, common.assignedTo,
      { name: 'stoneSize', labelKey: 'stoneSize', kind: 'number', min: 0, step: '0.1' },
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.stoneTypes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.materials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.allianceStyles },
      { name: 'shape', labelKey: 'shape', kind: 'select', options: OPTIONS.allianceShapes },
      common.stoneCount, common.totalTime, common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.totalTime),
    priceLines: perStonePricing,
  },
  Fassung: {
    type: 'Fassung',
    titleKey: 'fassungFormTitle',
    subtitleKey: 'fassungSubtitle',
    hourlyRate: HOURLY_RATE,
    fields: [
      common.client, common.assignedTo,
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.stoneTypes },
      { name: 'shape', labelKey: 'shape', kind: 'text', options: OPTIONS.fassungShapes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.materials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.fassungStyles },
      common.stoneCount, common.totalTime, common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.totalTime),
    priceLines: perStonePricing,
  },
  Pave: {
    type: 'Pave',
    titleKey: 'paveFormTitle',
    subtitleKey: 'paveSubtitle',
    hourlyRate: HOURLY_RATE,
    fields: [
      common.client, common.assignedTo,
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.stoneTypes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.materials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.paveStyles },
      { name: 'layout', labelKey: 'layout', kind: 'select', options: OPTIONS.paveLayouts },
      { name: 'fixation', labelKey: 'fixation', kind: 'select', options: OPTIONS.paveFixations },
      common.stoneCount, common.totalTime, common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.totalTime),
    priceLines: perStonePricing,
  },
};

export const EMPTY_FORM: FormValues = {
  projectName: '', agreedPrice: '', client: '', assignedTo: '', stoneType: '', material: '', style: '', shape: '',
  layout: '', fixation: '', stoneCount: '', stoneSize: '', timePerStone: '', totalTime: '', pricePerStone: '',
  goldWeight: '', deadline: '',
};

export const TYPE_LABEL: Record<ProjectType, string> = { Alliance: 'Alliance', Fassung: 'Fassung', Pave: 'Pavé' };
