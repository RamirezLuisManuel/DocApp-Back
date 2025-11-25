import { IFabricaKitSalida } from "../../core/abstractFactory";
import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";
import { IFormularioSecundario } from "../../core/abstractProductSecundario";
import { PlanAlimenticio } from "./nutriologoPrincipal";
import { GuiaEjercicios } from "./nutriologoSecundario";

export class FabricaNutricion implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new PlanAlimenticio();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new GuiaEjercicios();
    }
}
