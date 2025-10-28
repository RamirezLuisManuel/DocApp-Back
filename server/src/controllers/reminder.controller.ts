// src/controllers/reminder.controller.ts
import { getActivePrescriptions } from "../models/reminder.model";
import { shouldSendReminder } from "../utils/timeUtils";
import { notifyPatient } from "./mail.controller";

// --- LÓGICA DE VENTANA REQUERIDA ---
// Sincroniza esto con tu cronJob.ts
// Si tu cron se ejecuta cada 10 minutos ("*/10 * * * *")...
const CRON_INTERVAL_MINUTES = 10;
// ... tu ventana debe ser la mitad de eso.
const REMINDER_WINDOW_MINUTES = CRON_INTERVAL_MINUTES / 2; // 5 minutos
// ------------------------------------

export async function checkAndSendReminders() {
  console.log(`⏰ Ejecutando rutina. Ventana objetivo: ${REMINDER_WINDOW_MINUTES} min.`);
  
  let recetas: any[]; // O mejor: RecetaPacket[] si usaste el tipado
  try {
    recetas = await getActivePrescriptions() as any[]; // Usamos 'as any[]' por si acaso
    if (!recetas || recetas.length === 0) {
      console.log("✅ No hay recetas activas que cumplan la consulta.");
      return;
    }
  } catch (error) {
    console.error("❌ Error obteniendo recetas:", error);
    return;
  }

  console.log(`ℹ️  ${recetas.length} recetas activas encontradas. Revisando horas...`);

  let notificacionesEnviadas = 0;
  const ahora = new Date(); // Usamos la misma 'ahora' para todas las revisiones

  for (const r of recetas) {
    const fechaInicio = new Date(r.fecha_creacion);

    // Pasamos la ventana explícitamente
    if (shouldSendReminder(r.frecuencia, fechaInicio, REMINDER_WINDOW_MINUTES)) {
      
      console.log(`\n📧 DISPARANDO RECORDATORIO`);
      console.log(`  -> Receta ID: ${r.receta_id}, Paciente: ${r.paciente}`);
      console.log(`  -> Frecuencia: ${r.frecuencia}, Inicio: ${fechaInicio.toISOString()}`);
      
      try {
        await notifyPatient(r);
        notificacionesEnviadas++;
      } catch (error) {
         console.error(`❌ Error al notificar receta ${r.receta_id}:`, error);
      }
    }
  }

  console.log(`\n✅ Revisión completada. ${notificacionesEnviadas} notificaciones enviadas.`);
}