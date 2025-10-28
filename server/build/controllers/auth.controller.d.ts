import { Request, Response } from 'express';
export declare class AuthController {
    registrar(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    verificarToken(req: Request, res: Response): Promise<void>;
    obtenerPerfil(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map