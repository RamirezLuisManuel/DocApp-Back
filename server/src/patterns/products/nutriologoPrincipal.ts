import { IFormularioPrincipal } from "./abstractProductPrincipal";

export class PlanAlimenticio implements IFormularioPrincipal {
    generarHtml(items: any[]): string {
        let html = `<h3>🥗 Plan Nutricional</h3><ul>`;
        items.forEach(item => {
            // Reinterpretamos 'medicamento_nombre' como 'Alimento' y 'dosis' como 'Porción'
            html += `<li><b>${item.medicamento_nombre}</b> - Porción: ${item.dosis}<br>Horario: ${item.frecuencia} (${item.duracion})<br><i>Nota: ${item.indicaciones || ''}</i></li>`;
        });
        html += `</ul>`;
        return html;
    }
}