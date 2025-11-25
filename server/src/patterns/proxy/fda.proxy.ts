// src/services/fda/fda.proxy.ts
import { IFdaService } from "./fda.interface";
import { FdaServiceReal } from './fda.real';

export class FdaProxy implements IFdaService {
    private servicioReal: FdaServiceReal;
    
    // Esta es nuestra memoria caché: Un mapa donde la llave es el nombre y el valor es el resultado
    // Guardamos también el 'timestamp' para saber cuándo caduca
    private cache: Map<string, { data: any, timestamp: number }>;
    
    // Tiempo de vida de la caché (ej. 1 hora = 3600000 ms)
    private readonly CACHE_TTL = 3600000; 

    constructor() {
        this.servicioReal = new FdaServiceReal();
        this.cache = new Map();
    }

    public async buscarMedicamento(nombre: string): Promise<any> {
        const key = nombre.toLowerCase().trim();
        const ahora = Date.now();

        // 1. Verificar si existe en Caché
        if (this.cache.has(key)) {
            const entry = this.cache.get(key)!;

            // 2. Verificar si la caché sigue fresca (no ha expirado)
            if ((ahora - entry.timestamp) < this.CACHE_TTL) {
                console.log(`🚀 [PROXY] Cache HIT! Devolviendo datos guardados para: "${nombre}"`);
                return entry.data;
            } else {
                console.log(`⌛ [PROXY] Cache EXPIRADO para: "${nombre}". Se recargará.`);
                this.cache.delete(key);
            }
        }

        // 3. Si no está en caché (o expiró), llamamos al servicio real
        console.log(`🐢 [PROXY] Cache MISS. Llamando al servicio Real...`);
        const resultados = await this.servicioReal.buscarMedicamento(nombre);

        // 4. Guardamos el resultado nuevo en caché si hubo resultados
        if (resultados && resultados.length > 0) {
            this.cache.set(key, {
                data: resultados,
                timestamp: ahora
            });
            console.log(`💾 [PROXY] Resultados guardados en caché para: "${nombre}"`);
        }

        return resultados;
    }
}

//```

//### PASO 2: Conectarlo en tu Servidor (`index.ts`)

//Ahora debes modificar tu archivo principal `index.ts` (o donde definas tus rutas) para usar el Proxy en lugar de tener la lógica ahí tirada.

//Busca la sección `this.app.get('/api/drugs/search/:name', ...)` y cámbiala por esto:

