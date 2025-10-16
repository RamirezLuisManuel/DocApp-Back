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
    const userId = (req as any).userId; // ID del usuario autenticado desde el middleware
    
    // Validación básica
    if (!citaData.medico_id || !citaData.fecha_cita || !citaData.motivo_consulta) {
      res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
      return;
    }

    // Verificar que el usuario sea paciente
    const [usuarios] = await pool.query('SELECT rol FROM usuarios WHERE id = ?', [userId]);
    const usuariosArray = usuarios as any[];
    
    if (usuariosArray.length === 0 || usuariosArray[0].rol !== 'paciente') {
      res.status(403).json({ success: false, error: 'Solo los pacientes pueden crear citas' });
      return;
    }

    // Insertar cita con el ID del usuario autenticado
    const query = `
      INSERT INTO citas (paciente_id, medico_id, fecha_cita, motivo_consulta, tipo_consulta, notas_paciente, duracion, estado)
      VALUES (?, ?, ?, ?, ?, ?, 30, 'solicitada')
    `;
    
    const [result] = await pool.query(query, [
      userId, // <- AQUÍ usamos el userId del token, no hardcodeado
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

  // Cancelar cita
public async cancelarCita(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { motivo_cancelacion } = req.body;

    // Verificar que la cita existe
    const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
    const citasArray = citas as any[];
    
    if (citasArray.length === 0) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    const cita = citasArray[0];

    // Validar que la cita se puede cancelar
    if (cita.estado === 'cancelada' || cita.estado === 'completada') {
      res.status(400).json({ 
        success: false, 
        error: `No se puede cancelar una cita en estado ${cita.estado}` 
      });
      return;
    }

    // Validar que la cita es futura
    const fechaCita = new Date(cita.fecha_cita);
    const ahora = new Date();
    
    if (fechaCita < ahora) {
      res.status(400).json({ 
        success: false, 
        error: 'No se puede cancelar cita' 
      });
      return;
    }

    // Actualizar estado
    await pool.query(
      'UPDATE citas SET estado = ?, motivo_cancelacion = ? WHERE id = ?',
      ['cancelada', motivo_cancelacion || null, id]
    );

    res.json({ 
      success: true, 
      message: 'Cita cancelada exitosamente' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al cancelar la cita' });
  }
}

// Reprogramar cita
public async reprogramarCita(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { fecha_cita } = req.body;

    if (!fecha_cita) {
      res.status(400).json({ success: false, error: 'Debe proporcionar nueva fecha' });
      return;
    }

    // Verificar que la cita existe
    const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
    const citasArray = citas as any[];
    
    if (citasArray.length === 0) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    const cita = citasArray[0];

    // Validar que la cita se puede reprogramar
    if (cita.estado === 'cancelada' || cita.estado === 'completada') {
      res.status(400).json({ 
        success: false, 
        error: `No se puede reprogramar una cita en estado ${cita.estado}` 
      });
      return;
    }

    // Validar que la nueva fecha es futura
    const nuevaFecha = new Date(fecha_cita);
    const ahora = new Date();
    
    if (nuevaFecha < ahora) {
      res.status(400).json({ 
        success: false, 
        error: 'La nueva fecha debe ser futura' 
      });
      return;
    }

    // Actualizar fecha y estado
    await pool.query(
      'UPDATE citas SET fecha_cita = ?, estado = ? WHERE id = ?',
      [fecha_cita, 'solicitada', id]
    );

    res.json({ 
      success: true, 
      message: 'Cita reprogramada exitosamente',
      data: { id, fecha_cita }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al reprogramar la cita' });
  }
}

// Obtener citas de un paciente específico
public async obtenerCitasPaciente(req: Request, res: Response): Promise<void> {
  try {
    const { paciente_id } = req.params;
    
    const query = `
      SELECT 
        c.*,
        CONCAT(u.nombre, ' ', u.apellido) as medico_nombre,
        u.email as medico_email,
        u.telefono as medico_telefono,
        e.nombre as especialidad,
        pm.cedula_profesional
      FROM citas c
      INNER JOIN usuarios u ON c.medico_id = u.id
      INNER JOIN perfiles_medicos pm ON u.id = pm.usuario_id
      INNER JOIN especialidades e ON pm.especialidad_id = e.id
      WHERE c.paciente_id = ?
      ORDER BY c.fecha_cita DESC
    `;
    
    const [citas] = await pool.query(query, [paciente_id]);
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener citas del paciente' });
  }
}

// Obtener citas de un médico específico
public async obtenerCitasMedico(req: Request, res: Response): Promise<void> {
  try {
    const { medico_id } = req.params;
    
    const query = `
      SELECT 
        c.*,
        CONCAT(u.nombre, ' ', u.apellido) as paciente_nombre,
        u.email as paciente_email,
        u.telefono as paciente_telefono
      FROM citas c
      INNER JOIN usuarios u ON c.paciente_id = u.id
      WHERE c.medico_id = ?
      ORDER BY c.fecha_cita DESC
    `;
    
    const [citas] = await pool.query(query, [medico_id]);
    res.json({ success: true, data: citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al obtener citas del médico' });
  }
}
// Confirmar cita (médico acepta)
public async confirmarCita(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
    const citasArray = citas as any[];
    
    if (citasArray.length === 0) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    const cita = citasArray[0];

    if (cita.estado !== 'solicitada') {
      res.status(400).json({ 
        success: false, 
        error: `No se puede confirmar una cita en estado ${cita.estado}` 
      });
      return;
    }

    await pool.query('UPDATE citas SET estado = ? WHERE id = ?', ['confirmada', id]);

    res.json({ 
      success: true, 
      message: 'Cita confirmada exitosamente' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al confirmar la cita' });
  }
}

// Completar cita (después de la consulta)
public async completarCita(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { notas_medico } = req.body;

    const [citas] = await pool.query('SELECT * FROM citas WHERE id = ?', [id]);
    const citasArray = citas as any[];
    
    if (citasArray.length === 0) {
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    await pool.query(
      'UPDATE citas SET estado = ?, notas_medico = ? WHERE id = ?',
      ['completada', notas_medico || null, id]
    );

    res.json({ 
      success: true, 
      message: 'Cita marcada como completada' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al completar la cita' });
  }
}

// Rechazar cita
public async rechazarCita(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { motivo_cancelacion } = req.body;

    await pool.query(
      'UPDATE citas SET estado = ?, motivo_cancelacion = ? WHERE id = ?',
      ['cancelada', motivo_cancelacion || 'Rechazada por el médico', id]
    );

    res.json({ 
      success: true, 
      message: 'Cita rechazada' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error al rechazar la cita' });
  }
}
}

