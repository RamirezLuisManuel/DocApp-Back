import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail", // o el servicio SMTP que uses
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReminderEmail(to: string, subject: string, message: string) {
  try {
    await transporter.sendMail({
      from: `"Sistema de Telemedicina" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });
    console.log(`📧 Correo enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
}
