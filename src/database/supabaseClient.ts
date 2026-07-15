/**
 * Supabase REST API Client
 * 
 * Uses raw fetch() to communicate with the Supabase PostgREST API.
 * No npm packages needed — works directly in the browser.
 */

// ⚠️ REPLACE THESE WITH YOUR SUPABASE PROJECT VALUES
const SUPABASE_URL = 'https://lxgwxjnmpnfcoeblztee.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AYWCmwgfQU6fXsrwQMMbpA_63oViV1R';

const REST_URL = `${SUPABASE_URL}/rest/v1`;

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
// Translation Utility (MyMemory API)
// =============================================
export async function translateText(text: string, targetLang: 'es' | 'en'): Promise<string> {
  if (!text) return text;
  
  const sourceLang = targetLang === 'en' ? 'es' : 'en';
  
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.error('Error traduciendo texto:', error);
  }

  // Fallback en caso de que la API falle
  return `[${targetLang.toUpperCase()}] ${text}`;
}

// =============================================
// CRUD: diaViaje
// =============================================

export async function getDiasViaje(lang: string = 'es'): Promise<any[]> {
  const selectQuery = `id_dia, fecha, descripcion:descripcion_${lang}, actividadDia(id_actividad, id_dia, hora, titulo:titulo_${lang}, descripcion:descripcion_${lang}, url, reservaLink, notas:notas_${lang})`;
  const res = await fetch(`${REST_URL}/diaViaje?select=${selectQuery}&order=id_dia.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function createDiaViaje(data: any): Promise<any> {
  const res = await fetch(`${REST_URL}/diaViaje`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0];
}

export async function updateDiaViaje(id_dia: number, data: any): Promise<boolean> {
  const res = await fetch(`${REST_URL}/diaViaje?id_dia=eq.${id_dia}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.ok;
}

export async function deleteDiaViaje(id_dia: number): Promise<boolean> {
  const res = await fetch(`${REST_URL}/diaViaje?id_dia=eq.${id_dia}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.ok;
}

// =============================================
// CRUD: actividadDia
// =============================================

export async function getActividades(): Promise<any[]> {
  const res = await fetch(`${REST_URL}/actividadDia?order=hora.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function createActividad(data: any): Promise<any> {
  const res = await fetch(`${REST_URL}/actividadDia`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0];
}

export async function updateActividad(id_actividad: number, data: any): Promise<boolean> {
  const res = await fetch(`${REST_URL}/actividadDia?id_actividad=eq.${id_actividad}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  });
  return res.ok;
}

export async function deleteActividad(id_actividad: number): Promise<boolean> {
  const res = await fetch(`${REST_URL}/actividadDia?id_actividad=eq.${id_actividad}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.ok;
}

export function isConfigured(): boolean {
  return !SUPABASE_URL.includes('YOUR-PROJECT-ID');
}
