"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
class AuthController {
    // Registrar nuevo usuario
    async registrar(req, res) {
        try {
            const { nombre, apellido, email, password, rol, telefono } = req.body;
            // Validar datos requeridos
            if (!nombre || !apellido || !email || !password || !rol) {
                res.status(400).json({
                    success: false,
                    error: 'Faltan campos requeridos'
                });
                return;
            }
            // Verificar si el email ya existe
            const [usuarios] = await database_1.default.query('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (usuarios.length > 0) {
                res.status(400).json({
                    success: false,
                    error: 'El email ya está registrado'
                });
                return;
            }
            // Encriptar contraseña
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Insertar usuario
            const [result] = await database_1.default.query('INSERT INTO usuarios (nombre, apellido, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?, ?)', [nombre, apellido, email, hashedPassword, rol, telefono || null]);
            const insertResult = result;
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: { id: insertResult.insertId }
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error al registrar usuario' });
        }
    }
    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validar datos
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Email y contraseña son requeridos'
                });
                return;
            }
            // Buscar usuario
            const [usuarios] = await database_1.default.query('SELECT * FROM usuarios WHERE email = ?', [email]);
            const usuariosArray = usuarios;
            if (usuariosArray.length === 0) {
                res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
                return;
            }
            const usuario = usuariosArray[0];
            // Verificar si está activo
            if (usuario.estado !== 'activo') {
                res.status(403).json({
                    success: false,
                    error: 'Usuario inactivo. Contacte al administrador'
                });
                return;
            }
            // Verificar contraseña
            const passwordValida = await bcryptjs_1.default.compare(password, usuario.password);
            if (!passwordValida) {
                res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
                return;
            }
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            }, process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion', { expiresIn: '24h' });
            // Respuesta exitosa
            const response = {
                success: true,
                token,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    rol: usuario.rol
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
    // Verificar token
    async verificarToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ success: false, error: 'Token no proporcionado' });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion');
            // Obtener datos actualizados del usuario
            const [usuarios] = await database_1.default.query('SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?', [decoded.id]);
            const usuariosArray = usuarios;
            if (usuariosArray.length === 0) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            res.json({
                success: true,
                user: usuariosArray[0]
            });
        }
        catch (error) {
            res.status(401).json({ success: false, error: 'Token inválido' });
        }
    }
    // Obtener perfil del usuario autenticado
    async obtenerPerfil(req, res) {
        try {
            const userId = req.userId; // Viene del middleware
            const [usuarios] = await database_1.default.query('SELECT id, nombre, apellido, email, rol, telefono, estado FROM usuarios WHERE id = ?', [userId]);
            const usuariosArray = usuarios;
            if (usuariosArray.length === 0) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            res.json({
                success: true,
                data: usuariosArray[0]
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Error al obtener perfil' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map