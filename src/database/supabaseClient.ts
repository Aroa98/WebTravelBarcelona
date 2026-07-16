import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno (Vite) en lugar de valores hardcoded
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// Translation Utility (MyMemory API)
// =============================================
/** Strips any HTML/SVG tags the MyMemory API may inject in its response */
function stripHtml(raw: string): string {
  // Use a temporary element to decode HTML entities and remove tags
  const tmp = document.createElement('div');
  tmp.innerHTML = raw;
  return (tmp.textContent || tmp.innerText || '').trim();
}

export async function translateText(text: string, targetLang: 'es' | 'en'): Promise<string> {
  if (!text) return text;
  
  const sourceLang = targetLang === 'en' ? 'es' : 'en';
  
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      const cleaned = stripHtml(data.responseData.translatedText);
      // Fallback to original if the API returns garbage or an empty string
      return cleaned.length > 0 ? cleaned : text;
    }
  } catch (error) {
    console.error('Error traduciendo texto:', error);
  }

  // Fallback si la API falla
  return text;
}

// =============================================
// CRUD: diaViaje
// =============================================

export async function getDiasViaje(lang: string = 'es'): Promise<any[]> {
  const selectQuery = `id_dia, fecha, descripcion:descripcion_${lang}, alojamiento(id_alojamiento, nombre, url, direccion), actividadDia(id_actividad, id_dia, hora, titulo:titulo_${lang}, descripcion:descripcion_${lang}, url, reservaLink, notas:notas_${lang})`;
  const { data, error } = await supabase
    .from('diaViaje')
    .select(selectQuery)
    .order('id_dia', { ascending: true });

  if (error) {
    console.error('Error in getDiasViaje:', error);
    return [];
  }
  return data || [];
}

// =============================================
// CRUD: alojamiento
// =============================================

export async function getAlojamientos(): Promise<any[]> {
  const { data, error } = await supabase
    .from('alojamiento')
    .select('id_alojamiento, nombre, url, direccion')
    .order('nombre', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createAlojamiento(data: any): Promise<any> {
  const { data: result, error } = await supabase
    .from('alojamiento')
    .insert([data])
    .select();

  if (error) return null;
  return result?.[0];
}

export async function updateAlojamiento(id_alojamiento: number, data: any): Promise<boolean> {
  const { error } = await supabase
    .from('alojamiento')
    .update(data)
    .eq('id_alojamiento', id_alojamiento);

  return !error;
}


export async function createDiaViaje(data: any): Promise<any> {
  const { data: result, error } = await supabase
    .from('diaViaje')
    .insert([data])
    .select();

  if (error) return null;
  return result?.[0];
}

export async function updateDiaViaje(id_dia: number, data: any): Promise<boolean> {
  const { error } = await supabase
    .from('diaViaje')
    .update(data)
    .eq('id_dia', id_dia);

  return !error;
}

export async function deleteDiaViaje(id_dia: number): Promise<boolean> {
  const { error } = await supabase
    .from('diaViaje')
    .delete()
    .eq('id_dia', id_dia);

  return !error;
}

// =============================================
// CRUD: actividadDia
// =============================================

export async function getActividades(): Promise<any[]> {
  const { data, error } = await supabase
    .from('actividadDia')
    .select('*')
    .order('hora', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createActividad(data: any): Promise<any> {
  const { data: result, error } = await supabase
    .from('actividadDia')
    .insert([data])
    .select();

  if (error) return null;
  return result?.[0];
}

export async function updateActividad(id_actividad: number, data: any): Promise<boolean> {
  const { error } = await supabase
    .from('actividadDia')
    .update(data)
    .eq('id_actividad', id_actividad);

  return !error;
}

export async function deleteActividad(id_actividad: number): Promise<boolean> {
  const { error } = await supabase
    .from('actividadDia')
    .delete()
    .eq('id_actividad', id_actividad);

  return !error;
}

export function isConfigured(): boolean {
  return SUPABASE_URL !== '' && !SUPABASE_URL.includes('YOUR-PROJECT-ID');
}
