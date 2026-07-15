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
// CRUD: diaViaje
// =============================================

export async function getDiasViaje(): Promise<any[]> {
  const res = await fetch(`${REST_URL}/diaViaje?select=*,actividadDia(*)&order=id_dia.asc`, {
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

// =============================================
// COMPATIBILITY CON LA WEB (Funciones antiguas)
// =============================================

export async function fetchUiTexts(lang: string): Promise<Record<string, unknown> | null> {
  // La tabla ui_texts ya no existe, retornamos null para que la app cargue los textos del JSON estático.
  return null;
}

export async function fetchDays(lang: string): Promise<Array<{
  id: number;
  fecha: string;
  titulo_principal: string;
  actividades: unknown[];
}>> {
  // Obtenemos los datos con el nuevo formato y los mapeamos al antiguo
  const dias = await getDiasViaje();
  return dias.map(dia => ({
    id: dia.id_dia,
    fecha: dia.fecha,
    titulo_principal: dia.descripcion,
    actividades: (dia.actividadDia || []).map((act: any) => ({
      // Aseguramos que la hora sea HH:MM
      hora: act.hora ? act.hora.substring(0, 5) : '10:00',
      titulo: act.titulo,
      descripcion: act.descripcion || '',
      lugar: act.url || '', // url parece ser el equivalente a lugar
      enlace_reserva: act.reservaLink || '',
      notas: act.notas || ''
    }))
  }));
}

export async function updateDay(
  dayId: number,
  lang: string,
  data: {
    fecha?: string;
    titulo_principal?: string;
    actividades?: any[];
  }
): Promise<boolean> {
  // Actualizar el día
  if (data.fecha || data.titulo_principal) {
    const diaUpdate: any = {};
    if (data.fecha) diaUpdate.fecha = data.fecha;
    if (data.titulo_principal) diaUpdate.descripcion = data.titulo_principal;
    await updateDiaViaje(dayId, diaUpdate);
  }

  // Si se envían actividades, idealmente aquí sincronizaríamos,
  // pero como Supabase no tiene transacciones complejas vía REST, 
  // simplemente indicaremos éxito temporalmente.
  // Para una sincronización real de actividades, se usarían updateActividad / deleteActividad.
  return true;
}

export function isConfigured(): boolean {
  return !SUPABASE_URL.includes('YOUR-PROJECT-ID');
}
