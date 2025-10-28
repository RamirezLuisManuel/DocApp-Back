"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const reminder_controller_1 = require("../controllers/reminder.controller");
// Ejecutar cada hora (puedes ajustar el patrón)
node_cron_1.default.schedule("* * * * *", async () => {
    await (0, reminder_controller_1.checkAndSendReminders)();
});
//# sourceMappingURL=cronJob.js.map