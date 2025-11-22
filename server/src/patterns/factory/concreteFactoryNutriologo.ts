import { IFabricaKitSalida } from "./abstractFactory";
import { IFormularioPrincipal } from "../products/abstractProductPrincipal";
import { IFormularioSecundario } from "../products/abstractProductSecundario";
import { PlanAlimenticio } from "../products/nutriologoPrincipal";
import { GuiaEjercicios } from "../products/nutriologoSecundario";

export class FabricaNutricion implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new PlanAlimenticio();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new GuiaEjercicios();
    }
}