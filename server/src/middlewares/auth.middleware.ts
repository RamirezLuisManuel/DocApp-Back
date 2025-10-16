    import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, error: 'Token no proporcionado' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key_cambiar_en_produccion'
    ) as any;

    // Agregar información del usuario a la request
    (req as any).userId = decoded.id;
    (req as any).userRole = decoded.rol;

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles específicos
export const verificarRol = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).userRole;

    if (!rolesPermitidos.includes(userRole)) {
      res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para esta acción' 
      });
      return;
    }

    next();
  };
};