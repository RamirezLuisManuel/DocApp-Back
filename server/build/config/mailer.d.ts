import nodemailer from "nodemailer";
export declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare function sendReminderEmail(to: string, subject: string, message: string): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map