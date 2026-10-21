'use client';
// Schlanke i18n für den statischen Export: UI-Texte aus content/i18n, Sprache als Geräte-Einstellung.
// Inhalte (Leistungen, Texte) sind zunächst Deutsch; EN-Texte folgen (Platzhalter).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import de from '@content/i18n/de.json';
import en from '@content/i18n/en.json';
import { getAdapter } from '@/data';

export type Locale = 'de' | 'en';
type Key = keyof typeof de;
const dict: Record<Locale, Record<Key, string>> = { de, en };

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: (k: Key) => string }>({
  locale: 'de',
  setLocale: () => undefined,
  t: (k) => de[k],
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de');
  useEffect(() => {
    getAdapter().getPref<Locale>('locale', 'de').then(setLocaleState);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    void getAdapter().setPref('locale', l);
  };
  return (
    <Ctx.Provider value={{ locale, setLocale, t: (k) => dict[locale][k] || de[k] }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
