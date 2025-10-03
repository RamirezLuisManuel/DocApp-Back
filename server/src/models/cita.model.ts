export interface Cita {
  id?: number;
  paciente_id: number;
  medico_id: number;
  fecha_cita: string;
  duracion: number;
  motivo_consulta: string;
  estado: 'solicitada' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
  tipo_consulta: 'primera_vez' | 'seguimiento' | 'urgencia';
  notas_paciente?: string;
  notas_medico?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface CitaInput {
  medico_id: number;
  fecha_cita: string;
  motivo_consulta: string;
  tipo_consulta: 'primera_vez' | 'seguimiento' | 'urgencia';
  notas_paciente?: string;
}