import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { XMLParser } from "fast-xml-parser";

// ==========================================
// Configuración y Variables de Entorno
// ==========================================

// Obtener la ruta del directorio actual en formato compatible con ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Variables de entorno con valores predeterminados
const {
    PORT = 3000,
    CORS_ORIGIN = "http://localhost:5173",
    DEFAULT_MODE = "mock",
    SOAP_URL,
    SOAP_ACTION,
    SOAP_NAMESPACE,
    SOAP_OPERATION,
} = process.env;

// ==========================================
// Inicialización del Servidor y Plugins
// ==========================================

const fastify = Fastify({ logger: true });

// Registrar plugin de CORS para permitir peticiones desde el frontend
await fastify.register(cors, {
    origin: CORS_ORIGIN,
});

// Instancia y configuración del parser XML a JSON
// - removeNSPrefix: elimina prefijos de namespaces (ej: 'soap:Envelope' -> 'Envelope')
// - ignoreAttributes: omite atributos de las etiquetas XML para simplificar el objeto resultante
const parser = new XMLParser({
    removeNSPrefix: true,
    ignoreAttributes: true,
});

// ==========================================
// Funciones de Construcción y Peticiones SOAP
// ==========================================

/**
 * Construye el sobre XML SOAP para la solicitud al servicio web.
 * @returns {string} XML formateado con el Envelope y la operación solicitada.
 */
function buildSoapEnvelope() {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="${SOAP_NAMESPACE}">
    <soap:Body>
        <v1:${SOAP_OPERATION} />
    </soap:Body>
</soap:Envelope>`;
}

/**
 * Realiza la petición HTTP POST hacia el servicio SOAP en vivo.
 * @returns {Promise<string>} Contenido XML en texto plano retornado por el servicio SOAP.
 * @throws {Error} Si faltan variables de entorno requeridas o el servicio responde con error HTTP.
 */
async function fetchLiveXml() {
    if (!SOAP_URL || !SOAP_NAMESPACE || !SOAP_OPERATION) {
        throw new Error(
            "Faltan variables de entorno SOAP_URL / SOAP_NAMESPACE / SOAP_OPERATION. Revisa tu .env",
        );
    }

    const response = await fetch(SOAP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: `"${SOAP_ACTION}"`,
        },
        body: buildSoapEnvelope(),
    });

    if (!response.ok) {
        throw new Error(
            `El servicio SOAP respondió ${response.status} ${response.statusText}`,
        );
    }

    return response.text();
}

/**
 * Lee un archivo XML local simulado (mock) para pruebas y desarrollo offline.
 * @returns {Promise<string>} Contenido del archivo XML de respuesta mock.
 */
async function fetchMockXml() {
    const filePath = path.join(__dirname, "mock", "response.xml");
    return readFile(filePath, "utf-8");
}

// ==========================================
// Procesamiento y Transformación de Datos
// ==========================================

/**
 * Analiza el XML recibido y extrae la lista de productos de la estructura DiffGram devuelta.
 * @param {string} xml - Cadena de texto en formato XML.
 * @returns {Array<Object>} Lista de objetos de productos (garantiza siempre un array).
 * @throws {Error} Si la estructura esperada no se encuentra en el XML.
 */
function extractProductos(xml) {
    const json = parser.parse(xml);
    const productosWeb =
        json?.Envelope?.Body?.ConsultarProductosWebResponse
            ?.ConsultarProductosWebResult?.diffgram?.ProductosWeb;

    if (!productosWeb) {
        throw new Error(
            "No se encontró ProductosWeb en la respuesta. ¿El servicio devolvió un fault o cambió la estructura?",
        );
    }

    // Asegurar siempre retornar un array, incluso si viene un único producto u objeto
    return [].concat(productosWeb.Producto ?? []);
}

/**
 * Filtra los productos válidos y extrae las últimas N ediciones por cada tipo de producto.
 *
 * Reglas de filtrado y ordenamiento:
 * 1. Edición debe ser un número entero y menor a 1900 (excluye años o identificadores atípicos).
 * 2. Agrupa las ediciones únicas por Tipo_Producto y selecciona las N más altas.
 * 3. Conserva únicamente los productos pertenecientes a esas ediciones seleccionadas.
 * 4. Ordena el listado final de productos de forma descendente por número de edición.
 *
 * @param {Array<Object>} productos - Lista cruda de productos extraídos del XML.
 * @param {number} n - Cantidad de ediciones recientes a conservar por tipo de producto.
 * @returns {{ resultado: Array<Object>, ultimasPorTipo: Object.<string, Array<number>> }}
 */
function topNPorTipo(productos, n) {
    // 1. Filtrar productos con número de edición numérico y menor a 1900
    const validos = productos.filter(
        (p) => /^\d+$/.test(p.Edicion) && +p.Edicion < 1900,
    );

    // 2. Agrupar las ediciones únicas por tipo de producto usando un Set
    const ultimasPorTipo = {};
    validos.forEach((p) => {
        (ultimasPorTipo[p.Tipo_Producto] ??= new Set()).add(+p.Edicion);
    });

    // 3. Ordenar descendentemente las ediciones de cada tipo y tomar las primeras N
    for (const tipo in ultimasPorTipo) {
        ultimasPorTipo[tipo] = [...ultimasPorTipo[tipo]]
            .sort((a, b) => b - a)
            .slice(0, n);
    }

    // 4. Seleccionar los productos que coincidan con las ediciones elegidas y ordenar descendentemente
    const resultado = validos
        .filter((p) => ultimasPorTipo[p.Tipo_Producto]?.includes(+p.Edicion))
        .sort((a, b) => b.Edicion - a.Edicion);

    return { resultado, ultimasPorTipo };
}

// ==========================================
// Rutas / Endpoints de la API
// ==========================================

/**
 * Ruta de verificación de salud (Health Check).
 * Permite comprobar que el backend está en funcionamiento y qué modo tiene configurado por defecto.
 */
fastify.get("/api/health", async () => ({
    status: "ok",
    defaultMode: DEFAULT_MODE,
}));

/**
 * Ruta principal para consultar productos.
 *
 * Parámetros de consulta (Query Params):
 * - mode: "mock" (predeterminado o según .env) o "live" (consulta real al servicio SOAP).
 * - n: Cantidad de últimas ediciones a retornar por tipo de producto (predeterminado: 3).
 */
fastify.get("/api/productos", async (request, reply) => {
    const mode = request.query.mode || DEFAULT_MODE;
    const n = Number(request.query.n) || 3;

    // Validar que el modo ingresado sea válido
    if (!["mock", "live"].includes(mode)) {
        return reply.code(400).send({ error: 'mode debe ser "mock" o "live"' });
    }

    try {
        // Obtener XML según el modo (en vivo vía SOAP o archivo local simulado)
        const xml = mode === "live" ? await fetchLiveXml() : await fetchMockXml();

        // Extraer productos del XML parseado
        const productos = extractProductos(xml);

        // Aplicar filtro de negocio: top N ediciones por tipo de producto
        const { resultado, ultimasPorTipo } = topNPorTipo(productos, n);

        return {
            mode,
            n,
            totalCrudo: productos.length,
            totalFiltrado: resultado.length,
            ultimasPorTipo,
            productos: resultado,
        };
    } catch (err) {
        request.log.error(err);
        const detail = err.cause?.message || err.message;
        return reply.code(502).send({ error: detail, mode });
    }
});

// ==========================================
// Arranque del Servidor
// ==========================================

const rawPort = process.env.PORT || PORT || 3000;
const listenOptions = isNaN(Number(rawPort))
    ? { path: rawPort }
    : { port: Number(rawPort), host: "0.0.0.0" };

fastify.listen(listenOptions).then(() => {
    const address = typeof listenOptions.port !== "undefined"
        ? `http://localhost:${listenOptions.port}`
        : listenOptions.path;
    console.log(`Backend escuchando en ${address}`);
});


