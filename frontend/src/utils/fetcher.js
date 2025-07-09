// Base URL for API calls; dynamically determined for cross-device access
export const API_BASE = `http://${window.location.hostname}:8000`

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