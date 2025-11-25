// src/services/fda/fda.real.ts
import { IFdaService } from "./fda.interface";

export class FdaServiceReal implements IFdaService {
    
    public async buscarMedicamento(nombre: string): Promise<any> {
        console.log(`🌍 [REAL] Conectando a API externa FDA para: "${nombre}"...`);
        
        const drugName = encodeURIComponent(nombre);
        const apiKey = process.env.FDA_API_KEY;

        if (!apiKey) {
            throw new Error('API Key de FDA no configurada en .env');
        }

        const url = `https://api.fda.gov/drug/label.json?api_key=${apiKey}&search=openfda.brand_name:"${drugName}"&limit=10`;

        const response = await fetch(url);
        const data: any = await response.json();

        // Procesamos la data tal como lo hacías en tu index.ts
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
            return data.results.map((result: any) => ({
                marca: result.openfda?.brand_name?.[0] || 'Sin marca',
                generico: result.openfda?.generic_name?.[0] || 'N/A',
                fabricante: result.openfda?.manufacturer_name?.[0] || 'N/A',
                indicaciones: result.indications_and_usage?.[0] || 'N/A',
                dosificacion: result.dosage_and_administration?.[0] || 'N/A',
                advertencias: result.warnings?.[0] || 'N/A',
                efectos_adversos: result.adverse_reactions?.[0] || 'N/A'
            }));
        } else {
            return [];
        }
    }
}