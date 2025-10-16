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
  };
  message?: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
}