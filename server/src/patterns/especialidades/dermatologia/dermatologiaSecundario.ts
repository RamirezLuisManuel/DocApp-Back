import { IFormularioSecundario } from "../../core/abstractProductSecundario";

export class CuidadosDermatologicos implements IFormularioSecundario {
    generarHtml(): string {
        return `<div style="background:#fef5e7; padding:10px; border-left:4px solid #f39c12;">
                    <h4>🧴 Cuidados Dermatológicos</h4>
                    <p><strong>Recomendaciones para el cuidado de la piel:</strong></p>
                    <ul>
                        <li>Limpiar la piel con productos suaves sin fragancia</li>
                        <li>Aplicar protector solar SPF 50+ diariamente, incluso en días nublados</li>
                        <li>Mantener la piel hidratada con cremas emolientes</li>
                        <li>Evitar rascado y manipulación de lesiones</li>
                        <li>No exponerse directamente al sol durante tratamiento</li>
                        <li>Usar ropa de algodón y evitar tejidos irritantes</li>
                        <li>Suspender cosméticos no indicados por el dermatólogo</li>
                    </ul>
                </div>`;
    }
}
