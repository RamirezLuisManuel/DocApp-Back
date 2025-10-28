"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
class AuthRoutes {
    router;
    authController;
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.config();
    }
    config() {
        // Rutas públicas
        this.router.post('/register', this.authController.registrar);
        this.router.post('/login', this.authController.login);
        this.router.post('/verify-token', this.authController.verificarToken);
        // Rutas protegidas
        this.router.get('/profile', auth_middleware_1.verificarToken, this.authController.obtenerPerfil);
    }
}
exports.default = new AuthRoutes().router;
//# sourceMappingURL=auth.routes.js.map