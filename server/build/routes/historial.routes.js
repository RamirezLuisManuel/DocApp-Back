"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historial_controller_1 = require("../controllers/historial.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const historialController = new historial_controller_1.HistorialController();
// Crear historial médico completo
router.post('/', auth_middleware_1.verificarToken, historialController.crearHistorial);
// Obtener historial de un paciente
router.get('/paciente/:paciente_id', auth_middleware_1.verificarToken, historialController.obtenerHistorialPaciente);
// Obtener detalle de una consulta específica
router.get('/:historial_id', auth_middleware_1.verificarToken, historialController.obtenerDetalleConsulta);
// Obtener recetas de un historial
router.get('/:historial_id/recetas', auth_middleware_1.verificarToken, historialController.obtenerRecetas);
exports.default = router;
//# sourceMappingURL=historial.routes.js.map