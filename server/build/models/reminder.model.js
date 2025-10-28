"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePrescriptions = getActivePrescriptions;
const database_1 = __importDefault(require("../config/database"));
async function getActivePrescriptions() {
    const [rows] = await database_1.default.query(`
    SELECT 
      r.id AS receta_id,
      u.email AS correo,
      u.nombre AS paciente,
      r.medicamento_nombre,
      r.dosis,
      r.frecuencia,
      r.duracion,
      r.fecha_creacion
    FROM recetas_medicas r
    INNER JOIN historial_medico h ON r.historial_id = h.id
    INNER JOIN usuarios u ON h.paciente_id = u.id
    WHERE u.estado = 'activo'
  `);
    return rows;
}
//# sourceMappingURL=reminder.model.js.map