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
  kind: 'select' | 'number' | 'date';
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
  /** Price components before margin and urgency fee. */
  priceLines: (v: FormValues, minutes: number) => PriceLine[];
}

const num = (s: string) => Number(s) || 0;

export const OPTIONS = {
  allianceStoneTypes: ['weisse Diamanten', 'Korund + farbige Diamanten', 'empfindliche Steine'],
  allianceMaterials: ['WG + GG + Roségold', 'Rotgold', 'Platin'],
  allianceStyles: ['Fadenpavé', 'Arkaden', 'Fishtail', 'Fishtail gegenschnitt', 'Abgedeckt', 'Castel', 'Side by side', 'Kanalfassung'],
  allianceShapes: ['eckig', 'rund'],
  fassungShapes: ['rund', 'oval', 'princess', 'emerald', 'marquise', 'pear', 'heart', 'cushion'],
  fassungMaterials: ['WG', 'GG', 'Roségold', 'Platin'],
  fassungStyles: ['Classic', 'Modern', 'Vintage', 'Micro-Pavé', 'Halo'],
  fassungStoneTypes: ['Diamant', 'Saphir', 'Rubin', 'Smaragd', 'Sonstige'],
  paveStyles: ['wildes Pavé', 'Fadenpavé', 'Fadenpavé verlauf', 'Arkade', 'Fishtail', 'Fishtail gegenschnitt', 'Abgedeckt', 'Castel', 'Side by side', 'Kanalfassung'],
  paveLayouts: ['Lineal', 'Kreis', 'Rechteck', 'Oval', 'Freiform'],
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
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.allianceStoneTypes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.allianceMaterials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.allianceStyles },
      { name: 'shape', labelKey: 'shape', kind: 'select', options: OPTIONS.allianceShapes },
      common.stoneCount,
      { name: 'stoneSize', labelKey: 'stoneSize', kind: 'number', min: 0, step: '0.1' },
      { name: 'timePerStone', labelKey: 'timePerStone', kind: 'number', min: 0 },
      common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.timePerStone) * num(v.stoneCount),
    priceLines: (v, minutes) => [
      { key: 'labour', amount: (minutes / 60) * HOURLY_RATE, detail: `${(minutes / 60).toFixed(1)} h × ${HOURLY_RATE} CHF` },
      ...(num(v.pricePerStone) && num(v.stoneCount)
        ? [{ key: 'stones' as const, amount: num(v.pricePerStone) * num(v.stoneCount), detail: `${num(v.stoneCount)} × ${num(v.pricePerStone)} CHF` }]
        : []),
    ],
  },
  Fassung: {
    type: 'Fassung',
    titleKey: 'fassungFormTitle',
    subtitleKey: 'fassungSubtitle',
    hourlyRate: 140,
    fields: [
      common.client, common.assignedTo,
      { name: 'shape', labelKey: 'shape', kind: 'select', options: OPTIONS.fassungShapes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.fassungMaterials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.fassungStyles },
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.fassungStoneTypes },
      common.stoneCount, common.totalTime, common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.totalTime),
    priceLines: (v, minutes) => [
      { key: 'labour', amount: (minutes / 60) * 140, detail: `${(minutes / 60).toFixed(1)} h × 140 CHF` },
      ...(num(v.pricePerStone) && num(v.stoneCount)
        ? [{ key: 'stones' as const, amount: num(v.pricePerStone) * num(v.stoneCount), detail: `${num(v.stoneCount)} × ${num(v.pricePerStone)} CHF` }]
        : []),
    ],
  },
  Pave: {
    type: 'Pave',
    titleKey: 'paveFormTitle',
    subtitleKey: 'paveSubtitle',
    hourlyRate: HOURLY_RATE,
    fields: [
      common.client, common.assignedTo,
      { name: 'stoneType', labelKey: 'stoneType', kind: 'select', options: OPTIONS.allianceStoneTypes },
      { name: 'material', labelKey: 'material', kind: 'select', options: OPTIONS.allianceMaterials },
      { name: 'style', labelKey: 'style', kind: 'select', options: OPTIONS.paveStyles },
      { name: 'layout', labelKey: 'layout', kind: 'select', options: OPTIONS.paveLayouts },
      { name: 'fixation', labelKey: 'fixation', kind: 'select', options: OPTIONS.paveFixations },
      common.stoneCount, common.totalTime, common.pricePerStone, common.goldWeight, common.deadline,
    ],
    estimateMinutes: v => num(v.totalTime),
    // Pavé is priced per stone (labour is included in the stone price).
    priceLines: v => [
      { key: 'stones', amount: num(v.pricePerStone) * num(v.stoneCount), detail: `${num(v.stoneCount)} × ${num(v.pricePerStone)} CHF` },
    ],
  },
};

export const EMPTY_FORM: FormValues = {
  projectName: '', agreedPrice: '', client: '', assignedTo: '', stoneType: '', material: '', style: '', shape: '',
  layout: '', fixation: '', stoneCount: '', stoneSize: '', timePerStone: '', totalTime: '', pricePerStone: '',
  goldWeight: '', deadline: '',
};

export const TYPE_LABEL: Record<ProjectType, string> = { Alliance: 'Alliance', Fassung: 'Fassung', Pave: 'Pavé' };
