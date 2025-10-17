const STORAGE_KEY = 'leselini_best_scores_v1'

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readScores() {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.warn('[scores] Failed to parse stored best scores:', error)
    return {}
  }
}

function writeScores(scores) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch (error) {
    console.warn('[scores] Failed to persist best scores:', error)
  }
}

export function getBestScore(wordsetId) {
  const scores = readScores()
  return Number.isFinite(scores[wordsetId]) ? scores[wordsetId] : 0
}

export function getAllBestScores() {
  return readScores()
}

export function recordBestScore(wordsetId, score) {
  if (!Number.isFinite(score)) return
  const scores = readScores()
  if ((scores[wordsetId] ?? 0) >= score) return
  scores[wordsetId] = score
  writeScores(scores)
}
