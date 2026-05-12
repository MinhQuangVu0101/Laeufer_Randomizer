import { settings } from '../stores/settings.svelte';
import { de, type TranslationDict, type TranslationKey } from './de';
import { en } from './en';

export type { TranslationKey } from './de';
export type Lang = 'de' | 'en';

const dictionaries: Record<Lang, TranslationDict> = { de, en };

export function t(key: TranslationKey, interpolations?: Record<string, string | number>): string {
  const dict = dictionaries[settings.lang] ?? de;
  const value: string = dict[key] ?? de[key] ?? key;
  if (!interpolations) return value;
  return Object.entries(interpolations).reduce<string>(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    value,
  );
}

export function tLang(lang: Lang, key: TranslationKey): string {
  return dictionaries[lang][key] ?? de[key] ?? key;
}
