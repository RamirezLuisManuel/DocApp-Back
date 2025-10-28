"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cita_controller_1 = require("../controllers/cita.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
class CitaRoutes {
    router;
    citaController;
    constructor() {
        this.router = (0, express_1.Router)();
        this.citaController = new cita_controller_1.CitaController();
        this.config();
    }
    config() {
        // Endpoints públicos
        this.router.get('/medicos', this.citaController.obtenerMedicos);
        // Endpoints protegidos - requieren token
        this.router.get('/paciente/:paciente_id', auth_middleware_1.verificarToken, this.citaController.obtenerCitasPaciente);
        this.router.get('/medico/:medico_id', auth_middleware_1.verificarToken, this.citaController.obtenerCitasMedico);
        this.router.post('/', auth_middleware_1.verificarToken, this.citaController.crearCita);
        this.router.patch('/:id/cancelar', auth_middleware_1.verificarToken, this.citaController.cancelarCita);
        this.router.patch('/:id/reprogramar', auth_middleware_1.verificarToken, this.citaController.reprogramarCita);
        this.router.patch('/:id/confirmar', auth_middleware_1.verificarToken, this.citaController.confirmarCita);
        this.router.patch('/:id/completar', auth_middleware_1.verificarToken, this.citaController.completarCita);
        this.router.patch('/:id/rechazar', auth_middleware_1.verificarToken, this.citaController.rechazarCita);
        this.router.get('/:id', auth_middleware_1.verificarToken, this.citaController.obtenerCitaPorId);
        this.router.get('/', auth_middleware_1.verificarToken, this.citaController.obtenerCitas);
    }
}
exports.default = new CitaRoutes().router;
//# sourceMappingURL=cita.routes.js.map