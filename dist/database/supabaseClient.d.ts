/**
 * Supabase REST API Client
 *
 * Uses raw fetch() to communicate with the Supabase PostgREST API.
 * No npm packages needed — works directly in the browser.
 */
export declare function translateText(text: string, targetLang: 'es' | 'en'): Promise<string>;
export declare function getDiasViaje(lang?: string): Promise<any[]>;
export declare function createDiaViaje(data: any): Promise<any>;
export declare function updateDiaViaje(id_dia: number, data: any): Promise<boolean>;
export declare function deleteDiaViaje(id_dia: number): Promise<boolean>;
export declare function getActividades(): Promise<any[]>;
export declare function createActividad(data: any): Promise<any>;
export declare function updateActividad(id_actividad: number, data: any): Promise<boolean>;
export declare function deleteActividad(id_actividad: number): Promise<boolean>;
export declare function isConfigured(): boolean;
