/**
 * API client - prepared for future backend integration.
 * No real API calls in MVP; exports fetch wrappers.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export function apiGet<T = unknown>(path: string): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`).then((res) => res.json())
}

export function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json())
}
