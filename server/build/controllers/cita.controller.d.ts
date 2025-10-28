import { Request, Response } from 'express';
export declare class CitaController {
    obtenerCitas(req: Request, res: Response): Promise<void>;
    obtenerCitaPorId(req: Request, res: Response): Promise<void>;
    crearCita(req: Request, res: Response): Promise<void>;
    obtenerMedicos(req: Request, res: Response): Promise<void>;
    cancelarCita(req: Request, res: Response): Promise<void>;
    reprogramarCita(req: Request, res: Response): Promise<void>;
    obtenerCitasPaciente(req: Request, res: Response): Promise<void>;
    obtenerCitasMedico(req: Request, res: Response): Promise<void>;
    confirmarCita(req: Request, res: Response): Promise<void>;
    completarCita(req: Request, res: Response): Promise<void>;
    rechazarCita(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=cita.controller.d.ts.map