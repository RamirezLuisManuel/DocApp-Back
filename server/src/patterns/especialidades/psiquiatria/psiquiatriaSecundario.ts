import { IFormularioSecundario } from "../../core/abstractProductSecundario";

export class RecomendacionesPsiquiatricas implements IFormularioSecundario {
    generarHtml(): string {
        return `<div style="background:#e8f4f8; padding:10px; border-left:4px solid #17a2b8;">
                    <h4>🧠 Recomendaciones de Salud Mental</h4>
                    <p><strong>Cuidados y seguimiento:</strong></p>
                    <ul>
                        <li>Mantener rutina de sueño regular (7-9 horas diarias)</li>
                        <li>Evitar consumo de alcohol y sustancias psicoactivas</li>
                        <li>Realizar técnicas de relajación y mindfulness diariamente</li>
                        <li>Mantener actividad física moderada (30 min, 3 veces/semana)</li>
                        <li>Asistir puntualmente a citas de seguimiento</li>
                        <li>Contactar inmediatamente si presenta ideación suicida o crisis</li>
                    </ul>
                    <p><em>Línea de emergencia psiquiátrica disponible 24/7</em></p>
                </div>`;
    }
}
