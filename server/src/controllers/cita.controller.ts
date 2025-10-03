import { Request, Response } from 'express';
import pool from '../config/database';
import { CitaInput } from '../models/cita.model';

export class CitaController {
  
  // Obtener todas las citas
  public async obtenerCitas(req: Request, res: Response): Promise<void> {
    try {
      const [citas] = await pool.query('SELECT * FROM citas ORDER BY fecha_cita DESC');
      res.json({ success: true, data: citas });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al obtener citas' });
    }
  }

  // Obtener cita por ID
  public async obtenerCitaPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
      const citasArray = citas as any[];
      
      if (citasArray.length === 0) {
        res.status(404).json({ success: false, error: 'Cita no encontrada' });
        return;
      }
      res.json({ success: true, data: citasArray[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al obtener la cita' });
    }
  }

  // Crear nueva cita
  public async crearCita(req: Request, res: Response): Promise<void> {
    try {
      const citaData: CitaInput = req.body;
      
      // Validación básica
      if (!citaData.medico_id || !citaData.fecha_cita || !citaData.motivo_consulta) {
        res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
        return;
      }

      // Por ahora usamos paciente_id = 1 (luego será del usuario autenticado)
      const query = `
        INSERT INTO citas (paciente_id, medico_id, fecha_cita, motivo_consulta, tipo_consulta, notas_paciente, duracion, estado)
        VALUES (?, ?, ?, ?, ?, ?, 30, 'solicitada')
      `;
      
      const [result] = await pool.query(query, [
        1, // paciente_id temporal
        citaData.medico_id,
        citaData.fecha_cita,
        citaData.motivo_consulta,
        citaData.tipo_consulta,
        citaData.notas_paciente || null
      ]);

      const insertResult = result as any;
      res.status(201).json({ 
        success: true, 
        message: 'Cita creada exitosamente',
        data: { id: insertResult.insertId }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al crear la cita' });
    }
  }

  // Obtener médicos disponibles
  public async obtenerMedicos(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT 
          u.id, u.nombre, u.apellido, u.email,
          pm.cedula_profesional, pm.anos_experiencia, pm.biografia,
          e.id as especialidad_id, e.nombre as especialidad_nombre
        FROM usuarios u
        INNER JOIN perfiles_medicos pm ON u.id = pm.usuario_id
        INNER JOIN especialidades e ON pm.especialidad_id = e.id
        WHERE u.rol = 'medico' AND u.estado = 'activo'
      `;
      
      const [medicos] = await pool.query(query);
      res.json({ success: true, data: medicos });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Error al obtener médicos' });
    }
  }
}