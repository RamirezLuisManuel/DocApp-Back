export interface HistorialMedico {
  id?: number;
  cita_id: number;
  paciente_id: number;
  medico_id: number;
  fecha_consulta: string;
  diagnostico: string;
  sintomas?: string;
  exploracion_fisica?: string;
  presion_arterial?: string;
  temperatura?: number;
  peso?: number;
  altura?: number;
  observaciones?: string;
  plan_tratamiento?: string;
  fecha_seguimiento?: string;
}

export interface RecetaMedica {
  id?: number;
  historial_id: number;
  medicamento_nombre: string;
  medicamento_generico?: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via_administracion?: string;
  indicaciones?: string;
}

export interface HistorialInput {
  cita_id: number;
  diagnostico: string;
  sintomas?: string;
  exploracion_fisica?: string;
  presion_arterial?: string;
  temperatura?: number;
  peso?: number;
  altura?: number;
  observaciones?: string;
  plan_tratamiento?: string;
  fecha_seguimiento?: string;
  recetas: RecetaMedica[];
}