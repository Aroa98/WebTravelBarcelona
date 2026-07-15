import { es } from './es.js';
export type TranslationKey = keyof typeof es;
export declare function getLanguage(): 'es' | 'en';
export declare function t(key: TranslationKey): any;
