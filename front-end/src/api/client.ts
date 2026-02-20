/**
 * API client - fetch wrappers with error handling.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260/api'

const REQUEST_TIMEOUT_MS = 10_000

function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  )
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  let body: unknown
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }

  if (!res.ok) {
    let message = (body as { message?: string })?.message
    if (!message && body && typeof body === 'object') {
      const err = body as Record<string, string[]>
      const first = Object.values(err).flat().find(Boolean)
      if (first) message = first
    }
    const fallback = `Request failed (${res.status})`
    throw new Error(message ?? (typeof body === 'string' ? body : text || fallback))
  }

  return body as T
}

export function apiGet<T = unknown>(path: string): Promise<T> {
  return fetchWithTimeout(`${API_BASE_URL}${path}`).then(handleResponse<T>)
}

export function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  return fetchWithTimeout(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse<T>)
}
