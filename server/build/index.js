"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cita_routes_1 = __importDefault(require("./routes/cita.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const historial_routes_1 = __importDefault(require("./routes/historial.routes"));
dotenv_1.default.config();
class Server {
    app;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = Number(process.env.PORT) || 3000;
        this.config();
        this.routes();
    }
    config() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/citas', cita_routes_1.default);
        this.app.use('/api/historial', historial_routes_1.default);
        // Ruta de medicamentos (FDA API)
        this.app.get('/api/drugs/search/:name', async (req, res) => {
            try {
                const name = req.params.name;
                if (!name) {
                    res.status(400).json({ success: false, error: 'Nombre de medicamento requerido' });
                    return;
                }
                const drugName = encodeURIComponent(name);
                const apiKey = process.env.FDA_API_KEY;
                if (!apiKey) {
                    res.status(500).json({ success: false, error: 'API Key no configurada' });
                    return;
                }
                const url = `https://api.fda.gov/drug/label.json?api_key=${apiKey}&search=openfda.brand_name:"${drugName}"&limit=10`;
                console.log('Buscando medicamento:', drugName);
                const response = await fetch(url);
                const data = await response.json();
                if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                    const medicamentos = data.results.map((result) => ({
                        marca: result.openfda?.brand_name?.[0] || 'Sin marca',
                        generico: result.openfda?.generic_name?.[0] || 'N/A',
                        fabricante: result.openfda?.manufacturer_name?.[0] || 'N/A',
                        indicaciones: result.indications_and_usage?.[0] || 'N/A',
                        dosificacion: result.dosage_and_administration?.[0] || 'N/A',
                        advertencias: result.warnings?.[0] || 'N/A',
                        efectos_adversos: result.adverse_reactions?.[0] || 'N/A'
                    }));
                    res.json({ success: true, data: medicamentos });
                }
                else {
                    res.json({ success: true, data: [], message: 'No se encontraron resultados' });
                }
            }
            catch (error) {
                console.error('Error:', error);
                res.status(500).json({ success: false, error: 'Error al buscar medicamento' });
            }
        });
    }
    start() {
        this.app.listen(this.port, () => {
            console.log('Server on port', this.port);
        });
    }
}
const server = new Server();
console.log('WORKS!!!!!');
server.start();
//# sourceMappingURL=index.js.map