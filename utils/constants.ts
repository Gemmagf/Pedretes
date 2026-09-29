/** Default hourly rate used for cost tracking (CHF/h). */
export const HOURLY_RATE = 120;

/** Swiss VAT rate applied on quotes. */
export const VAT_RATE = 0.081;

/** Fallback gold price if no live quote is available (CHF per gram). */
export const GOLD_FALLBACK_CHF_PER_GRAM = 95;

/** B2B clients of the atelier (Zürich jewellers). */
export const CLIENTS = ['Beyer', 'Peclard', 'Lohri', 'Ann Perica', 'Messerer', 'Suenos', 'Meister', 'Steinlin', 'Flavia Tschanz', 'Maria Lutz'];

export const STORAGE_KEYS = {
  language: 'pedretes.lang',
  session: 'pedretes.session',
  localData: 'pedretes.local.v2',
  settings: 'pedretes.settings',
} as const;

/** Local (offline) account. Data lives in the browser only. */
export const LOCAL_ACCOUNT = { username: 'Sara', password: 'sareta', displayName: 'Sara' } as const;
