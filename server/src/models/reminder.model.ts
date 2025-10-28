import pool from "../config/database";
import { RowDataPacket } from 'mysql2'; // 1. Importa este tipo

// 2. (Opcional pero recomendado) Define cómo se ve una receta
interface RecetaPacket extends RowDataPacket {
  receta_id: number;
  correo: string;
  paciente: string;
  medicamento_nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string; // o string
  fecha_creacion: Date; // o string
}

// 3. Añade el tipo de retorno: Promise<RecetaPacket[]>
export async function getActivePrescriptions(): Promise<RecetaPacket[]> {
  // 4. Tipa la consulta para que mysql2 sepa qué devolver
  const [rows] = await pool.query<RecetaPacket[]>(`
    SELECT 
      r.id AS receta_id,
      u.email AS correo,
      u.nombre AS paciente,
      r.medicamento_nombre,
      r.dosis,
      r.frecuencia,
      r.duracion,
      r.fecha_creacion
    FROM recetas_medicas r
    INNER JOIN historial_medico h ON r.historial_id = h.id
    INNER JOIN usuarios u ON h.paciente_id = u.id
    WHERE
      u.estado = 'activo'
      AND (
        -- Condición 1: La receta es indefinida (nunca expira)
        r.duracion IS NULL 
        OR r.duracion = '' 
        OR r.duracion LIKE '%indefinido%'

        -- Condición 2: La receta tiene duración Y aún no ha expirado
        -- (AQUÍ ESTÁ LA CORRECCIÓN DE SINTAXIS)
        OR NOW() <= CASE
          WHEN r.duracion LIKE '%día%' OR r.duracion LIKE '%dia%' THEN
            DATE_ADD(r.fecha_creacion, INTERVAL CAST(SUBSTRING_INDEX(r.duracion, ' ', 1) AS UNSIGNED) DAY)
          
          WHEN r.duracion LIKE '%semana%' THEN
            DATE_ADD(r.fecha_creacion, INTERVAL CAST(SUBSTRING_INDEX(r.duracion, ' ', 1) AS UNSIGNED) WEEK)
            
          WHEN r.duracion LIKE '%mes%' THEN
            DATE_ADD(r.fecha_creacion, INTERVAL CAST(SUBSTRING_INDEX(r.duracion, ' ', 1) AS UNSIGNED) MONTH)
            
          WHEN r.duracion LIKE '%año%' THEN
            DATE_ADD(r.fecha_creacion, INTERVAL CAST(SUBSTRING_INDEX(r.duracion, ' ', 1) AS UNSIGNED) YEAR)
            
          ELSE
            -- Fallback por si solo ponen un número (ej. "7")
            DATE_ADD(r.fecha_creacion, INTERVAL CAST(SUBSTRING_INDEX(r.duracion, ' ', 1) AS UNSIGNED) DAY)
        END
      )
  `);
  return rows;
}