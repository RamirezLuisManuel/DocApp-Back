import { Router } from 'express';
import { CitaController } from '../controllers/cita.controller';

class CitaRoutes {
  public router: Router;
  private citaController: CitaController;

  constructor() {
    this.router = Router();
    this.citaController = new CitaController();
    this.config();
  }

  config(): void {
    this.router.get('/medicos', this.citaController.obtenerMedicos);
    this.router.get('/', this.citaController.obtenerCitas);
    this.router.get('/:id', this.citaController.obtenerCitaPorId);
    this.router.post('/', this.citaController.crearCita);
  }
}

export default new CitaRoutes().router;