// Dentro de newsletter, el nombrado ya trae la letra de familia:
// PORTAL-NEWSLETTER-F (banner superior), -SPONSOR (junto a la noticia principal),
// -K (banner entre noticias) y -L (rectángulos en la columna derecha).
export function classifyNewsletterFamily(formatoRaw) {
  const f = String(formatoRaw).toUpperCase().replace(/^BONIFICACION\s+/, '').trim()
  if (f.endsWith('SPONSOR')) return 'sponsor'
  if (f.endsWith('-F') || /\bNF\d*\b/.test(f)) return 'f'
  if (f.endsWith('-K') || /\bNK\d*\b/.test(f)) return 'k'
  if (f.endsWith('-L') || /\bNL\d*\b/.test(f)) return 'l'
  return 'other'
}
