import { IFormularioPrincipal } from "./abstractProductPrincipal";

export class RecetaFarmacia implements IFormularioPrincipal {
    generarHtml(items: any[]): string {
        let html = `<h3>💊 Receta Médica</h3><ul>`;
        items.forEach(item => {
            html += `<li><b>${item.medicamento_nombre}</b> (${item.dosis}) - ${item.frecuencia} durante ${item.duracion}<br><i>${item.indicaciones || ''}</i></li>`;
        });
        html += `</ul>`;
        return html;
    }
}