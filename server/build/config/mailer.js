"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
exports.sendReminderEmail = sendReminderEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail", // o el servicio SMTP que uses
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
async function sendReminderEmail(to, subject, message) {
    try {
        await exports.transporter.sendMail({
            from: `"Sistema de Telemedicina" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html: message,
        });
        console.log(`📧 Correo enviado a ${to}`);
    }
    catch (error) {
        console.error("❌ Error enviando correo:", error);
    }
}
//# sourceMappingURL=mailer.js.map