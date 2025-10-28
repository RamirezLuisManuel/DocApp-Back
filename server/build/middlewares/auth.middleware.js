"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarRol = exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, error: 'Token no proporcionado' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion');
        // Agregar información del usuario a la request
        req.userId = decoded.id;
        req.userRole = decoded.rol;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, error: 'Token inválido o expirado' });
    }
};
exports.verificarToken = verificarToken;
// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        const userRole = req.userRole;
        if (!rolesPermitidos.includes(userRole)) {
            res.status(403).json({
                success: false,
                error: 'No tienes permisos para esta acción'
            });
            return;
        }
        next();
    };
};
exports.verificarRol = verificarRol;
//# sourceMappingURL=auth.middleware.js.map