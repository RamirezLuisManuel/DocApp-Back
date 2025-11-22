import { IFabricaKitSalida } from "./abstractFactory";
import { IFormularioPrincipal } from "../products/abstractProductPrincipal";
import { IFormularioSecundario } from "../products/abstractProductSecundario";
import { RecetaFarmacia } from "../products/generalPrincipal";
import { CuidadosGenerales } from "../products/generalSecundario";

export class FabricaMedicinaGeneral implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new RecetaFarmacia();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new CuidadosGenerales();
    }
}