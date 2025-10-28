import { Request, Response, NextFunction } from 'express';
export declare const verificarToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const verificarRol: (...rolesPermitidos: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map