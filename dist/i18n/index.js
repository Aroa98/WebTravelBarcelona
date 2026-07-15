import { es } from './es.js';
import { en } from './en.js';
const dictionaries = {
    es,
    en
};
export function getLanguage() {
    return (localStorage.getItem('app-lang') || 'es');
}
export function t(key) {
    const lang = getLanguage();
    return dictionaries[lang][key] || dictionaries['es'][key] || key;
}
