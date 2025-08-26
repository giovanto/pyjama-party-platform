import en from './en.json';
import de from './de.json';
import fr from './fr.json';

type Dictionaries = {
  [key: string]: any;
};

const dictionaries: Dictionaries = { en, de, fr };

export type Locale = keyof typeof dictionaries;

export function t(key: string, locale: Locale = 'en'): string {
  const dict = dictionaries[locale] || dictionaries.en;
  return key.split('.').reduce((acc: any, part: string) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict) ?? key;
}

