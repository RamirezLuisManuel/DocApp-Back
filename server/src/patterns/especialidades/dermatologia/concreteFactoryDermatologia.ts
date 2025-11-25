import { IFabricaKitSalida } from "../../core/abstractFactory";
import { IFormularioPrincipal } from "../../core/abstractProductPrincipal";
import { IFormularioSecundario } from "../../core/abstractProductSecundario";
import { RecetaDermatologica } from "./dermatologiaPrincipal";
import { CuidadosDermatologicos } from "./dermatologiaSecundario";

export class FabricaDermatologia implements IFabricaKitSalida {
    crearFormularioPrincipal(): IFormularioPrincipal {
        return new RecetaDermatologica();
    }
    crearFormularioSecundario(): IFormularioSecundario {
        return new CuidadosDermatologicos();
    }
}
