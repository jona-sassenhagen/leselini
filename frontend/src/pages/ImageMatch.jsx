import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import fetcher, { API_BASE } from '../utils/fetcher'
import { useTranslation } from 'react-i18next'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import neutralIcon from '../assets/feedback/neutral.png'
import './ImageMatch.css'

export default function ImageMatch() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch, error } = useSWR(
    `/api/wordsets/${id}/next-images?size=5`,
    fetcher
  )
  const [index, setIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('neutral')

  useEffect(() => {
    if (selected !== null) {
      const timeout = setTimeout(() => {
        setFeedback('neutral')
        if (index + 1 >= (batch?.length || 0)) {
          navigate('/')
        } else {
          setIndex(index + 1)
          setSelected(null)
        }
      }, 750)
      return () => clearTimeout(timeout)
    }
  }, [selected])

  if (error) return <div>{t('errorLoadingQuestions')}</div>
  if (!batch) return <div>{t('loading')}</div>

  const entry = batch[index]
  const handleSelect = (i) => {
    setSelected(i)
    if (i === entry.correct_index) {
      setFeedback('correct')
    } else {
      setFeedback('wrong')
      setErrors((e) => e + 1)
    }
  }

  return (
    <div className="imagematch-container">
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
      <div className="imagematch-word">{entry.word}</div>
      <div className="imagematch-choices">
        {entry.image_choices.map((src, i) => {
          let className = 'imagematch-img'
          if (selected !== null) {
            className += i === entry.correct_index ? ' correct' : i === selected ? ' wrong' : ''
          }
          return (
            <img
              key={i}
              src={`${API_BASE}${src}`}
              alt=""
              className={className}
              onClick={() => handleSelect(i)}
            />
          )
        })}
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / batch.length) * 100}%` }}
        />
      </div>
    </div>
  )
}