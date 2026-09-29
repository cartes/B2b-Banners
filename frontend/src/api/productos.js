const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export async function fetchProductos({ mode = 'mock', n = 1000 } = {}) {
  const url = new URL('/api/productos', API_BASE)
  url.searchParams.set('mode', mode)
  url.searchParams.set('n', String(n))

  const res = await fetch(url)
  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.error || `Error ${res.status} al consultar productos`)
  }

  return body
}
