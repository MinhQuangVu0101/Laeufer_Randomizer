import { describe, expect, it } from 'vitest';
import { t, tLang } from './index';
import { settings } from '../stores/settings.svelte';
import { de } from './de';
import { en } from './en';

describe('i18n dictionaries', () => {
  it('de and en have identical key sets', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort());
  });

  it('every value is a non-empty string', () => {
    for (const value of Object.values(de)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
    for (const value of Object.values(en)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});

describe('tLang (pure lookup)', () => {
  it('returns German for de lang', () => {
    expect(tLang('de', 'appTitle')).toBe('Volleyball Generator');
    expect(tLang('de', 'posAussen')).toBe('Aussenangreifer');
  });

  it('returns English for en lang', () => {
    expect(tLang('en', 'posAussen')).toBe('Outside Hitter');
    expect(tLang('en', 'modePositions')).toBe('With positions');
  });
});

describe('t (reactive lookup)', () => {
  it('reads from active settings.lang', () => {
    settings.lang = 'de';
    expect(t('posLibero')).toBe('Libero');
    settings.lang = 'en';
    expect(t('posLibero')).toBe('Libero');
    settings.lang = 'de';
    expect(t('benchHeader')).toBe('Auswechselbank');
    settings.lang = 'en';
    expect(t('benchHeader')).toBe('Bench');
  });

  it('interpolates {n} placeholders', () => {
    settings.lang = 'de';
    expect(t('historyMinutesAgo', { n: 5 })).toBe('vor 5 min');
    settings.lang = 'en';
    expect(t('historyMinutesAgo', { n: 12 })).toBe('12 min ago');
  });
});
