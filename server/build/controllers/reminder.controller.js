"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndSendReminders = checkAndSendReminders;
const reminder_model_1 = require("../models/reminder.model");
const timeUtils_1 = require("../utils/timeUtils");
const mail_controller_1 = require("./mail.controller");
async function checkAndSendReminders() {
    console.log("⏰ Ejecutando rutina de recordatorios...");
    const recetas = await (0, reminder_model_1.getActivePrescriptions)();
    for (const r of recetas) {
        const fechaInicio = new Date(r.fecha_creacion);
        if ((0, timeUtils_1.shouldSendReminder)(r.frecuencia, fechaInicio)) {
            await (0, mail_controller_1.notifyPatient)(r);
        }
    }
    console.log("✅ Revisión completada.");
}
//# sourceMappingURL=reminder.controller.js.map