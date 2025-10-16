import { Router } from 'express';
import { HistorialController } from '../controllers/historial.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();
const historialController = new HistorialController();

// Crear historial médico completo
router.post('/', verificarToken, historialController.crearHistorial);

// Obtener historial de un paciente
router.get('/paciente/:paciente_id', verificarToken, historialController.obtenerHistorialPaciente); 

// Obtener detalle de una consulta específica
router.get('/:historial_id', verificarToken, historialController.obtenerDetalleConsulta); 

// Obtener recetas de un historial
router.get('/:historial_id/recetas', verificarToken, historialController.obtenerRecetas);

export default router;