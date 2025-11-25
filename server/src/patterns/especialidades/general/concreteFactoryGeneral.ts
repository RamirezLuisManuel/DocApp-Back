import { IFabricaKitSalida } from "../../core/abstractFactory";
import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";
import { IFormularioSecundario } from "../../core/abstractProductSecundario";
import { RecetaFarmacia } from "./generalPrincipal";
import { CuidadosGenerales } from "./generalSecundario";

export class FabricaMedicinaGeneral implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new RecetaFarmacia();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new CuidadosGenerales();
    }
}
