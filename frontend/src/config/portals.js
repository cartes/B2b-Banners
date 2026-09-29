// Identidad visual de cada portal, tomada de los colores globales de
// Elementor publicados en cada sitio (--e-global-color-primary/secondary).
// Los tres usan el mismo tema y las mismas posiciones de aviso; lo que
// cambia es la marca, el menú y el orden de los banners del home.
export const PORTALS = [
  {
    id: 'mch',
    tipoProducto: 'WEB MINERIA CHILENA',
    name: 'Minería Chilena',
    logoText: 'mch',
    domain: 'mch.cl',
    tagline: 'Información minera desde 1980',
    accent: '#e00717',
    accentDark: '#b70015',
    accentSecondary: '#333333',
    accentSoft: '#fce4e5',
    accentInk: '#6b0009',
    nav: ['Actualidad Minera', 'Minería Superficie', 'Minería Subterránea', 'Designaciones', 'Proveedores', 'MCH'],
    // Banner de ancho completo que cierra cada bloque editorial del home.
    homeDividers: {
      destacadas: 'sb1',
      ultimo: 'b1',
      revista: 'sb2',
      eventos: 'b2',
      designaciones: 'sb3',
      columnas: 'sb4',
    },
    sizes: {
      footer: { w: 940, h: 166 },
      interiorLeaderboard: { w: 700, h: 70 },
    },
  },
  {
    id: 'aqua',
    tipoProducto: 'WEB AQUA',
    name: 'AQUA',
    logoText: 'AQUA',
    domain: 'aqua.cl',
    tagline: 'Acuicultura y pesca en Chile',
    accent: '#004a99',
    accentDark: '#003a7a',
    accentSecondary: '#3778a5',
    accentSoft: '#e1ecf7',
    accentInk: '#002a57',
    nav: ['Salmonicultura', 'Pesca', 'Acuicultura', 'Proveedores', 'Designaciones', 'AQUA'],
    homeDividers: {
      destacadas: 'sb1',
      ultimo: 'sb2',
      revista: 'sb3',
      eventos: 'sb4',
      designaciones: 'b1',
      columnas: 'b2',
    },
    sizes: {
      footer: { w: 940, h: 70 },
      interiorLeaderboard: { w: 940, h: 100 },
    },
  },
  {
    id: 'electrica',
    tipoProducto: 'WEB REVISTA ELECTRICA',
    name: 'Revista Electricidad',
    logoText: 'Electricidad',
    domain: 'revistaei.cl',
    tagline: 'El sector eléctrico chileno',
    accent: '#3e8dbf',
    accentDark: '#034aa6',
    accentSecondary: '#034aa6',
    accentSoft: '#e3f0f8',
    accentInk: '#02367a',
    nav: ['Transición energética', 'Redes y tecnología', 'Industria', 'Electromovilidad', 'Designaciones', 'Electricidad'],
    homeDividers: {
      destacadas: 'sb1',
      ultimo: 'b1',
      revista: 'sb2',
      eventos: 'b2',
      designaciones: 'sb3',
      columnas: 'sb4',
    },
    sizes: {
      footer: { w: 940, h: 166 },
      interiorLeaderboard: { w: 700, h: 70 },
    },
  },
]

export function getPortal(id) {
  return PORTALS.find((p) => p.id === id)
}

export function portalStyle(portal) {
  return {
    '--portal-accent': portal.accent,
    '--portal-accent-dark': portal.accentDark,
    '--portal-accent-secondary': portal.accentSecondary,
    '--portal-accent-soft': portal.accentSoft,
    '--portal-accent-ink': portal.accentInk,
  }
}
