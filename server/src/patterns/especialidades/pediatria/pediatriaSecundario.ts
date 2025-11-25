import { IFormularioSecundario } from "../../core/abstractProductSecundario";

export class CuidadosPediatricos implements IFormularioSecundario {
    generarHtml(): string {
        return `<div style="background:#fff3cd; padding:10px; border-left:4px solid #ffc107;">
                    <h4>👶 Cuidados Pediátricos</h4>
                    <p><strong>Indicaciones para padres/tutores:</strong></p>
                    <ul>
                        <li>Mantener al menor hidratado constantemente</li>
                        <li>Monitorear temperatura cada 4 horas</li>
                        <li>Dieta blanda y fraccionada según edad</li>
                        <li>Reposo y evitar contacto con otros niños si hay fiebre</li>
                        <li>Acudir a urgencias si presenta dificultad respiratoria o fiebre persistente</li>
                    </ul>
                </div>`;
    }
}
