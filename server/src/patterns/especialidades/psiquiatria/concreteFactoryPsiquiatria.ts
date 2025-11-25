import { IFabricaKitSalida } from "../../core/abstractFactory";
import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";
import { IFormularioSecundario } from "../../core/abstractProductSecundario";
import { RecetaPsiquiatrica } from "./psiquiatriaPrincipal";
import { RecomendacionesPsiquiatricas } from "./psiquiatriaSecundario";

export class FabricaPsiquiatria implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new RecetaPsiquiatrica();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new RecomendacionesPsiquiatricas();
    }
}
