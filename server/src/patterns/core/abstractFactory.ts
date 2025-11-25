import { IFormularioPrincipal } from "./abstractProductPrincipal";
import { IFormularioSecundario } from "./abstractProductSecundario";

export interface IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal;
    crearFormularioSecundario(): IFormularioSecundario;
}
