import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";

export class RecetaPsiquiatrica implements IFormularioPrincipal {
    generarHtml(items: any[]): string {
        let html = `<h3>🧠 Prescripción Psiquiátrica</h3><ul>`;
        items.forEach(item => {
            const detalles = typeof item.detalles === 'string'
              ? JSON.parse(item.detalles)
              : item.detalles;

            html += `<li>
              <b>${item.nombre}</b> (${detalles.dosis})
              - ${detalles.frecuencia} durante ${detalles.duracion}
              <br><i>Vía: ${detalles.via}</i>
              <br><small>⚠️ No suspender sin indicación médica. Control estricto de efectos secundarios.</small>
            </li>`;
        });
        html += `</ul>`;
        return html;
    }
}
