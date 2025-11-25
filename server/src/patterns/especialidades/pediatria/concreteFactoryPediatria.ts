import { IFabricaKitSalida } from "../../core/abstractFactory";
import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";
import { IFormularioSecundario } from "../../core/abstractProductSecundario";
import { RecetaPediatrica } from "./pediatriaPrincipal";
import { CuidadosPediatricos } from "./pediatriaSecundario";

export class FabricaPediatria implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new RecetaPediatrica();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new CuidadosPediatricos();
    }
}
