"use strict";
// src/utils/timeUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrequencyToHours = parseFrequencyToHours;
exports.shouldSendReminder = shouldSendReminder;
exports.getNextReminderDate = getNextReminderDate;
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
function parseFrequencyToHours(frecuencia, defaultHours = 8) {
    if (!frecuencia || typeof frecuencia !== "string")
        return defaultHours;
    const s = frecuencia.toLowerCase().trim();
    // 1) Buscar un número explícito (ej. "cada 8 horas", "8h", "8")
    const numMatch = s.match(/(\d+(\.\d+)?)/);
    if (numMatch && numMatch[1]) {
        const n = Number(numMatch[1]);
        if (!Number.isNaN(n) && n > 0) {
            // Si la cadena contiene "día" o "día(s)" o "día", interpretamos como días -> convertir a horas
            if (/día|dia|día?s|days?/.test(s) && !/hora|h|min/.test(s)) {
                return n * 24;
            }
            // Si la cadena contiene "veces" o "por día", interpretamos como "n veces al día"
            if (/veces.*día|veces al día|veces\/día|por día/.test(s)) {
                // n veces al día -> interval = 24 / n horas
                if (n > 0)
                    return Math.max(1, 24 / n);
            }
            // Si la cadena tiene "hora" o "h" o "hr" o no especifica unidad, asumimos horas
            return n;
        }
    }
    // 2) Formato "X veces al día" sin número detectado por regex anterior (por ejemplo "dos veces al dia")
    const vecesMatch = s.match(/(\d+)\s*veces\s*(al\s*d[ií]a|\/día|por día)/);
    if (vecesMatch && vecesMatch[1]) {
        const n = Number(vecesMatch[1]);
        if (n > 0)
            return Math.max(1, 24 / n);
    }
    // 3) Palabras comunes: "diario" -> 24h, "cada noche" -> 24h, "semanal" -> 24*7
    if (s.includes("diario") || s.includes("día") || s.includes("dia") || s.includes("cada noche")) {
        return 24;
    }
    if (s.includes("semanal") || s.includes("semana")) {
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
function shouldSendReminder(frecuencia, fechaInicio, windowMinutes = 60) {
    const intervalHours = parseFrequencyToHours(frecuencia, 8);
    const start = typeof fechaInicio === "string" ? new Date(fechaInicio) : fechaInicio;
    if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
        // si fecha inválida -> no enviar
        return false;
    }
    const now = new Date();
    const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60); // horas transcurridas
    if (diffHours < 0)
        return false; // inicio en el futuro
    // número de intervalos completos transcurridos
    const intervals = Math.floor(diffHours / intervalHours);
    // tiempo exacto del último punto de toma (en ms)
    const lastReminderTime = new Date(start.getTime() + intervals * intervalHours * 60 * 60 * 1000);
    const diffMinutesFromLast = Math.abs((now.getTime() - lastReminderTime.getTime()) / (1000 * 60)); // minutos desde el último punto
    return diffMinutesFromLast <= windowMinutes;
}
/**
 * Calcula la próxima fecha de toma a partir de fechaInicio y frecuencia.
 * Devuelve un objeto Date.
 */
function getNextReminderDate(frecuencia, fechaInicio) {
    const intervalHours = parseFrequencyToHours(frecuencia, 8);
    const start = typeof fechaInicio === "string" ? new Date(fechaInicio) : fechaInicio;
    if (!(start instanceof Date) || Number.isNaN(start.getTime()))
        return null;
    const now = new Date();
    const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0)
        return start; // la primera toma aún no llegó
    const intervalsPassed = Math.floor(diffHours / intervalHours);
    const next = new Date(start.getTime() + (intervalsPassed + 1) * intervalHours * 60 * 60 * 1000);
    return next;
}
//# sourceMappingURL=timeUtils.js.map