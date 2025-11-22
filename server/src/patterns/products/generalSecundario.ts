import { IFormularioSecundario } from "./abstractProductSecundario";

export class CuidadosGenerales implements IFormularioSecundario {
    generarHtml(): string {
        return `<div style="background:#eef; padding:10px; border-left:4px solid blue;">
                    <h4>ℹ️ Cuidados Generales</h4>
                    <p>Reposo relativo, hidratación abundante y control de temperatura si es necesario.</p>
                </div>`;
    }
}