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
export declare function parseFrequencyToHours(frecuencia: string | null | undefined, defaultHours?: number): number;
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
export declare function shouldSendReminder(frecuencia: string | null | undefined, fechaInicio: Date | string, windowMinutes?: number): boolean;
/**
 * Calcula la próxima fecha de toma a partir de fechaInicio y frecuencia.
 * Devuelve un objeto Date.
 */
export declare function getNextReminderDate(frecuencia: string | null | undefined, fechaInicio: Date | string): Date | null;
//# sourceMappingURL=timeUtils.d.ts.map