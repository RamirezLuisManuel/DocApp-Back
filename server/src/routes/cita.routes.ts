import { Router } from 'express';
import { CitaController } from '../controllers/cita.controller';
import { verificarToken } from '../middlewares/auth.middleware';

class CitaRoutes {
  public router: Router;
  private citaController: CitaController;

  constructor() {
    this.router = Router();
    this.citaController = new CitaController();
    this.config();
  }

  config(): void {
    // Endpoints públicos
    this.router.get('/medicos', this.citaController.obtenerMedicos);

    //Horarios disponibles
    this.router.get('/horarios-disponibles/:medico_id/:fecha', 
    this.citaController.obtenerHorariosDisponibles
  );
    
    // Endpoints protegidos - requieren token
    this.router.get('/paciente/:paciente_id', verificarToken, this.citaController.obtenerCitasPaciente);
    this.router.get('/medico/:medico_id', verificarToken, this.citaController.obtenerCitasMedico);
    
    this.router.post('/', verificarToken, this.citaController.crearCita);
    this.router.patch('/:id/cancelar', verificarToken, this.citaController.cancelarCita);
    this.router.patch('/:id/reprogramar', verificarToken, this.citaController.reprogramarCita);
    this.router.patch('/:id/confirmar', verificarToken, this.citaController.confirmarCita);
    this.router.patch('/:id/completar', verificarToken, this.citaController.completarCita);
    this.router.patch('/:id/rechazar', verificarToken, this.citaController.rechazarCita);
    
    this.router.get('/:id', verificarToken, this.citaController.obtenerCitaPorId);
    this.router.get('/', verificarToken, this.citaController.obtenerCitas);
  }
}

export default new CitaRoutes().router;