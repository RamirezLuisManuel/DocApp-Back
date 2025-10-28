// src/utils/timeUtils.ts

/**
 * Convierte una cadena de frecuencia a horas (número).
 * Soporta formatos como:
 *  - "cada 8 horas"
 *  - "8h"
 *  - "8"
 *  - "2 veces al día" -> interpretado como cada 12 horas
 *  - "3 veces al día" -> cada 8 horas
 *
 * Si no puede parsear, devuelve un valor por defecto (defaultHours).
 */
export function parseFrequencyToHours(
  frecuencia: string | null | undefined,
  defaultHours = 8
): number {
  if (!frecuencia || typeof frecuencia !== "string") return defaultHours;

  const s = frecuencia.toLowerCase().trim();

  // --- LÓGICA REORDENADA ---

  // 1) Buscar "X veces al día" PRIMERO
  // Regex más específico: busca un número seguido de "veces al día"
  const vecesMatch = s.match(/(\d+(\.\d+)?)\s*(veces.*día|veces al día|veces\/día|por día)/);
  if (vecesMatch && vecesMatch[1]) {
    const n = Number(vecesMatch[1]);
    if (n > 0) {
      return Math.max(1, 24 / n); // 3 veces al día -> 24/3 = 8 horas
    }
  }

  // 2) Si no, buscar un número explícito (ej. "cada 8 horas", "8h", "8", "2 dias")
  const numMatch = s.match(/(\d+(\.\d+)?)/);
  if (numMatch && numMatch[1]) {
    const n = Number(numMatch[1]);
    if (!Number.isNaN(n) && n > 0) {
      // Si la cadena contiene "día" (y no "veces", que ya cubrimos)
      if (/día|dia|día?s|days?/.test(s) && !/hora|h|min/.test(s)) {
        return n * 24; // "2 dias" -> 48 horas
      }
      // Si no, asumimos que son horas (ej. "8", "8h", "cada 8 horas")
      return n;
    }
  }

  // 3) Palabras clave (sin números)
  if (s.includes("diario") || s.includes("cada día") || s.includes("cada noche")) {
    return 24;
  }
  if (s.includes("semanal") || s.includes("cada semana")) {
    return 24 * 7;
  }

  // fallback
  return defaultHours;
}

/**
 * Determina si debe enviarse el recordatorio en este momento.
 *
 * - frecuencia: string (libre) que indica la frecuencia.
 * - fechaInicio: Date | string -> fecha de inicio del tratamiento (ej. fecha_creacion de la receta).
 * - windowMinutes: ventana de tolerancia en minutos (por defecto 60).
 *
 * Lógica:
 *  - Calcula cuántas horas han pasado desde fechaInicio.
 *  - Obtiene la frecuencia en horas (interval).
 *  - Si el número de horas transcurridas dividido entre interval tiene residuo menor que (windowMinutes / 60),
 *    se considera que estamos dentro de la ventana para notificar.
 */
export function shouldSendReminder(
  frecuencia: string | null | undefined,
  fechaInicio: Date | string,
  windowMinutes = 60
): boolean {
  const intervalHours = parseFrequencyToHours(frecuencia, 8);

  const start = typeof fechaInicio === "string" ? new Date(fechaInicio) : fechaInicio;
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    return false; // fecha inválida
  }

  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  
  if (diffMs < 0) return false; // El inicio es en el futuro

  const diffHours = diffMs / (1000 * 60 * 60); // horas transcurridas totales
  const windowHours = windowMinutes / 60; // ventana en horas

  // Horas transcurridas desde el último "punto de ciclo"
  const remainderHours = diffHours % intervalHours; 

  // Comprobamos si estamos en la ventana de tolerancia
  
  // 1. ¿Estamos justos *después* de la hora de la toma?
  // Ej: Intervalo=8. diffHours=8.1. remainderHours=0.1. windowHours=1. (0.1 <= 1) -> TRUE
  const isNearStartOfWindow = remainderHours <= windowHours;

  // 2. ¿Estamos justos *antes* de la hora de la toma?
  // Ej: Intervalo=8. diffHours=7.9. remainderHours=7.9. windowHours=1. (7.9 >= 8 - 1) -> TRUE
  const isNearEndOfWindow = remainderHours >= (intervalHours - windowHours);

  return isNearStartOfWindow || isNearEndOfWindow;
}

/**
 * Calcula la próxima fecha de toma a partir de fechaInicio y frecuencia.
 * Devuelve un objeto Date.
 */
export function getNextReminderDate(frecuencia: string | null | undefined, fechaInicio: Date | string): Date | null {
  const intervalHours = parseFrequencyToHours(frecuencia, 8);
  const start = typeof fechaInicio === "string" ? new Date(fechaInicio) : fechaInicio;
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (diffHours < 0) return start; // la primera toma aún no llegó

  const intervalsPassed = Math.floor(diffHours / intervalHours);
  const next = new Date(start.getTime() + (intervalsPassed + 1) * intervalHours * 60 * 60 * 1000);
  return next;
}
