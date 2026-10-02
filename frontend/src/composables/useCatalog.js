import { computed, ref } from 'vue'
import { fetchProductos } from '@/api/productos'
import { classifyFormato, isContenidoAuspiciado, isFormatoAnterior, lookupDims } from '@/config/formats'
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

  const productos = computed(() =>
    raw.value.filter((p) => p.Tipo_Producto === portal.tipoProducto && !isFormatoAnterior(p.Formato)),
  )

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
      if (isContenidoAuspiciado(p.Formato)) continue
      const key = slotKey(p.Formato, p.Ubicacion)
      if (!inventario.has(key)) inventario.set(key, { formato: p.Formato, ubicacion: p.Ubicacion, enHistorico: true })
    }
    for (const [key, p] of layoutByKey) {
      if (!inventario.has(key)) inventario.set(key, { formato: p.formato, ubicacion: p.ubicacion, enHistorico: false })
    }

    const ventasEdicionPorKey = new Map()
    // Ventas por posición en todo el histórico agrupadas por edición
    const historial = new Map()
    for (const p of productos.value) {
      if (isContenidoAuspiciado(p.Formato)) continue
      const key = slotKey(p.Formato, p.Ubicacion)
      if (Number(p.Edicion) === Number(edicion.value)) {
        if (!ventasEdicionPorKey.has(key)) ventasEdicionPorKey.set(key, [])
        ventasEdicionPorKey.get(key).push(p)
      }
      if (!historial.has(key)) historial.set(key, new Map())
      const edMap = historial.get(key)
      const edNum = Number(p.Edicion)
      if (!edMap.has(edNum)) edMap.set(edNum, [])
      edMap.get(edNum).push(p)
    }

    const slotsInventario = [...inventario]
      .map(([key, { formato, ubicacion, enHistorico }]) => {
        const ventas = ventasEdicionPorKey.get(key) ?? []

        // Historial consolidado por edición para el tooltip
        const edMap = historial.get(key) ?? new Map()
        const ventasHistoricas = [...edMap.entries()]
          .map(([edNum, items]) => {
            const emps = [...new Set(items.map((i) => i.Empresa?.trim()).filter(Boolean))]
            const esComp = emps.length > 1 || items.some((i) => i.compartido)
            return {
              edicion: edNum,
              empresa: emps.join(' / '),
              ejecutivo: [...new Set(items.map((i) => i.Ejecutivo?.trim()).filter(Boolean))].join(', '),
              esCompartido: esComp,
            }
          })
          .sort((a, b) => b.edicion - a.edicion)

        const anterior = ventasHistoricas.find((v) => v.edicion < edicion.value)
        const posterior = ventasHistoricas.findLast((v) => v.edicion > edicion.value)
        const position = layoutByKey.get(key)
        const { section, isBonus } = classifyFormato(formato)

        // Detección de avisos compartidos (dos o más clientes distintos en la misma posición)
        const empresasUnicas = [...new Set(ventas.map((v) => v.Empresa?.trim()).filter(Boolean))]
        const esCompartido = empresasUnicas.length > 1 || ventas.some((v) => v.compartido)
        const esVendido = ventas.length > 0
        const status = esCompartido ? 'compartido' : esVendido ? 'vendido' : 'disponible'

        const pct = esCompartido ? Math.round(100 / ventas.length) : 100
        const clientes = ventas.map((v) => ({
          empresa: v.Empresa,
          ejecutivo: v.Ejecutivo,
          porcentaje: v.porcentaje ?? pct,
        }))

        return {
          id: key,
          formato,
          ubicacion,
          section,
          isBonus,
          label: position?.label ?? null,
          dims: position?.dims ?? lookupDims(formato),
          enHistorico,
          status,
          compartido: esCompartido,
          clientes,
          empresa: empresasUnicas.join(' / ') || null,
          ejecutivo: [...new Set(ventas.map((v) => v.Ejecutivo?.trim()).filter(Boolean))].join(', ') || null,
          edicion: edicion.value,
          edicionesVendidas: ventasHistoricas.length,
          ventaAnterior: anterior
            ? { edicion: anterior.edicion, empresa: anterior.empresa, ejecutivo: anterior.ejecutivo, compartido: anterior.esCompartido }
            : null,
          ventaPosterior: posterior
            ? { edicion: posterior.edicion, empresa: posterior.empresa, ejecutivo: posterior.ejecutivo, compartido: posterior.esCompartido }
            : null,
        }
      })

    // Contenido auspiciado no es un espacio único compartido: cada registro
    // del ERP representa una publicación distinta, aunque la ubicación sea
    // siempre "Única". Se conserva un slot por fila de la edición elegida.
    const ocurrencias = new Map()
    const contenidosAuspiciados = productos.value
      .filter((p) => Number(p.Edicion) === Number(edicion.value) && isContenidoAuspiciado(p.Formato))
      .map((p) => {
        const empresa = p.Empresa?.trim() || null
        const ejecutivo = p.Ejecutivo?.trim() || null
        const baseId = [slotKey(p.Formato, p.Ubicacion), empresa, ejecutivo].join('|||').toUpperCase()
        const ocurrencia = ocurrencias.get(baseId) ?? 0
        ocurrencias.set(baseId, ocurrencia + 1)

        return {
          id: `contenido-auspiciado|||${baseId}|||${ocurrencia}`,
          formato: p.Formato,
          ubicacion: p.Ubicacion,
          section: 'especiales',
          isBonus: classifyFormato(p.Formato).isBonus,
          label: 'Contenido auspiciado',
          dims: lookupDims(p.Formato),
          enHistorico: true,
          status: 'vendido',
          compartido: false,
          clientes: [{ empresa, ejecutivo, porcentaje: 100 }],
          empresa,
          ejecutivo,
          edicion: edicion.value,
          edicionesVendidas: 1,
          ventaAnterior: null,
          ventaPosterior: null,
        }
      })

    return [...slotsInventario, ...contenidosAuspiciados].sort(
      (a, b) => a.formato.localeCompare(b.formato, 'es') || ordenarUbicacion(a.ubicacion, b.ubicacion) || String(a.id).localeCompare(String(b.id), 'es'),
    )
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

  const summary = computed(() => {
    const vigentes = slots.value.filter((s) => s.section)
    const total = vigentes.length
    const compartidos = vigentes.filter((s) => s.status === 'compartido').length
    const soloVendidos = vigentes.filter((s) => s.status === 'vendido').length
    const vendidos = soloVendidos + compartidos
    return { total, vendidos, compartidos, disponibles: total - vendidos }
  })

  return { edicion, ediciones, slots, pages, placedIds, summary }
}

export function useCatalog() {
  load()
  return { status, error, load }
}
