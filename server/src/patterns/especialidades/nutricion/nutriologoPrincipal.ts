import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";

export class PlanAlimenticio implements IFormularioPrincipal {
    generarHtml(items: any[]): string {
        let html = `<h3>🥗 Plan Alimenticio</h3><ul>`;
        items.forEach(item => {
            const detalles = typeof item.detalles === 'string'
              ? JSON.parse(item.detalles)
              : item.detalles;

            html += `<li>
              <b>${item.nombre}</b> (${detalles.porcion})
              - ${detalles.horario}
              <br><i>${detalles.calorias || ''}</i>
            </li>`;
        });
        html += `</ul>`;
        return html;
    }
}
