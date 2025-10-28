"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyPatient = notifyPatient;
const mailer_js_1 = require("../config/mailer.js");
async function notifyPatient(data) {
    const { correo, paciente, medicamento_nombre, dosis, frecuencia } = data;
    const message = `
    <h2>Recordatorio de medicamento</h2>
    <p>Hola <b>${paciente}</b>,</p>
    <p>Este es un recordatorio para tomar tu medicamento:</p>
    <ul>
      <li><b>Medicamento:</b> ${medicamento_nombre}</li>
      <li><b>Dosis:</b> ${dosis}</li>
      <li><b>Frecuencia:</b> ${frecuencia}</li>
    </ul>
    <p>Por favor, sigue las indicaciones de tu médico.</p>
    <p>Atentamente,<br>Equipo de Telemedicina</p>
  `;
    await (0, mailer_js_1.sendReminderEmail)(correo, "Recordatorio de Toma de Medicamento", message);
}
//# sourceMappingURL=mail.controller.js.map