import { Request, Response } from 'express';
import pool from '../config/database';
import { HistorialInput, RecetaMedica } from '../models/historial.model';
import { enviarHistorialMedico } from '../config/email.config'; 

// Abstact Factory
import { IFabricaKitSalida } from '../patterns/factory/abstractFactory';
import { FabricaMedicinaGeneral } from '../patterns/factory/concreteFactoryGeneral';
import { FabricaNutricion } from '../patterns/factory/concreteFactoryNutriologo';

export class HistorialController {
  
  // Crear historial médico completo (con recetas)
 public async crearHistorial(req: Request, res: Response): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const historialData: HistorialInput = req.body;
    const userId = (req as any).userId;
    
    // Validar que el usuario sea médico
    const [usuarios] = await connection.query(
      'SELECT rol FROM usuarios WHERE id = ?', 
      [userId]
    );
    const usuariosArray = usuarios as any[];
    
    if (usuariosArray.length === 0 || usuariosArray[0].rol !== 'medico') {
      await connection.rollback();
      connection.release();
      res.status(403).json({ success: false, error: 'Solo médicos pueden crear historiales' });
      return;
    }

    // Obtener datos de la cita
    const [citas] = await connection.query(
      'SELECT paciente_id, medico_id, fecha_cita FROM citas WHERE id = ?',
      [historialData.cita_id]
    );
    const citasArray = citas as any[];
    
    if (citasArray.length === 0) {
      await connection.rollback();
      connection.release();
      res.status(404).json({ success: false, error: 'Cita no encontrada' });
      return;
    }

    const cita = citasArray[0];

    // Validar que el médico es el dueño de la cita
    if (cita.medico_id !== userId) {
      await connection.rollback();
      connection.release();
      res.status(403).json({ success: false, error: 'No autorizado para esta cita' });
      return;
    }

    // Insertar historial médico
    const queryHistorial = `
      INSERT INTO historial_medico 
      (cita_id, paciente_id, medico_id, fecha_consulta, diagnostico, sintomas, 
       exploracion_fisica, presion_arterial, temperatura, peso, altura, 
       observaciones, plan_tratamiento, fecha_seguimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultHistorial] = await connection.query(queryHistorial, [
      historialData.cita_id,
      cita.paciente_id,
      userId,
      cita.fecha_cita,
      historialData.diagnostico,
      historialData.sintomas || null,
      historialData.exploracion_fisica || null,
      historialData.presion_arterial || null,
      historialData.temperatura || null,
      historialData.peso || null,
      historialData.altura || null,
      historialData.observaciones || null,
      historialData.plan_tratamiento || null,
      historialData.fecha_seguimiento || null
    ]);

    const historialId = (resultHistorial as any).insertId;

    // Insertar recetas si existen
    if (historialData.recetas && historialData.recetas.length > 0) {
      const queryReceta = `
        INSERT INTO recetas_medicas 
        (historial_id, medicamento_nombre, medicamento_generico, dosis, 
         frecuencia, duracion, via_administracion, indicaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const receta of historialData.recetas) {
        await connection.query(queryReceta, [
          historialId,
          receta.medicamento_nombre,
          receta.medicamento_generico || null,
          receta.dosis,
          receta.frecuencia,
          receta.duracion,
          receta.via_administracion || null,
          receta.indicaciones || null
        ]);
      }
    }

    // Actualizar estado de la cita a completada
    await connection.query(
      'UPDATE citas SET estado = ? WHERE id = ?',
      ['completada', historialData.cita_id]
    );


    // 
    // ========================================================================================================
    // Abstract Factory
    // =======================================================================================================
    
    // DETECCIÓN AUTOMÁTICA DE ESPECIALIDAD (Tu Join Triple)
    // Consultamos la especialidad del médico
    const [rowsEspecialidad] = await connection.query(
      `SELECT e.nombre 
        FROM perfiles_medicos pm
        INNER JOIN especialidades e ON pm.especialidad_id = e.id
        WHERE pm.usuario_id = ?`,
      [userId]
    );

    // Obtenemos el string, ej: "Nutrición", "Cardiología", "Medicina General"
    const nombreEspecialidad = (rowsEspecialidad as any[])[0]?.nombre || 'General';

    // Aplicacion Abstract Factory
    let fabrica: IFabricaKitSalida;

    // Lógica de decisión basada en lo que recuperamos de la BD
    // Puedes ajustar los strings según como los tengas en tu tabla 'especialidades'
    if (nombreEspecialidad.toLowerCase().includes('Nutrici?n') || 
        nombreEspecialidad.toLowerCase().includes('nutricion')) {
        
        fabrica = new FabricaNutricion();
        console.log(`🏭 Medico es Nutriólogo. Usando FabricaNutricion.`);

      } else {
          // Default para cualquier otra especialidad
          fabrica = new FabricaMedicinaGeneral();
          console.log(`🏭 Medico es ${nombreEspecialidad}. Usando FabricaMedicinaGeneral.`);
      }

      // Generamos los documentos del Kit
      const docPrincipal = fabrica.crearFormularioPrincipal();
      const docSecundario = fabrica.crearFormularioSecundario();

      // Generamos el HTML usando los datos que acabamos de guardar
      const htmlPrincipal = docPrincipal.generarHtml(historialData.recetas);
      const htmlSecundario = docSecundario.generarHtml();

      // Preparamos el contenido completo para el email
      const contenidoKit = htmlPrincipal + "<br/>" + htmlSecundario;

      // ==============================================================================================
      // Fin Abstract Factory
      // ==============================================================================================

    // ✅ NUEVO: Obtener datos del paciente y médico para enviar email
    const [datosPaciente] = await connection.query(
      'SELECT nombre, apellido, email FROM usuarios WHERE id = ?',
      [cita.paciente_id]
    );

    const [datosMedico] = await connection.query(
      `SELECT u.nombre, u.apellido, e.nombre as especialidad
       FROM usuarios u
       INNER JOIN perfiles_medicos pm ON u.id = pm.usuario_id
       INNER JOIN especialidades e ON pm.especialidad_id = e.id
       WHERE u.id = ?`,
      [userId]
    );

    await connection.commit();
    connection.release();

    // ✅ NUEVO: Enviar email con el historial (asíncrono, no bloquea la respuesta)
    if (datosPaciente && (datosPaciente as any[]).length > 0 &&
        datosMedico && (datosMedico as any[]).length > 0) {
      
      const paciente = (datosPaciente as any[])[0];
      const medico = (datosMedico as any[])[0];

      // Obtener recetas recién insertadas
      const [recetasInsertadas] = await pool.query(
        'SELECT * FROM recetas_medicas WHERE historial_id = ?',
        [historialId]
      );

      // Preparar datos del historial para el email
      const historialParaEmail = {
        fecha_consulta: cita.fecha_cita,
        diagnostico: historialData.diagnostico,
        sintomas: historialData.sintomas,
        presion_arterial: historialData.presion_arterial,
        temperatura: historialData.temperatura,
        peso: historialData.peso,
        altura: historialData.altura,
        plan_tratamiento: historialData.plan_tratamiento,
        observaciones: historialData.observaciones,
        fecha_seguimiento: historialData.fecha_seguimiento
      };

      // Enviar email (sin await para no bloquear)
      enviarHistorialMedico(
        paciente.email,
        `${paciente.nombre} ${paciente.apellido}`,
        `${medico.nombre} ${medico.apellido}`,
        medico.especialidad,
        historialParaEmail,
        recetasInsertadas as any[]
      ).then(enviado => {
        if (enviado) {
          console.log(`✅ Email enviado exitosamente a ${paciente.email}`);
        } else {
          console.log(`⚠️ No se pudo enviar email a ${paciente.email}`);
        }
      }).catch(err => {
        console.error('❌ Error al enviar email:', err);
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Historial médico creado exitosamente. Se ha enviado un resumen por correo al paciente.',
      data: { historial_id: historialId }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error al crear historial médico' });
  }
}

  // Obtener historial completo de un paciente
  public async obtenerHistorialPaciente(req: Request, res: Response): Promise<void> {
    try {
      const { paciente_id } = req.params;

      const query = `
        SELECT 
          h.*,
          CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
          e.nombre as especialidad
        FROM historial_medico h
        INNER JOIN usuarios m ON h.medico_id = m.id
        INNER JOIN perfiles_medicos pm ON m.id = pm.usuario_id
        INNER JOIN especialidades e ON pm.especialidad_id = e.id
        WHERE h.paciente_id = ?
        ORDER BY h.fecha_consulta DESC
      `;

      const [historiales] = await pool.query(query, [paciente_id]);
      res.json({ success: true, data: historiales });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error al obtener historial' });
    }
  }

  // Obtener detalle de una consulta específica (con recetas)
  public async obtenerDetalleConsulta(req: Request, res: Response): Promise<void> {
    try {
      const { historial_id } = req.params;

      // Obtener historial
      const [historiales] = await pool.query(
        `SELECT h.*, CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
         e.nombre as especialidad
         FROM historial_medico h
         INNER JOIN usuarios m ON h.medico_id = m.id
         INNER JOIN perfiles_medicos pm ON m.id = pm.usuario_id
         INNER JOIN especialidades e ON pm.especialidad_id = e.id
         WHERE h.id = ?`,
        [historial_id]
      );

      const historialesArray = historiales as any[];
      
      if (historialesArray.length === 0) {
        res.status(404).json({ success: false, error: 'Historial no encontrado' });
        return;
      }

      const historial = historialesArray[0];

      // Obtener recetas
      const [recetas] = await pool.query(
        'SELECT * FROM recetas_medicas WHERE historial_id = ?',
        [historial_id]
      );

      res.json({ 
        success: true, 
        data: {
          historial,
          recetas
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error al obtener detalle de consulta' });
    }
  }

  // Obtener recetas de un historial
  public async obtenerRecetas(req: Request, res: Response): Promise<void> {
    try {
      const { historial_id } = req.params;

      const [recetas] = await pool.query(
        'SELECT * FROM recetas_medicas WHERE historial_id = ? ORDER BY fecha_creacion',
        [historial_id]
      );

      res.json({ success: true, data: recetas });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error al obtener recetas' });
    }
  }
}