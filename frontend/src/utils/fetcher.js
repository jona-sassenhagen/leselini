// Base URL for API calls; override with VITE_API_BASE_URL if set
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default async function fetcher(path) {
  const url = `${API_BASE}${path}`
  console.log(`Fetching: ${url}`)
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const errorText = await res.text()
      console.error(`Failed fetching ${url}: ${res.status} ${res.statusText} - ${errorText}`)
      throw new Error(`Failed fetching ${url}: ${res.statusText}`)
    }
    return res.json()
  } catch (error) {
    console.error(`Network error or other issue fetching ${url}: ${error}`)
    throw error
  }
}