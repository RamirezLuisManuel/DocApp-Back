import { sendReminderEmail } from "../config/mailer"; // (Ruta sin .js)

export async function notifyPatient(data: any) {
  const { correo, paciente, medicamento_nombre, dosis, frecuencia } = data;

  // CSS en línea para máxima compatibilidad
  const brandColor = "#0d6efd"; // Un azul similar al de tu app
  const lightGray = "#f4f7f6";
  const darkText = "#333333";
  const lightText = "#777777";

  const message = `
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
    
    <tr>
      <td style="background-color: ${brandColor}; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">DocApp</h1>
        <h2 style="margin: 0; font-size: 20px; font-weight: 300;">Recordatorio de Medicamento</h2>
      </td>
    </tr>

    <tr>
      <td style="padding: 30px 25px; background-color: #ffffff; color: ${darkText};">
        <p style="font-size: 18px; margin-bottom: 20px;">
          ¡Hola <b>${paciente}</b>!
        </p>
        <p style="font-size: 16px; margin-bottom: 25px;">
          Este es un recordatorio automático para la toma de tu medicamento:
        </p>

        <div style="border: 2px dashed ${brandColor}; background-color: ${lightGray}; padding: 20px 25px; border-radius: 8px;">
          <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 16px;">
            <li style="margin-bottom: 12px;">
              <strong style="color: ${darkText};">Medicamento:</strong> ${medicamento_nombre}
            </li>
            <li style="margin-bottom: 12px;">
              <strong style="color: ${darkText};">Dosis:</strong> ${dosis}
            </li>
            <li>
              <strong style="color: ${darkText};">Frecuencia:</strong> ${frecuencia}
            </li>
          </ul>
        </div>

        <p style="font-size: 16px; margin-top: 25px;">
          Por favor, sigue las indicaciones de tu médico y no dudes en contactarlo si tienes preguntas.
        </p>
        <p style="font-size: 16px; margin-top: 30px;">
          Saludos,<br>
          <b>El equipo de DocApp</b>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 25px; background-color: ${lightGray}; text-align: center; color: ${lightText};">
        <p style="margin: 0; font-size: 12px;">
          Este es un email automático, por favor no responder.
        </p>
        <p style="margin: 5px 0 0 0; font-size: 12px;">
          © ${new Date().getFullYear()} DocApp - Sistema de Gestión Médica
        </p>
      </td>
    </tr>

  </table>
</body>
  `;

  await sendReminderEmail(
    correo,
    "Recordatorio de Toma de Medicamento",
    message
  );
}