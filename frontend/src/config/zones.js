// Dentro de newsletter, el nombrado ya trae la letra de familia:
// PORTAL-NEWSLETTER-F (banner superior), -SPONSOR (logos junto al primer F),
// -K (banner de sección) y -L (rectángulos bajo cada sección K).
export function classifyNewsletterFamily(formatoRaw) {
  const f = formatoRaw.toUpperCase().replace(/^BONIFICACION\s+/, '').trim()
  if (f.endsWith('SPONSOR')) return 'sponsor'
  if (f.endsWith('-F')) return 'f'
  if (f.endsWith('-K')) return 'k'
  if (f.endsWith('-L')) return 'l'
  return 'other'
}
