import { es } from './es.js';
import { en } from './en.js';

export type TranslationKey = keyof typeof es;

const dictionaries = {
  es,
  en
};

export function getLanguage(): 'es' | 'en' {
  return (localStorage.getItem('app-lang') || 'es') as 'es' | 'en';
}

export function t(key: TranslationKey): any {
  const lang = getLanguage();
  return dictionaries[lang][key] || dictionaries['es'][key] || key;
}
