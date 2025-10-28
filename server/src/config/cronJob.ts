import cron from "node-cron";
import { checkAndSendReminders } from "../controllers/reminder.controller";

console.log("✅ CRON: Archivo de Cron Job cargado. Programando tarea...");

// Ejecutar cada hora (puedes ajustar el patrón)
cron.schedule("*/10 * * * *", async () => {
  console.log("CRON: Iniciando revisión de recordatorios...");
  await checkAndSendReminders();

});
