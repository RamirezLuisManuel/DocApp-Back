import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.config();
  }

  config(): void {
    // Rutas públicas
    this.router.post('/register', this.authController.registrar);
    this.router.post('/login', this.authController.login);
    this.router.post('/verify-token', this.authController.verificarToken);
    
    // Rutas protegidas
    this.router.get('/profile', verificarToken, this.authController.obtenerPerfil);
  }
}

export default new AuthRoutes().router;