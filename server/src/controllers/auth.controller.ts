import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginCredentials, AuthResponse } from '../models/auth.model';

export class AuthController {
  
  // Registrar nuevo usuario
  public async registrar(req: Request, res: Response): Promise<void> {
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
      const [usuarios] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if ((usuarios as any[]).length > 0) {
        res.status(400).json({ 
          success: false, 
          error: 'El email ya está registrado' 
        });
        return;
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario
      const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, apellido, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, apellido, email, hashedPassword, rol, telefono || null]
      );

      const insertResult = result as any;

      res.status(201).json({ 
        success: true, 
        message: 'Usuario registrado exitosamente',
        data: { id: insertResult.insertId }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
  }

  // Login
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginCredentials = req.body;

      // Validar datos
      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        });
        return;
      }

      // Buscar usuario
      const [usuarios] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );

      const usuariosArray = usuarios as any[];

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
      const passwordValida = await bcrypt.compare(password, usuario.password);

      if (!passwordValida) {
        res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
        return;
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion',
        { expiresIn: '24h' }
      );

      // Respuesta exitosa
      const response: AuthResponse = {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }

  // Verificar token
  public async verificarToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ success: false, error: 'Token no proporcionado' });
        return;
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion'
      ) as any;

      // Obtener datos actualizados del usuario
      const [usuarios] = await pool.query(
        'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?',
        [decoded.id]
      );

      const usuariosArray = usuarios as any[];

      if (usuariosArray.length === 0) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({ 
        success: true, 
        user: usuariosArray[0] 
      });
    } catch (error) {
      res.status(401).json({ success: false, error: 'Token inválido' });
    }
  }

  // Obtener perfil del usuario autenticado
  public async obtenerPerfil(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId; // Viene del middleware

      const [usuarios] = await pool.query(
        'SELECT id, nombre, apellido, email, rol, telefono, estado FROM usuarios WHERE id = ?',
        [userId]
      );

      const usuariosArray = usuarios as any[];

      if (usuariosArray.length === 0) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({ 
        success: true, 
        data: usuariosArray[0] 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al obtener perfil' });
    }
  }
}