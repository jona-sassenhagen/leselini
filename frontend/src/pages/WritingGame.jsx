import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { generateWritingGameBatch } from '../utils/gameData'
import { recordBestScore } from '../utils/bestScores'
import { assetUrl } from '../utils/assets'
import VictoryScreen from '../components/VictoryScreen'
import './WritingGame.css'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import neutralIcon from '../assets/feedback/neutral.png'

export default function WritingGame() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const language = useMemo(() => i18n.language?.split?.('-')?.[0] ?? 'de', [i18n.language])
  const [batch, setBatch] = useState(null)
  const [error, setError] = useState(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [feedback, setFeedback] = useState('neutral')
  const [hasResponded, setHasResponded] = useState(false)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [letterPositions, setLetterPositions] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    try {
      const data = generateWritingGameBatch(id, language)
      setBatch(data)
      setError(null)
      setIndex(0)
      setScore(0)
      setErrors(0)
      setFeedback('neutral')
      setHasResponded(false)
      setResults([])
      setIsComplete(false)
    } catch (err) {
      console.error('Failed to generate writing game batch', err)
      setBatch(null)
      setError(err)
    }
  }, [id, language])

  useEffect(() => {
    if (batch && batch.length > 0) {
      // Initialize letters with random positions
      const letters = batch[index].letters
      const positions = letters.map((letter, i) => ({
        letter,
        id: `${index}-${i}`,
        // Random horizontal position distributed across the container
        x: (i / letters.length) * 100 + (Math.random() - 0.5) * 10,
        // Random vertical offset for variability
        y: Math.random() * 40 - 20, // -20px to +20px
      }))
      setLetterPositions(positions)
    }
  }, [batch, index])

  const checkAnswer = (positions) => {
    // Sort by horizontal position (x coordinate) to get the order
    const sortedPositions = [...positions].sort((a, b) => a.x - b.x)
    const sortedLetters = sortedPositions.map(p => p.letter).join('')
    const correctWord = batch[index].correct_word

    if (sortedLetters === correctWord) {
      if (!hasResponded) {
        setHasResponded(true)
        const outcome = 'correct'
        setResults((prev) => [...prev, outcome])
        setScore((s) => s + 1)
        setFeedback('correct')
        setIsAnimating(true)

        // Animate letters to slots
        animateLettersToSlots(sortedPositions)

        // Continue after 5 seconds
        setTimeout(() => {
          handleContinue(score + 1)
        }, 5000)
      }
    }
  }

  const animateLettersToSlots = (sortedPositions) => {
    // Get the slot positions
    const slotContainer = document.querySelector('.letter-slots')
    const letterContainer = document.querySelector('.letter-container')

    if (!slotContainer || !letterContainer) return

    const slotRect = slotContainer.getBoundingClientRect()
    const containerRect = letterContainer.getBoundingClientRect()

    // Calculate target positions for each letter to align with slots
    const slots = slotContainer.querySelectorAll('.letter-slot')

    const newPositions = sortedPositions.map((pos, i) => {
      const slot = slots[i]
      if (!slot) return pos

      const slotRect = slot.getBoundingClientRect()

      // Calculate position relative to letter container
      const targetX = ((slotRect.left + slotRect.width / 2 - containerRect.left) / containerRect.width) * 100
      const targetY = slotRect.top + slotRect.height / 2 - containerRect.top - containerRect.height / 2

      return {
        ...pos,
        x: targetX,
        y: targetY,
      }
    })

    // Map back to original indices
    const finalPositions = letterPositions.map(originalPos => {
      const sortedIndex = sortedPositions.findIndex(sp => sp.id === originalPos.id)
      return newPositions[sortedIndex]
    })

    setLetterPositions(finalPositions)
  }

  const handleContinue = (nextScore) => {
    setFeedback('neutral')
    setHasResponded(false)
    setIsAnimating(false)
    if (index + 1 >= batch.length) {
      recordBestScore(id, nextScore)
      setIsComplete(true)
    } else {
      setIndex(index + 1)
    }
  }

  const handlePointerDown = (e, i) => {
    if (hasResponded) return

    const container = e.currentTarget.parentElement
    const rect = container.getBoundingClientRect()

    // Get client coordinates (works for both mouse and touch)
    const clientX = e.clientX
    const clientY = e.clientY

    // Calculate offset from pointer to current tile position
    const currentPos = letterPositions[i]
    const currentPixelX = (currentPos.x / 100) * rect.width + rect.left
    const currentPixelY = currentPos.y + rect.top + rect.height / 2

    const offsetX = clientX - currentPixelX
    const offsetY = clientY - currentPixelY

    setDraggedIndex(i)
    setDragOffset({ x: offsetX, y: offsetY })
    setIsDragging(true)

    // Set pointer capture for smooth dragging
    e.currentTarget.setPointerCapture(e.pointerId)

    e.preventDefault()
  }

  const handlePointerMove = (e) => {
    if (!isDragging || draggedIndex === null || hasResponded) return

    const container = document.querySelector('.letter-container')
    if (!container) return

    const rect = container.getBoundingClientRect()

    // Get client coordinates (works for both mouse and touch)
    const clientX = e.clientX
    const clientY = e.clientY

    // Calculate new position relative to container, accounting for offset
    const newX = ((clientX - dragOffset.x - rect.left) / rect.width) * 100
    const newY = clientY - dragOffset.y - rect.top - rect.height / 2

    // Update position
    const newPositions = letterPositions.map((pos, idx) =>
      idx === draggedIndex ? { ...pos, x: newX, y: newY } : pos
    )

    setLetterPositions(newPositions)
  }

  const handlePointerUp = (e) => {
    if (!isDragging || draggedIndex === null || hasResponded) return

    setIsDragging(false)
    setDraggedIndex(null)

    // Release pointer capture
    if (e.currentTarget && e.currentTarget.releasePointerCapture) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    // Check answer after drag
    checkAnswer(letterPositions)
  }

  if (error) return <div>{t('errorPreparingGame')}</div>
  if (!batch) return <div>{t('loading')}</div>
  if (!batch.length) return <div>{t('errorPreparingGame')}</div>
  if (isComplete) {
    return (
      <VictoryScreen
        results={results}
        onContinue={() => navigate('/')}
      />
    )
  }

  const entry = batch[index]
  const progress = ((index + (hasResponded ? 1 : 0)) / batch.length) * 100

  return (
    <div className="writing-game-container">
      <div className="error-counter">{t('errors')} {errors}</div>
      <img
        src={
          feedback === 'correct'
            ? correctIcon
            : feedback === 'wrong'
            ? wrongIcon
            : neutralIcon
        }
        alt={t(feedback)}
        className="feedback-image"
      />
      <img src={assetUrl(entry.image_path)} alt="" className="writing-game-image" />
      <div className="letter-container">
        {letterPositions.map((pos, i) => (
          <div
            key={pos.id}
            className={`letter-tile ${draggedIndex === i ? 'dragging' : ''} ${hasResponded ? 'disabled' : ''} ${isAnimating ? 'animating' : ''}`}
            onPointerDown={(e) => handlePointerDown(e, i)}
            onPointerMove={(e) => handlePointerMove(e)}
            onPointerUp={(e) => handlePointerUp(e)}
            onPointerCancel={(e) => handlePointerUp(e)}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}px`,
              zIndex: draggedIndex === i ? 1000 : 1,
            }}
          >
            {pos.letter}
          </div>
        ))}
      </div>
      <div className={`letter-slots ${isAnimating ? 'highlighted' : ''}`}>
        {batch[index].correct_word.split('').map((_, i) => (
          <div key={i} className="letter-slot"></div>
        ))}
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
