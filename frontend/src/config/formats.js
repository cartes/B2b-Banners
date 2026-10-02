// Secciones de página, en el orden en que aparecen en el media kit impreso.
export const SECTIONS = [
  { id: 'desktop-home', label: 'Desktop · Home', short: 'Home' },
  { id: 'desktop-interior', label: 'Desktop · Interior', short: 'Interior' },
  { id: 'movil-home', label: 'Móvil · Home', short: 'Home' },
  { id: 'movil-interior', label: 'Móvil · Interior', short: 'Interior' },
  { id: 'newsletter', label: 'Newsletter', short: 'Newsletter' },
  { id: 'intersticial', label: 'Intersticial', short: 'Intersticial' },
  { id: 'especiales', label: 'Formatos especiales', short: 'Especiales' },
]

export function isFormatoAnterior(formatoRaw) {
  const f = String(formatoRaw).toUpperCase().trim()
  const base = f.replace(/^BONIFICACION\s+/, '')
  return /^PORTAL-(DESKTOP|MOVIL)/.test(base)
}

/**
 * Clasifica un Formato crudo del ERP en una sección de página y detecta
 * si corresponde a una bonificación. El nombrado del ERP ya codifica
 * dispositivo + zona (ej. "PORTAL-DESKTOP-INTERIOR-C"), así que la
 * clasificación es por prefijo, no por catálogo fijo — funciona igual
 * para los tres portales sin mantener listas por sitio.
 */
export function classifyFormato(formatoRaw) {
  const f = String(formatoRaw).toUpperCase().trim()
  const isBonus = f.startsWith('BONIFICACION')
  const base = isBonus ? f.replace(/^BONIFICACION\s+/, '') : f

  // PORTAL-DESKTOP-* / PORTAL-MOVIL-* (posiciones A-E, Big/Full Skyscraper)
  // son del diseño previo de los sitios y ya no se muestran en la interfaz.
  let section = null
  if (/^PORTAL-(DESKTOP|MOVIL)/.test(base)) section = null
  else if (base.includes('INTERSTICIAL')) section = 'intersticial'
  else if (base.startsWith('NEWSLETTER') || base.startsWith('PORTAL-NEWSLETTER')) section = 'newsletter'
  else if (base.includes('CONTENIDO AUSPICIADO')) section = 'especiales'
  else if (base.includes('MOVIL-HOME')) section = 'movil-home'
  else if (base.includes('MOVIL-INTERIOR')) section = 'movil-interior'
  else if (base.includes('DESKTOP-HOME')) section = 'desktop-home'
  else if (base.includes('DESKTOP-INTERIOR')) section = 'desktop-interior'

  return { section, isBonus }
}

export function isContenidoAuspiciado(formatoRaw) {
  return String(formatoRaw).toUpperCase().includes('CONTENIDO AUSPICIADO')
}

// Medidas reales tomadas del media kit (px). Solo se declaran las que están
// confirmadas — todo lo demás se muestra sin badge de medida en vez de
// arriesgar un número inventado.
const DIMENSION_RULES = [
  [/LIDER\s?BOARD.*\bMH\b|LIDERBOARD-MH|LIDER\s?BOARD-MI/, { w: 350, h: 50 }],
  [/LIDER\s?BOARD|LEADERBOARD/, { w: 700, h: 70 }],
  [/TOP MEDIUM RECTANGLE|TOP MED/, { w: 258, h: 215 }],
  [/BIG RECTANGLE/, { w: 258, h: 500 }],
  [/BIG SKYSCRAPER/, { w: 300, h: 600 }],
  [/FULL SKYSCRAPER/, { w: 120, h: 600 }],
  [/SKYSCRAPER/, { w: 120, h: 600 }],
  [/SUPER BILLBOARD/, { w: 940, h: 250 }],
  [/\bBILLBOARD\b/, { w: 940, h: 170 }],
  [/MEDIUM RECTANGLE/, { w: 300, h: 250 }],
  [/FOOTER/, { w: 940, h: 170 }],
  [/\bNF1\b|\bNF2\b|\bNF\b/, { w: 750, h: 100 }],
  [/\bNK\d?\b/, { w: 750, h: 190 }],
  [/\bNL\d+\b/, { w: 300, h: 270 }],
]

const MOBILE_OVERRIDES = [
  [/FOOTER/, { w: 300, h: 100 }],
  [/MEDIUM RECTANGLE/, { w: 300, h: 250 }],
]

export function lookupDims(formatoRaw) {
  const f = String(formatoRaw).toUpperCase()
  const isMobile = f.includes('MOVIL')
  const rules = isMobile ? [...MOBILE_OVERRIDES, ...DIMENSION_RULES] : DIMENSION_RULES
  for (const [re, dims] of rules) {
    if (re.test(f)) return dims
  }
  return null
}

export function sectionMeta(sectionId) {
  return SECTIONS.find((s) => s.id === sectionId)
}
