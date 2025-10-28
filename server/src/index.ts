import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import citaRoutes from './routes/cita.routes';
import authRoutes from './routes/auth.routes';
import historialRoutes from './routes/historial.routes';
import './config/cronJob';



class Server {
  public app: Application;
  private port: number;

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
    
    // Ruta de medicamentos (FDA API)
    this.app.get('/api/drugs/search/:name', async (req: Request, res: Response): Promise<void> => {
  try {
    const name = req.params.name;
    
    if (!name) {
      res.status(400).json({ success: false, error: 'Nombre de medicamento requerido' });
      return;
    }

    const drugName = encodeURIComponent(name);
    const apiKey = process.env.FDA_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ success: false, error: 'API Key no configurada' });
      return;
    }

    const url = `https://api.fda.gov/drug/label.json?api_key=${apiKey}&search=openfda.brand_name:"${drugName}"&limit=10`;
    
    console.log('Buscando medicamento:', drugName);
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const medicamentos = data.results.map((result: any) => ({
        marca: result.openfda?.brand_name?.[0] || 'Sin marca',
        generico: result.openfda?.generic_name?.[0] || 'N/A',
        fabricante: result.openfda?.manufacturer_name?.[0] || 'N/A',
        indicaciones: result.indications_and_usage?.[0] || 'N/A',
        dosificacion: result.dosage_and_administration?.[0] || 'N/A',
        advertencias: result.warnings?.[0] || 'N/A',
        efectos_adversos: result.adverse_reactions?.[0] || 'N/A'
      }));
      
      res.json({ success: true, data: medicamentos });
    } else {
      res.json({ success: true, data: [], message: 'No se encontraron resultados' });
    }
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error al buscar medicamento' });
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