/**
 * Supabase REST API Client
 *
 * Uses raw fetch() to communicate with the Supabase PostgREST API.
 * No npm packages needed — works directly in the browser.
 *
 * IMPORTANT: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
 * actual values from Supabase Dashboard → Settings → API.
 */
/**
 * Fetch UI texts for a given language
 */
export declare function fetchUiTexts(lang: string): Promise<Record<string, unknown> | null>;
/**
 * Fetch all days for a given language, ordered by id
 */
export declare function fetchDays(lang: string): Promise<Array<{
    id: number;
    fecha: string;
    titulo_principal: string;
    actividades: unknown[];
}>>;
/**
 * Update a day's data (actividades, fecha, titulo_principal)
 */
export declare function updateDay(dayId: number, lang: string, data: {
    fecha?: string;
    titulo_principal?: string;
    actividades?: unknown[];
}): Promise<boolean>;
/**
 * Check if Supabase is reachable (used for fallback logic)
 */
export declare function isConfigured(): boolean;
//# sourceMappingURL=supabaseClient.d.ts.map