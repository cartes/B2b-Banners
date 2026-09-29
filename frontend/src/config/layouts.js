// Posiciones de aviso de cada página tal como están publicadas hoy en
// mch.cl, aqua.cl y revistaei.cl. Los tres sitios comparten tema y slots
// de Google Ad Manager (MHSB1/AHSB1/EHSB1, etc.), así que la plantilla es
// una sola; las medidas son las declaradas en cada defineSlot().
//
// Cada posición se cruza con el par Formato+Ubicación del ERP. Una
// posición que nunca aparece en el histórico se muestra igual (disponible):
// existe en el sitio aunque no se haya vendido.

function pos(formato, ubicacion, w, h, label) {
  return { formato, ubicacion: String(ubicacion), dims: { w, h }, label }
}

function numbered(count, fn) {
  return Object.fromEntries(Array.from({ length: count }, (_, i) => fn(i + 1)))
}

// Los skyscrapers son las mismas unidades en home e interior (el sitio
// muestra MSKH* en ambas páginas y el ERP solo vende DESKTOP-HOME-SKYSCRAPER).
const SKYSCRAPERS = {
  skyIS: pos('DESKTOP-HOME-SKYSCRAPER', 'Izquierda Superior', 120, 600, 'Skyscraper izq. superior'),
  skyII: pos('DESKTOP-HOME-SKYSCRAPER', 'Izquierda Inferior', 120, 600, 'Skyscraper izq. inferior'),
  skyDS: pos('DESKTOP-HOME-SKYSCRAPER', 'Derecha Superior', 120, 600, 'Skyscraper der. superior'),
  skyDI: pos('DESKTOP-HOME-SKYSCRAPER', 'Derecha Inferior', 120, 600, 'Skyscraper der. inferior'),
}

export function pagePositions(portal) {
  const { footer, interiorLeaderboard: ilb } = portal.sizes

  return {
    'desktop-home': {
      lb: pos('DESKTOP-HOME-LIDER BOARD', 1, 700, 70, 'Leaderboard'),
      ...SKYSCRAPERS,
      ...numbered(4, (n) => [`sb${n}`, pos('DESKTOP-HOME-SUPER BILLBOARD', n, 940, 250, `Super Billboard ${n}`)]),
      ...numbered(2, (n) => [`b${n}`, pos('DESKTOP-HOME-BILLBOARD', n, 940, 170, `Billboard ${n}`)]),
      ...numbered(5, (n) => [`mr${n}`, pos('DESKTOP-HOME-MEDIUM RECTANGLE', n, 228, 280, `Medium Rectangle ${n}`)]),
      footer: pos('DESKTOP-HOME-FOOTER', 1, footer.w, footer.h, 'Footer flotante'),
    },
    'desktop-interior': {
      lb: pos('DESKTOP-INTERIOR-LIDER BOARD', 1, ilb.w, ilb.h, 'Leaderboard'),
      ...SKYSCRAPERS,
      tmr: pos('DESKTOP-INTERIOR-TOP MEDIUM RECTANGLE', 1, 258, 215, 'Top Medium Rectangle'),
      br: pos('DESKTOP-INTERIOR-BIG RECTANGLE', 1, 258, 500, 'Big Rectangle'),
      ...numbered(2, (n) => [`mr${n}`, pos('DESKTOP-INTERIOR-MEDIUM RECTANGLE', n, 228, 280, `Medium Rectangle ${n}`)]),
      sb1: pos('DESKTOP-INTERIOR-SUPER BILLBOARD', 1, 940, 250, 'Super Billboard'),
      footer: pos('DESKTOP-INTERIOR-FOOTER', 1, footer.w, footer.h, 'Footer flotante'),
    },
    'movil-home': {
      lb: pos('MOVIL-HOME-LIDER BOARD', 1, 350, 50, 'Leaderboard'),
      ...numbered(5, (n) => [`mr${n}`, pos('MOVIL-HOME-MEDIUM RECTANGLE', n, 300, 250, `Medium Rectangle ${n}`)]),
      footer: pos('MOVIL-HOME-FOOTER', 1, 300, 100, 'Footer flotante'),
    },
    'movil-interior': {
      lb: pos('MOVIL-INTERIOR-LIDER BOARD', 1, 350, 50, 'Leaderboard'),
      ...numbered(3, (n) => [`mr${n}`, pos('MOVIL-INTERIOR-MEDIUM RECTANGLE', n, 300, 250, `Medium Rectangle ${n}`)]),
      footer: pos('MOVIL-INTERIOR-FOOTER', 1, 300, 100, 'Footer flotante'),
    },
  }
}

function norm(value) {
  return String(value).toUpperCase().replace(/\s+/g, ' ').trim()
}

// Clave de un aviso: el ERP no es consistente con mayúsculas en la
// ubicación ("Izquierda Superior" / "IZQUIERDA SUPERIOR"), así que se
// normaliza antes de comparar.
export function slotKey(formato, ubicacion) {
  return `${norm(formato)}|||${norm(ubicacion)}`
}
