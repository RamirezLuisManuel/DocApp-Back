// src/services/fda/fda.interface.ts
export interface IFdaService {
    buscarMedicamento(nombre: string): Promise<any>;
}