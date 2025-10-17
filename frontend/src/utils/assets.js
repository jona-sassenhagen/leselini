export function assetUrl(relativePath) {
  if (!relativePath) return ''
  const cleaned = relativePath.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base}${cleaned}`
}
