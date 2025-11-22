import { IFormularioPrincipal } from "../products/abstractProductPrincipal";
import { IFormularioSecundario } from "../products/abstractProductSecundario";

export interface IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal;
    crearFormularioSecundario(): IFormularioSecundario;
}