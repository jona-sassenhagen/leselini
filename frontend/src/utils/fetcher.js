// Base URL for API calls; override with VITE_API_BASE_URL if set
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default async function fetcher(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`Failed fetching ${API_BASE}${path}: ${res.statusText}`)
  return res.json()
}