import { computed, ref } from 'vue'
import { fetchProductos } from '@/api/productos'
import { classifyFormato, lookupDims } from '@/config/formats'
import { pagePositions, slotKey } from '@/config/layouts'

// Estado a nivel de módulo: un único fetch del histórico completo,
// compartido por las tres vistas de portal (evita repetir la consulta
// al cambiar de pestaña).
const raw = ref([])
const status = ref('idle') // idle | loading | ready | error
const error = ref(null)

// Modo de API (opcional: quitar 'mode=mock' para usar el modo por defecto del servidor o cambiar a 'live')
const API_MODE = import.meta.env.VITE_API_MODE || undefined

async function load() {
  if (status.value === 'loading' || status.value === 'ready') return
  status.value = 'loading'
  error.value = null
  try {
    const body = await fetchProductos({ n: 1000, ...(API_MODE ? { mode: API_MODE } : {}) })
    raw.value = body.productos
    status.value = 'ready'
  } catch (err) {
    error.value = err.message
    status.value = 'error'
  }
}

export function ordenarUbicacion(a, b) {
  const na = Number(a)
  const nb = Number(b)
  const aIsNum = !Number.isNaN(na)
  const bIsNum = !Number.isNaN(nb)
  if (aIsNum && bIsNum) return na - nb
  if (aIsNum) return -1
  if (bIsNum) return 1
  return String(a).localeCompare(String(b), 'es')
}

/**
 * Construye el inventario de un portal: une todos los pares
 * Formato+Ubicación vistos en el histórico con las posiciones que el
 * sitio publica hoy (config/layouts) y los cruza contra la edición elegida
 * para saber cuáles están vendidos. La API solo entrega ventas, nunca "no
 * vendidos" — un espacio se considera disponible si no aparece en esa
 * edición.
 *
 * `edicionElegida` es un ref con el número de edición a mostrar (o null
 * para la más reciente).
 */
export function usePortalInventory(portal, edicionElegida) {
  const layout = pagePositions(portal)
  const layoutByKey = new Map()
  for (const positions of Object.values(layout)) {
    for (const p of Object.values(positions)) layoutByKey.set(slotKey(p.formato, p.ubicacion), p)
  }

  const productos = computed(() => raw.value.filter((p) => p.Tipo_Producto === portal.tipoProducto))

  // Ediciones del portal, de la más nueva a la más antigua, con cuántos
  // avisos tiene cada una. Las más recientes suelen estar en venta y traer
  // pocos registros, por eso se deja elegir cuál mirar.
  const ediciones = computed(() => {
    const conteo = new Map()
    for (const p of productos.value) conteo.set(p.Edicion, (conteo.get(p.Edicion) ?? 0) + 1)
    return [...conteo].map(([numero, avisos]) => ({ numero, avisos })).sort((a, b) => b.numero - a.numero)
  })

  const edicion = computed(() => {
    if (!ediciones.value.length) return null
    const elegida = Number(edicionElegida?.value)
    return ediciones.value.some((e) => e.numero === elegida) ? elegida : ediciones.value[0].numero
  })

  const slots = computed(() => {
    if (!edicion.value) return []

    const inventario = new Map()
    for (const p of productos.value) {
      const key = slotKey(p.Formato, p.Ubicacion)
      if (!inventario.has(key)) inventario.set(key, { formato: p.Formato, ubicacion: p.Ubicacion, enHistorico: true })
    }
    for (const [key, p] of layoutByKey) {
      if (!inventario.has(key)) inventario.set(key, { formato: p.formato, ubicacion: p.ubicacion, enHistorico: false })
    }

    const vendidosEdicion = new Map()
    // Ventas por posición en todo el histórico: una por edición, la más
    // reciente primero (para el globo de información del aviso).
    const historial = new Map()
    for (const p of productos.value) {
      const key = slotKey(p.Formato, p.Ubicacion)
      if (p.Edicion === edicion.value) vendidosEdicion.set(key, p)
      if (!historial.has(key)) historial.set(key, new Map())
      historial.get(key).set(p.Edicion, p)
    }

    return [...inventario]
      .map(([key, { formato, ubicacion, enHistorico }]) => {
        const venta = vendidosEdicion.get(key)
        const ventas = [...(historial.get(key)?.values() ?? [])].sort((a, b) => b.Edicion - a.Edicion)
        const anterior = ventas.find((v) => v.Edicion < edicion.value)
        const posterior = ventas.findLast((v) => v.Edicion > edicion.value)
        const position = layoutByKey.get(key)
        const { section, isBonus } = classifyFormato(formato)
        return {
          id: key,
          formato,
          ubicacion,
          section,
          isBonus,
          label: position?.label ?? null,
          dims: position?.dims ?? lookupDims(formato),
          enHistorico,
          status: venta ? 'vendido' : 'disponible',
          empresa: venta?.Empresa ?? null,
          ejecutivo: venta?.Ejecutivo ?? null,
          edicion: edicion.value,
          edicionesVendidas: ventas.length,
          ventaAnterior: anterior
            ? { edicion: anterior.Edicion, empresa: anterior.Empresa, ejecutivo: anterior.Ejecutivo }
            : null,
          ventaPosterior: posterior
            ? { edicion: posterior.Edicion, empresa: posterior.Empresa, ejecutivo: posterior.Ejecutivo }
            : null,
        }
      })
      .sort((a, b) => a.formato.localeCompare(b.formato, 'es') || ordenarUbicacion(a.ubicacion, b.ubicacion))
  })

  // Por página: clave de posición (lb, sb1, mr3...) → slot del inventario.
  const pages = computed(() => {
    const byId = new Map(slots.value.map((s) => [s.id, s]))
    return Object.fromEntries(
      Object.entries(layout).map(([pageId, positions]) => [
        pageId,
        Object.fromEntries(
          Object.entries(positions).map(([posId, p]) => [posId, byId.get(slotKey(p.formato, p.ubicacion))]),
        ),
      ]),
    )
  })

  const placedIds = computed(() => new Set(slots.value.filter((s) => layoutByKey.has(s.id)).map((s) => s.id)))

  // Los formatos del diseño anterior no cuentan: ya no se pueden vender.
  const summary = computed(() => {
    const vigentes = slots.value.filter((s) => s.section !== 'anteriores')
    const total = vigentes.length
    const vendidos = vigentes.filter((s) => s.status === 'vendido').length
    return { total, vendidos, disponibles: total - vendidos }
  })

  return { edicion, ediciones, slots, pages, placedIds, summary }
}

export function useCatalog() {
  load()
  return { status, error, load }
}
