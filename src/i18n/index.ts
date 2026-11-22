import { Language, UserRole } from '../types/kisansetu';
import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationSchema = DeepStringify<typeof en>;

type NestedKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : NestedKeys<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = NestedKeys<typeof en>;

export interface LanguageOption {
  code: Language;
  nativeName: string;
  englishName: string;
  htmlLang: string;
}

export const LANGUAGE_STORAGE_KEY = 'kisansetu_language';

/**
 * Scalable registry of supported languages.
 * Additional Indian languages (mr, ta, bn, pa, etc.) can be added by
 * appending a dictionary file and registering it here.
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', htmlLang: 'en' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', htmlLang: 'hi' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', htmlLang: 'gu' },
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  gu: 'ગુજરાતી',
};

const DICTIONARIES: Record<Language, TranslationSchema> = {
  en,
  hi,
  gu,
};

export function isSupportedLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'hi' || value === 'gu';
}

export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(raw)) return raw;
  } catch {
    // Ignore storage read errors
  }
  return 'en';
}

export function saveLanguagePreference(language: Language): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  } catch {
    // Ignore storage write errors
  }
}

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let curr: unknown = obj;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in (curr as Record<string, unknown>)) {
      curr = (curr as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === 'string' ? curr : undefined;
}

export function translate(
  lang: Language,
  key: TranslationKey | string,
  vars?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  let template = getNestedValue(dict, key) ?? getNestedValue(DICTIONARIES.en, key) ?? key;
  if (vars) {
    for (const [varKey, varVal] of Object.entries(vars)) {
      template = template.replaceAll(`{${varKey}}`, String(varVal));
    }
  }
  return template;
}

export function translateCrop(lang: Language, cropName: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const trimmed = cropName.trim();
  const map = dict.enums.crops as Record<string, string>;
  if (map[trimmed]) return map[trimmed];
  const foundKey = Object.keys(map).find((k) => k.toLowerCase() === trimmed.toLowerCase());
  return foundKey ? map[foundKey] : cropName;
}

export function translateStatus(lang: Language, status: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const map = dict.enums.statuses as Record<string, string>;
  return map[status] || status;
}

export function translateVehicle(lang: Language, vehicle: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const map = dict.enums.vehicles as Record<string, string>;
  return map[vehicle] || vehicle;
}

export function translateDay(lang: Language, day: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const map = dict.enums.days as Record<string, string>;
  return map[day] || day;
}

export function translateWeatherCondition(lang: Language, condition: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const map = dict.enums.weatherConditions as Record<string, string>;
  return map[condition] || condition;
}

export function translateGrowthStage(lang: Language, stage: string): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const map = dict.enums.growthStages as Record<string, string>;
  return map[stage] || stage;
}

export function translateRole(lang: Language, role: UserRole): string {
  switch (role) {
    case 'farmer':
      return translate(lang, 'auth.roleFarmerTitle');
    case 'buyer':
      return translate(lang, 'auth.roleBuyerTitle');
    case 'transport':
      return translate(lang, 'auth.roleTransportTitle');
    case 'admin':
      return translate(lang, 'auth.roleAdminTitle');
    default:
      return role;
  }
}

export function getGreeting(lang: Language, name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return translate(lang, 'dashboard.greetingMorning', { name });
  if (hour < 17) return translate(lang, 'dashboard.greetingAfternoon', { name });
  return translate(lang, 'dashboard.greetingEvening', { name });
}
