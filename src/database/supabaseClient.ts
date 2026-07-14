/**
 * Supabase REST API Client
 * 
 * Uses raw fetch() to communicate with the Supabase PostgREST API.
 * No npm packages needed — works directly in the browser.
 * 
 * IMPORTANT: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
 * actual values from Supabase Dashboard → Settings → API.
 */

// ⚠️ REPLACE THESE WITH YOUR SUPABASE PROJECT VALUES
const SUPABASE_URL = 'https://lxgwxjnmpnfcoeblztee.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AYWCmwgfQU6fXsrwQMMbpA_63oViV1R';

const REST_URL = `${SUPABASE_URL}/rest/v1`;

/**
 * Common headers for all Supabase requests
 */
function getHeaders(preferReturn: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
  if (preferReturn) {
    headers['Prefer'] = 'return=representation';
  }
  return headers;
}

// =============================================
// READ Operations
// =============================================

/**
 * Fetch UI texts for a given language
 */
export async function fetchUiTexts(lang: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${REST_URL}/ui_texts?lang=eq.${lang}&select=data`, {
    headers: getHeaders()
  });
  if (!res.ok) return null;
  const rows = await res.json() as Array<{ data: Record<string, unknown> }>;
  return rows[0]?.data ?? null;
}

/**
 * Fetch all days for a given language, ordered by id
 */
export async function fetchDays(lang: string): Promise<Array<{
  id: number;
  fecha: string;
  titulo_principal: string;
  actividades: unknown[];
}>> {
  const res = await fetch(`${REST_URL}/days?lang=eq.${lang}&order=id.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  return await res.json();
}

// =============================================
// WRITE Operations
// =============================================

/**
 * Update a day's data (actividades, fecha, titulo_principal)
 */
export async function updateDay(
  dayId: number,
  lang: string,
  data: {
    fecha?: string;
    titulo_principal?: string;
    actividades?: unknown[];
  }
): Promise<boolean> {
  const res = await fetch(
    `${REST_URL}/days?id=eq.${dayId}&lang=eq.${lang}`,
    {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    }
  );
  return res.ok;
}

/**
 * Check if Supabase is reachable (used for fallback logic)
 */
export function isConfigured(): boolean {
  return !SUPABASE_URL.includes('YOUR-PROJECT-ID');
}
