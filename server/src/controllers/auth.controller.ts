import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginCredentials, AuthResponse } from '../models/auth.model';
import { enviarEmailVerificacion } from '../config/email.config';

export class AuthController {
  
  // Registro de usuarios (pacientees)
  public registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, apellido, email, password, telefono } = req.body;

      // Validar datos requeridos
      if (!nombre || !apellido || !email || !password) {
        res.status(400).json({ 
          success: false, 
          error: 'Nombre, apellido, email y contraseña son requeridos' 
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ 
          success: false, 
          error: 'Email inválido' 
        });
        return;
      }

      // Validar longitud de contraseña
      if (password.length < 8) {
        res.status(400).json({ 
          success: false, 
          error: 'La contraseña debe tener al menos 8 caracteres' 
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

      // Generar código de verificación de 6 dígitos
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Fecha de expiración (15 minutos)
      const codigoExpira = new Date();
      codigoExpira.setMinutes(codigoExpira.getMinutes() + 15);

      // Insertar usuario (SIEMPRE como paciente, estado inactivo hasta verificar email)
      const [result] = await pool.query(
        `INSERT INTO usuarios 
        (nombre, apellido, email, password, rol, telefono, estado, codigo_verificacion, codigo_expira, email_verificado) 
        VALUES (?, ?, ?, ?, 'paciente', ?, 'inactivo', ?, ?, FALSE)`,
        [nombre, apellido, email, hashedPassword, telefono || null, codigoVerificacion, codigoExpira]
      );

      const insertResult = result as any;

      // Enviar email de verificación
      const emailEnviado = await enviarEmailVerificacion(email, nombre, codigoVerificacion);

      if (!emailEnviado) {
        console.error('Error al enviar email de verificación');
        // No bloquear el registro si falla el email
      }

      res.status(201).json({ 
        success: true, 
        message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
        data: { 
          id: insertResult.insertId,
          email: email,
          requiereVerificacion: true
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
  }

  // Verificar código de email
  public verificarEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, codigo } = req.body;

      if (!email || !codigo) {
        res.status(400).json({ 
          success: false, 
          error: 'Email y código son requeridos' 
        });
        return;
      }

      // Buscar usuario con ese email y código
      const [usuarios] = await pool.query(
        `SELECT id, nombre, apellido, email, rol, codigo_expira 
         FROM usuarios 
         WHERE email = ? AND codigo_verificacion = ? AND email_verificado = FALSE`,
        [email, codigo]
      );

      const usuariosArray = usuarios as any[];

      if (usuariosArray.length === 0) {
        res.status(400).json({ 
          success: false, 
          error: 'Código inválido o email ya verificado' 
        });
        return;
      }

      const usuario = usuariosArray[0];

      // Verificar si el código expiró
      const ahora = new Date();
      const expira = new Date(usuario.codigo_expira);

      if (ahora > expira) {
        res.status(400).json({ 
          success: false, 
          error: 'El código ha expirado. Solicita uno nuevo.' 
        });
        return;
      }

      // Activar usuario
      await pool.query(
        `UPDATE usuarios 
         SET email_verificado = TRUE, 
             estado = 'activo', 
             codigo_verificacion = NULL,
             codigo_expira = NULL
         WHERE id = ?`,
        [usuario.id]
      );

      // Generar token JWT automáticamente
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion',
        { expiresIn: '24h' }
      );

      res.json({ 
        success: true, 
        message: '¡Email verificado exitosamente! Bienvenido a DocApp.',
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en verificación:', error);
      res.status(500).json({ success: false, error: 'Error al verificar email' });
    }
  }

  // Reenviar código de verificación
  public reenviarCodigo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ 
          success: false, 
          error: 'Email es requerido' 
        });
        return;
      }

      // Buscar usuario
      const [usuarios] = await pool.query(
        'SELECT id, nombre, email, email_verificado FROM usuarios WHERE email = ?',
        [email]
      );

      const usuariosArray = usuarios as any[];

      if (usuariosArray.length === 0) {
        res.status(404).json({ 
          success: false, 
          error: 'Email no registrado' 
        });
        return;
      }

      const usuario = usuariosArray[0];

      if (usuario.email_verificado) {
        res.status(400).json({ 
          success: false, 
          error: 'Este email ya está verificado' 
        });
        return;
      }

      // Generar nuevo código
      const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
      const codigoExpira = new Date();
      codigoExpira.setMinutes(codigoExpira.getMinutes() + 15);

      // Actualizar código
      await pool.query(
        'UPDATE usuarios SET codigo_verificacion = ?, codigo_expira = ? WHERE id = ?',
        [codigoVerificacion, codigoExpira, usuario.id]
      );

      // Enviar email
      const emailEnviado = await enviarEmailVerificacion(email, usuario.nombre, codigoVerificacion);

      if (!emailEnviado) {
        res.status(500).json({ 
          success: false, 
          error: 'Error al enviar email' 
        });
        return;
      }

      res.json({ 
        success: true, 
        message: 'Código reenviado. Revisa tu email.' 
      });
    } catch (error) {
      console.error('Error al reenviar código:', error);
      res.status(500).json({ success: false, error: 'Error al reenviar código' });
    }
  }

  // Login 
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginCredentials = req.body;

      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          error: 'Email y contraseña son requeridos' 
        });
        return;
      }

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

      // Verificar si el email está verificado
      if (!usuario.email_verificado) {
        res.status(403).json({ 
          success: false, 
          error: 'Debes verificar tu email antes de iniciar sesión',
          requiereVerificacion: true,
          email: email
        });
        return;
      }

      if (usuario.estado !== 'activo') {
        res.status(403).json({ 
          success: false, 
          error: 'Usuario inactivo. Contacte al administrador' 
        });
        return;
      }

      const passwordValida = await bcrypt.compare(password, usuario.password);

      if (!passwordValida) {
        res.status(401).json({ 
          success: false, 
          error: 'Credenciales inválidas' 
        });
        return;
      }

      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion',
        { expiresIn: '24h' }
      );

      let nombreEspecialidad: string | undefined = undefined;

      if (usuario.rol === 'medico') {
        const [rows] = await pool.query(
          `SELECT e.nombre 
           FROM perfiles_medicos pm
           INNER JOIN especialidades e ON pm.especialidad_id = e.id
           WHERE pm.usuario_id = ?`,
          [usuario.id]
        );
        
        const rowsArray = rows as any[];
        if (rowsArray.length > 0) {
          nombreEspecialidad = rowsArray[0].nombre;
        }
      }

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
          especialidad: nombreEspecialidad || "" // <--- AÑADIR ESTO AQUÍ
        }
      };

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }

  // MVerifica Token
  public verificarToken = async (req: Request, res: Response): Promise<void> => {
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

      const [usuarios] = await pool.query(
        'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = ?',
        [decoded.id]
      );

      const usuariosArray = usuarios as any[];

      if (usuariosArray.length === 0) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      const usuarioEncontrado = usuariosArray[0]; // Tu usuario base

      // =========================================================
      // 🕵️ LÓGICA NUEVA: Recuperar Especialidad también al verificar token
      // =========================================================
      let nombreEspecialidad: string | undefined = undefined;

      if (usuarioEncontrado.rol === 'medico') {
        const [rows] = await pool.query(
          `SELECT e.nombre 
           FROM perfiles_medicos pm
           INNER JOIN especialidades e ON pm.especialidad_id = e.id
           WHERE pm.usuario_id = ?`,
          [usuarioEncontrado.id]
        );
        
        const rowsArray = rows as any[];
        if (rowsArray.length > 0) {
          nombreEspecialidad = rowsArray[0].nombre;
        }
      }
      // =========================================================

      res.json({ 
        success: true, 
        user: {
          ...usuarioEncontrado,
            especialidad: nombreEspecialidad // <--- AÑADIR ESTO
        }
      });
    } catch (error) {
      res.status(401).json({ success: false, error: 'Token inválido' });
    }
  }

  public obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

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