import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import citaRoutes from './routes/cita.routes';
import authRoutes from './routes/auth.routes';
import historialRoutes from './routes/historial.routes';
import './config/cronJob';

// Importamos las interfaces del patrón Proxy
import { IFdaService } from './patterns/proxy/fda.interface';
import { FdaProxy } from './patterns/proxy/fda.proxy';


class Server {
  public app: Application;
  private port: number;
  // Instanciamos el Proxy (El "intermediario" con caché)
  // Usamos la interfaz IFdaService para desacoplar el código
  private fdaService: IFdaService = new FdaProxy();

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.config();
    this.routes();
  }

  config(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  routes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/citas', citaRoutes);

    this.app.use('/api/historial', historialRoutes);

    // Ruta de medicamentos (FDA API) Refactorizada para usar proxy de cache
    this.app.get('/api/drugs/search/:name', async (req: Request, res: Response): Promise<void> => {
      try {
        const name = req.params.name;
        
        if (!name) {
          res.status(400).json({ success: false, error: 'Nombre de medicamento requerido' });
          return;
        }

        console.log(`🔎 Solicitud entrante para buscar: "${name}"`);

        // AQUI ESTÁ LA MAGIA:
        // Llamamos al servicio. No sabemos si viene de caché o de internet,
        // y al controlador no le importa. Solo recibe los datos listos.
        const medicamentos = await this.fdaService.buscarMedicamento(name);
        
        if (medicamentos && medicamentos.length > 0) {
          res.json({ success: true, data: medicamentos });
        } else {
          res.json({ success: true, data: [], message: 'No se encontraron resultados' });
        }

      } catch (error: any) {
        console.error('❌ Error en el controlador de medicamentos:', error);
        // Si el error es por falta de API Key (lanzado desde el servicio Real), lo informamos
        if (error.message.includes('API Key')) {
            res.status(500).json({ success: false, error: 'Error de configuración del servidor' });
        } else {
            res.status(500).json({ success: false, error: 'Error al buscar medicamento' });
        }
      }
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log('Server on port', this.port);
    });
  }
}

const server = new Server();
console.log('WORKS!!!!!');
server.start();