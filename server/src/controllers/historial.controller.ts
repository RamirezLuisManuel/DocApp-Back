import { Request, Response } from 'express';
import pool from '../config/database';
import { HistorialInput, RecetaMedica } from '../models/historial.model';
import { enviarHistorialMedico } from '../config/email.config'; 

// Abstract Factory
import { IFabricaKitSalida } from '../patterns/core/abstractFactory';
import { FabricaMedicinaGeneral } from '../patterns/especialidades/general/concreteFactoryGeneral';
import { FabricaNutricion } from '../patterns/especialidades/nutricion/concreteFactoryNutriologo';
import { FabricaPediatria } from '../patterns/especialidades/pediatria/concreteFactoryPediatria';
import { FabricaPsiquiatria } from '../patterns/especialidades/psiquiatria/concreteFactoryPsiquiatria';
import { FabricaDermatologia } from '../patterns/especialidades/dermatologia/concreteFactoryDermatologia';

export class HistorialController {
  
  // ====================================================================
  // CREAR HISTORIAL MÉDICO COMPLETO
  // ====================================================================
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

      // Detectar especialidad del médico
      const [rowsEspecialidad] = await connection.query(
        `SELECT e.nombre 
          FROM perfiles_medicos pm
          INNER JOIN especialidades e ON pm.especialidad_id = e.id
          WHERE pm.usuario_id = ?`,
        [userId]
      );

      const especialidadArray = rowsEspecialidad as any[];
      const nombreEspecialidad = especialidadArray[0]?.nombre || 'General';
      console.log(`📋 Especialidad detectada: ${nombreEspecialidad}`);

      // Guardar items (medicamentos o alimentos)
      if (historialData.recetas && historialData.recetas.length > 0) {
        
        // Determinar el tipo de item según la especialidad
        let tipoItem = 'medicamento'; // Default

        if (nombreEspecialidad.toLowerCase().includes('nutricion') ||
            nombreEspecialidad.toLowerCase().includes('nutrición')) {
          tipoItem = 'alimento';
          console.log('🥗 Guardando como alimentos (nutrición)');
        } else if (nombreEspecialidad.toLowerCase().includes('pediatria') ||
                   nombreEspecialidad.toLowerCase().includes('pediatría')) {
          tipoItem = 'medicamento';
          console.log('👶 Guardando como medicamentos (pediatría)');
        } else if (nombreEspecialidad.toLowerCase().includes('psiquiatria') ||
                   nombreEspecialidad.toLowerCase().includes('psiquiatría')) {
          tipoItem = 'medicamento';
          console.log('🧠 Guardando como medicamentos (psiquiatría)');
        } else if (nombreEspecialidad.toLowerCase().includes('dermatologia') ||
                   nombreEspecialidad.toLowerCase().includes('dermatología')) {
          tipoItem = 'medicamento';
          console.log('🧴 Guardando como medicamentos (dermatología)');
        } else {
          console.log('💊 Guardando como medicamentos (medicina general)');
        }

        const queryKitItem = `
          INSERT INTO kit_salida_items 
          (historial_id, tipo_item, nombre, descripcion, detalles, orden)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < historialData.recetas.length; i++) {
          const item: any = historialData.recetas[i];
          
          let detalles: any = {};
          
          if (tipoItem === 'alimento') {
            // Para NUTRICIÓN
            detalles = {
              porcion: item.dosis || '100g',
              horario: item.frecuencia || 'Almuerzo',
              calorias: item.indicaciones || '',
              preparacion: item.duracion || ''
            };
          } else {
            // Para MEDICINA GENERAL
            detalles = {
              dosis: item.dosis || '',
              frecuencia: item.frecuencia || '',
              duracion: item.duracion || '',
              via: item.via_administracion || 'Oral'
            };
          }

          await connection.query(queryKitItem, [
            historialId,
            tipoItem,
            item.medicamento_nombre || '',
            item.medicamento_generico || item.indicaciones || '',
            JSON.stringify(detalles),
            i
          ]);
        }
        
        console.log(`✅ ${historialData.recetas.length} items guardados como tipo: ${tipoItem}`);
      }

      // Actualizar estado de la cita
      await connection.query(
        'UPDATE citas SET estado = ? WHERE id = ?',
        ['completada', historialData.cita_id]
      );

      // ====================================================================
      // ABSTRACT FACTORY - Generar HTMLs
      // ====================================================================
      
      let fabrica: IFabricaKitSalida;

      if (nombreEspecialidad.toLowerCase().includes('nutricion') ||
          nombreEspecialidad.toLowerCase().includes('nutrición')) {
        fabrica = new FabricaNutricion();
        console.log(`🏭 Usando FabricaNutricion para generar HTMLs`);
      } else if (nombreEspecialidad.toLowerCase().includes('pediatria') ||
                 nombreEspecialidad.toLowerCase().includes('pediatría')) {
        fabrica = new FabricaPediatria();
        console.log(`🏭 Usando FabricaPediatria para generar HTMLs`);
      } else if (nombreEspecialidad.toLowerCase().includes('psiquiatria') ||
                 nombreEspecialidad.toLowerCase().includes('psiquiatría')) {
        fabrica = new FabricaPsiquiatria();
        console.log(`🏭 Usando FabricaPsiquiatria para generar HTMLs`);
      } else if (nombreEspecialidad.toLowerCase().includes('dermatologia') ||
                 nombreEspecialidad.toLowerCase().includes('dermatología')) {
        fabrica = new FabricaDermatologia();
        console.log(`🏭 Usando FabricaDermatologia para generar HTMLs`);
      } else {
        fabrica = new FabricaMedicinaGeneral();
        console.log(`🏭 Usando FabricaMedicinaGeneral para generar HTMLs`);
      }

      const docPrincipal = fabrica.crearFormularioPrincipal();
      const docSecundario = fabrica.crearFormularioSecundario();

      const [itemsGuardadosResult] = await connection.query(
        'SELECT * FROM kit_salida_items WHERE historial_id = ? ORDER BY orden',
        [historialId]
      );

      const itemsGuardados = itemsGuardadosResult as any[];

      const htmlPrincipal = docPrincipal.generarHtml(itemsGuardados);
      const htmlSecundario = docSecundario.generarHtml();
      const contenidoKit = htmlPrincipal + "<br/>" + htmlSecundario;

      console.log('📧 HTMLs generados con Abstract Factory');

      // Obtener datos para email
      const [datosPacienteResult] = await connection.query(
        'SELECT nombre, apellido, email FROM usuarios WHERE id = ?',
        [cita.paciente_id]
      );

      const [datosMedicoResult] = await connection.query(
        `SELECT u.nombre, u.apellido, e.nombre as especialidad
         FROM usuarios u
         INNER JOIN perfiles_medicos pm ON u.id = pm.usuario_id
         INNER JOIN especialidades e ON pm.especialidad_id = e.id
         WHERE u.id = ?`,
        [userId]
      );

      const datosPaciente = datosPacienteResult as any[];
      const datosMedico = datosMedicoResult as any[];

      await connection.commit();
      connection.release();

      // Enviar email
      if (datosPaciente.length > 0 && datosMedico.length > 0) {
        
        const paciente = datosPaciente[0];
        const medico = datosMedico[0];

        const historialParaEmail = {
          fecha_consulta: cita.fecha_cita,
          diagnostico: historialData.diagnostico,
          sintomas: historialData.sintomas || '',
          presion_arterial: historialData.presion_arterial || '',
          temperatura: historialData.temperatura || null,
          peso: historialData.peso || null,
          altura: historialData.altura || null,
          plan_tratamiento: historialData.plan_tratamiento || '',
          observaciones: historialData.observaciones || '',
          fecha_seguimiento: historialData.fecha_seguimiento || ''
        };

        enviarHistorialMedico(
          paciente.email,
          `${paciente.nombre} ${paciente.apellido}`,
          `${medico.nombre} ${medico.apellido}`,
          medico.especialidad,
          historialParaEmail,
          contenidoKit
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

  // ====================================================================
  // OBTENER HISTORIAL DE UN PACIENTE
  // ====================================================================
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

  // ====================================================================
  // OBTENER DETALLE DE UNA CONSULTA (CON ITEMS TRANSFORMADOS)
  // ====================================================================
  public async obtenerDetalleConsulta(req: Request, res: Response): Promise<void> {
    try {
      const { historial_id } = req.params;

      console.log(`🔍 Obteniendo detalle de consulta ID: ${historial_id}`);

      // Obtener historial
      const [historialesResult] = await pool.query(
        `SELECT h.*, CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
         e.nombre as especialidad
         FROM historial_medico h
         INNER JOIN usuarios m ON h.medico_id = m.id
         INNER JOIN perfiles_medicos pm ON m.id = pm.usuario_id
         INNER JOIN especialidades e ON pm.especialidad_id = e.id
         WHERE h.id = ?`,
        [historial_id]
      );

      const historialesArray = historialesResult as any[];
      
      if (historialesArray.length === 0) {
        res.status(404).json({ success: false, error: 'Historial no encontrado' });
        return;
      }

      const historial = historialesArray[0];

      // Obtener items de kit_salida_items
      const [itemsResult] = await pool.query(
        'SELECT * FROM kit_salida_items WHERE historial_id = ? ORDER BY orden',
        [historial_id]
      );

      const itemsArray = itemsResult as any[];

      console.log(`📦 Items encontrados: ${itemsArray.length}`);

      // ✅ TRANSFORMAR items al formato que espera el frontend (recetas)
      const recetas = itemsArray.map((item: any) => {
        let detalles: any = {};
        
        try {
          detalles = JSON.parse(item.detalles || '{}');
        } catch (e) {
          console.error('Error parseando detalles:', e);
          detalles = {};
        }

        return {
          id: item.id,
          tipo_item: item.tipo_item,
          medicamento_nombre: item.nombre || '',
          medicamento_generico: item.descripcion || '',
          dosis: detalles.dosis || detalles.porcion || '',
          frecuencia: detalles.frecuencia || detalles.horario || '',
          duracion: detalles.duracion || detalles.preparacion || '',
          via_administracion: detalles.via || null,
          indicaciones: detalles.calorias || null
        };
      });

      console.log(`✅ ${recetas.length} items transformados a formato recetas`);

      res.json({ 
        success: true, 
        data: {
          historial,
          recetas
        }
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ success: false, error: 'Error al obtener detalle de consulta' });
    }
  }

  // ====================================================================
  // OBTENER ITEMS DEL KIT (mantiene nombre nuevo para futuro)
  // ====================================================================
  public async obtenerKitItems(req: Request, res: Response): Promise<void> {
    try {
      const { historial_id } = req.params;

      const [itemsResult] = await pool.query(
        'SELECT * FROM kit_salida_items WHERE historial_id = ? ORDER BY orden',
        [historial_id]
      );

      const items = itemsResult as any[];

      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error al obtener items del kit' });
    }
  }

  // ====================================================================
  // OBTENER RECETAS (compatibilidad con código antiguo)
  // ====================================================================
  public async obtenerRecetas(req: Request, res: Response): Promise<void> {
    // Redirige al nuevo método
    return this.obtenerKitItems(req, res);
  }
}