import manifest from '../data/images-manifest.json'
import { getBestScore } from './bestScores'

const FALLBACK_SIZE = 5

function normalizeImages(rawImages) {
  if (!Array.isArray(rawImages)) return []
  return rawImages
    .map((item) => {
      const word = (item?.stem ?? '').trim()
      if (!word) return null
      const letter = word[0]?.toUpperCase()
      if (!letter) return null
      return {
        word,
        letter,
        path: item.path,
      }
    })
    .filter(Boolean)
}

const images = normalizeImages(manifest?.images)

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function sample(list, size) {
  if (size >= list.length) return shuffle(list)
  const copy = shuffle(list)
  return copy.slice(0, size)
}

function requireImages(count) {
  if (images.length < count) {
    throw new Error('notEnoughImages')
  }
}

const WORDSETS = [
  { id: 'first-letter-match', title: 'First Letter Match' },
  { id: 'dynamic-easy', title: 'All Images (Easy)' },
  { id: 'dynamic-images-easy', title: 'Image Match (Easy)' },
  { id: 'dynamic', title: 'All Images' },
  { id: 'dynamic-images', title: 'Image Match' },
  { id: 'inverse-first-letter-match', title: 'Inverse First Letter Match' },
  { id: 'dynamic-hard', title: 'All Images (Hard)' },
]

export function getWordsets() {
  return WORDSETS
}

export function getWordsetsWithStats() {
  return WORDSETS.map((wordset) => ({
    ...wordset,
    best: getBestScore(wordset.id),
  }))
}

export function generateWordMatchBatch(wordsetId, size = FALLBACK_SIZE) {
  requireImages(2)
  const pool = images
  const available = Math.min(size, pool.length)
  const selection = sample(pool, available)
  const distractorCount = wordsetId === 'dynamic-easy' ? 1 : 3

  return selection.map((entry) => {
    const distractorPool = pool.filter((item) => item.word !== entry.word)
    const choices = sample(distractorPool, Math.min(distractorCount, distractorPool.length))
      .map((item) => item.word)
      .concat(entry.word)
    const shuffled = shuffle(choices)
    return {
      id: entry.word,
      image_path: entry.path,
      choices: shuffled,
      correct_index: shuffled.indexOf(entry.word),
    }
  })
}

export function generateWordMatchHardBatch(size = FALLBACK_SIZE) {
  requireImages(3)
  const byLetter = images.reduce((acc, entry) => {
    if (!acc[entry.letter]) acc[entry.letter] = []
    acc[entry.letter].push(entry)
    return acc
  }, {})
  const eligibleLetters = Object.keys(byLetter).filter((letter) => byLetter[letter].length >= 3)
  if (!eligibleLetters.length) {
    throw new Error('notEnoughImagesForHard')
  }
  const batch = []
  for (let i = 0; i < size; i += 1) {
    const letter = eligibleLetters[Math.floor(Math.random() * eligibleLetters.length)]
    const wordsForLetter = byLetter[letter]
    if (wordsForLetter.length < 3) {
      // Skip if no longer eligible (e.g. duplicate removal)
      i -= 1
      continue
    }
    const [correct] = sample(wordsForLetter, 1)
    const distractors = sample(
      wordsForLetter.filter((item) => item.word !== correct.word),
      Math.min(2, wordsForLetter.length - 1)
    )
    const choiceWords = shuffle([...distractors.map((item) => item.word), correct.word])
    batch.push({
      id: correct.word,
      image_path: correct.path,
      choices: choiceWords,
      correct_index: choiceWords.indexOf(correct.word),
    })
  }
  return batch
}

export function generateImageMatchBatch(wordsetId, size = FALLBACK_SIZE) {
  requireImages(2)
  const pool = images
  const available = Math.min(size, pool.length)
  const selection = sample(pool, available)
  const distractorCount = wordsetId === 'dynamic-images-easy' ? 1 : 3

  return selection.map((entry) => {
    const distractorPool = pool.filter((item) => item.word !== entry.word)
    const distractors = sample(
      distractorPool,
      Math.min(distractorCount, distractorPool.length)
    )
    const filenames = [...distractors.map((item) => item.path), entry.path]
    const shuffled = shuffle(filenames)
    return {
      id: entry.word,
      word: entry.word,
      image_choices: shuffled,
      correct_index: shuffled.indexOf(entry.path),
    }
  })
}

export function generateFirstLetterBatch(size = FALLBACK_SIZE) {
  requireImages(1)
  const pool = images.filter((entry) => entry.word.length > 0)
  const available = Math.min(size, pool.length)
  const selection = sample(pool, available)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'.split('')

  return selection.map((entry) => {
    const correctLetter = entry.letter
    const distractors = sample(
      alphabet.filter((letter) => letter !== correctLetter),
      3
    )
    const options = shuffle([...distractors, correctLetter])
    return {
      id: entry.word,
      image_path: entry.path,
      choices: options,
      correct_index: options.indexOf(correctLetter),
    }
  })
}

export function generateInverseFirstLetterBatch(size = FALLBACK_SIZE) {
  requireImages(1)
  const pool = images.filter((entry) => entry.word.length > 0)
  const byLetter = pool.reduce((acc, entry) => {
    if (!acc[entry.letter]) acc[entry.letter] = []
    acc[entry.letter].push(entry)
    return acc
  }, {})
  const letters = Object.keys(byLetter)
  if (!letters.length) {
    throw new Error('notEnoughImages')
  }
  const batch = []
  for (let i = 0; i < size; i += 1) {
    const letter = letters[Math.floor(Math.random() * letters.length)]
    const options = byLetter[letter]
    const correct = sample(options, 1)[0]
    const distractorPool = pool.filter((entry) => entry.letter !== letter)
    const distractors = sample(distractorPool, Math.min(3, distractorPool.length))
    const choices = shuffle([...distractors.map((item) => item.path), correct.path])
    batch.push({
      id: letter,
      letter,
      image_choices: choices,
      correct_index: choices.indexOf(correct.path),
    })
  }
  return batch
}
