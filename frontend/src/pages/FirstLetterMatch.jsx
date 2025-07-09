import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR, { mutate } from 'swr'
import fetcher, { API_BASE } from '../utils/fetcher'
import { useTranslation } from 'react-i18next'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import neutralIcon from '../assets/feedback/neutral.png'
import './FirstLetterMatch.css'

export default function FirstLetterMatch() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch, error } = useSWR(`/api/wordsets/${id}/first-letter?size=5`, fetcher)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [feedback, setFeedback] = useState('neutral')
  const [selected, setSelected] = useState(null)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [hasResponded, setHasResponded] = useState(false)

  useEffect(() => {
    // No automatic timeout here anymore
  }, [])

  if (error) return <div>{t('errorLoadingQuestions')}</div>
  if (!batch) return <div>{t('loading')}</div>

  const entry = batch[index]
  const handleSelect = (i) => {
    if (hasResponded) return; // Ignore clicks if already responded
    setHasResponded(true); // Mark as responded
    setSelected(i)
    if (i === entry.correct_index) {
      setScore((s) => s + 1)
      setFeedback('correct')
      // Automatically proceed for correct answers after a short delay
      setTimeout(() => {
        handleContinue(score + 1)
      }, 750) // Display feedback for 750ms
    } else {
      setErrors((e) => e + 1)
      setFeedback('wrong')
      setShowContinueButton(true)
    }
  }

  const handleContinue = (finalScore) => {
    setFeedback('neutral')
    setShowContinueButton(false)
    setSelected(null)
    setHasResponded(false) // Reset for next question
    if (index + 1 >= (batch?.length || 0)) {
      fetch(`${API_BASE}/api/trials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordset_id: id, correct: finalScore }),
      }).then(() => {
        mutate('/api/wordsets')
        navigate('/')
      })
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <div className="first-letter-match-container">
      <div className="error-counter">
        {t('errors')} {errors}
      </div>
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
      <img
        src={`${API_BASE}${entry.image_path}`}
        alt=""
        className="first-letter-match-image"
      />
      <div className="first-letter-match-choices">
        {entry.choices.map((choice, i) => {
          let className = 'choice-button'
          if (selected !== null) {
            if (i === entry.correct_index) className += ' correct'
            else if (i === selected) className += ' wrong'
          }
          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(i)}
              disabled={selected !== null} // Disable buttons after selection
            >
              {choice}
            </button>
          )
        })}
      </div>
      {showContinueButton && (
        <button className="continue-button" onClick={() => handleContinue(score)}>
          {t('continue')}
        </button>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${
              ((index + (selected !== null ? 1 : 0)) / batch.length) * 100
            }%`,
          }}
        />
      </div>
    </div>
  )
}