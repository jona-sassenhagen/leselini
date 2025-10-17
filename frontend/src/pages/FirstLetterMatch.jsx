import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { generateFirstLetterBatch } from '../utils/gameData'
import { recordBestScore } from '../utils/bestScores'
import { assetUrl } from '../utils/assets'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import neutralIcon from '../assets/feedback/neutral.png'
import './FirstLetterMatch.css'

export default function FirstLetterMatch() {
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
  const [selected, setSelected] = useState(null)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [hasResponded, setHasResponded] = useState(false)

  useEffect(() => {
    try {
      const data = generateFirstLetterBatch(language)
      setBatch(data)
      setError(null)
      setIndex(0)
      setScore(0)
      setErrors(0)
      setFeedback('neutral')
      setSelected(null)
      setShowContinueButton(false)
      setHasResponded(false)
    } catch (err) {
      console.error('Failed to generate first letter batch', err)
      setBatch(null)
      setError(err)
    }
  }, [id, language])

  if (error) return <div>{t('errorPreparingGame')}</div>
  if (!batch) return <div>{t('loading')}</div>
  if (!batch.length) return <div>{t('errorPreparingGame')}</div>

  const entry = batch[index]
  const handleSelect = (i) => {
    if (hasResponded) return
    setHasResponded(true)
    setSelected(i)
    if (i === entry.correct_index) {
      setScore((s) => s + 1)
      setFeedback('correct')
      setTimeout(() => {
        handleContinue(score + 1)
      }, 750)
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
    setHasResponded(false)
    if (index + 1 >= batch.length) {
      recordBestScore(id, finalScore)
      navigate('/')
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
      <img src={assetUrl(entry.image_path)} alt="" className="first-letter-match-image" />
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
              disabled={selected !== null}
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
