import { IFormularioPrincipal } from "./abstractProductPrincipal";

export class RecetaFarmacia implements IFormularioPrincipal {
    generarHtml(items: any[]): string {
        let html = `<h3>💊 Receta Médica</h3><ul>`;
        items.forEach(item => {
            const detalles = typeof item.detalles === 'string' 
              ? JSON.parse(item.detalles) 
              : item.detalles;
            
            html += `<li>
              <b>${item.nombre}</b> (${detalles.dosis}) 
              - ${detalles.frecuencia} durante ${detalles.duracion}
              <br><i>Vía: ${detalles.via}</i>
            </li>`;
        });
        html += `</ul>`;
        return html;
    }
}