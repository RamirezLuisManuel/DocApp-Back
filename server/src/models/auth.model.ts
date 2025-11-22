export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'paciente' | 'medico' | 'admin' | 'ayudante';
    especialidad?: string; // Especialidad para eqtiquetas dinamicas en front
  };
  message?: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}