import { IFormularioSecundario } from "./abstractProductSecundario";

export class GuiaEjercicios implements IFormularioSecundario {
    generarHtml(): string {
        return `<div style="background:#efe; padding:10px; border-left:4px solid green;">
                    <h4>🏃🏻 Guía de Actividad Física</h4>
                    <p>Realizar 30 minutos de caminata diaria y beber 2 litros de agua.</p>
                </div>`;
    }
}