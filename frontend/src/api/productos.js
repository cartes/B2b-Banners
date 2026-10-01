const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function fetchProductos({ mode, n = 1000 } = {}) {
  const params = new URLSearchParams()
  if (n) params.set('n', String(n))
  if (mode) params.set('mode', mode)

  const query = params.toString() ? `?${params.toString()}` : ''
  const endpoint = `/api/productos${query}`
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${endpoint}` : endpoint

  const res = await fetch(url)
  const body = await res.json()

  if (!res.ok) {
    throw new Error(body?.error || `Error ${res.status} al consultar productos`)
  }

  return body
}
