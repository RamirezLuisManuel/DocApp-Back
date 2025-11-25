import { IFdaService } from './fda.interface';
import { translate } from 'google-translate-api-x';

export class FdaServiceReal implements IFdaService {
    
    public async buscarMedicamento(nombre: string): Promise<any> {
        console.log(`🌍 [REAL] Iniciando proceso para: "${nombre}"`);
        
        try {
            // 1. TRADUCCIÓN DE ENTRADA (Español -> Inglés)
            // Si el usuario escribe "Dolor de cabeza", la API necesita "Headache"
            const traduccionQuery = await translate(nombre, { from: 'es', to: 'en' });
            const terminoEnIngles = traduccionQuery.text;
            
            console.log(`🔤 [TRADUCCIÓN] Input: "${nombre}" -> API Query: "${terminoEnIngles}"`);

            const drugName = encodeURIComponent(terminoEnIngles);
            const apiKey = process.env.FDA_API_KEY;

            if (!apiKey) {
                throw new Error('API Key de FDA no configurada');
            }

            // Llamamos a la API con el término en INGLÉS
            const url = `https://api.fda.gov/drug/label.json?api_key=${apiKey}&search=openfda.brand_name:"${drugName}"&limit=10`; // Bajamos el límite a 5 para que la traducción no tarde tanto

            const response = await fetch(url);
            const data: any = await response.json();

            if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                
                // 2. TRADUCCIÓN DE SALIDA (Inglés -> Español)
                // Usamos Promise.all para traducir todos los resultados en paralelo
                const resultadosTraducidos = await Promise.all(data.results.map(async (result: any) => {
                    
                    // Extraemos los textos en inglés
                    const indicacionesEn = result.indications_and_usage?.[0] || 'N/A';
                    const advertenciasEn = result.warnings?.[0] || 'N/A';
                    const efectosEn = result.adverse_reactions?.[0] || 'N/A';
                    const dosificacionEn = result.dosage_and_administration?.[0] || 'N/A';

                    // Traducimos los campos largos (Esto toma tiempo, por eso el Proxy es vital)
                    // Hacemos las llamadas de traducción en paralelo para este item
                    const [indicacionesEs, advertenciasEs, efectosEs, dosificacionEs] = await Promise.all([
                        this.traducirTexto(indicacionesEn),
                        this.traducirTexto(advertenciasEn),
                        this.traducirTexto(efectosEn),
                        this.traducirTexto(dosificacionEn)
                    ]);

                    return {
                        marca: result.openfda?.brand_name?.[0] || 'Sin marca',
                        generico: result.openfda?.generic_name?.[0] || 'N/A',
                        fabricante: result.openfda?.manufacturer_name?.[0] || 'N/A',
                        // Usamos los textos traducidos
                        indicaciones: indicacionesEs, 
                        dosificacion: dosificacionEs,
                        advertencias: advertenciasEs,
                        efectos_adversos: efectosEs
                    };
                }));

                console.log(`✅ [REAL] Datos obtenidos y traducidos al Español.`);
                return resultadosTraducidos;

            } else {
                return [];
            }

        } catch (error) {
            console.error('Error en FdaServiceReal:', error);
            return [];
        }
    }

    // Método auxiliar para traducir y limpiar un poco el texto
    private async traducirTexto(texto: string): Promise<string> {
        if (!texto || texto === 'N/A') return 'Información no disponible';
        
        // Cortamos el texto si es muy largo para no saturar el traductor gratis (opcional)
        const textoCorto = texto.length > 1000 ? texto.substring(0, 1000) + '...' : texto;

        try {
            const res = await translate(textoCorto, { from: 'en', to: 'es' });
            return res.text;
        } catch (err) {
            // Si falla la traducción, devolvemos el original en inglés (Fallback)
            return textoCorto; 
        }
    }
}