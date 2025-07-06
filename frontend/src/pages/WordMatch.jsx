import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useSWR, { mutate } from 'swr'
import fetcher, { API_BASE } from '../utils/fetcher'
import './WordMatch.css'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import neutralIcon from '../assets/feedback/neutral.png'

export default function WordMatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch, error } = useSWR(`/api/wordsets/${id}/next?size=5`, fetcher)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [feedback, setFeedback] = useState('neutral')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (selected !== null) {
      const timeout = setTimeout(() => {
        setFeedback('neutral')
        if (index + 1 >= (batch?.length || 0)) {
        fetch('/api/trials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordset_id: id, correct: score }),
          }).then(() => {
            mutate(`/api/stats/${id}`)
            navigate('/')
          })
        } else {
          setIndex(index + 1)
          setSelected(null)
        }
      }, 750)
      return () => clearTimeout(timeout)
    }
  }, [selected])

  if (error) return <div>Error loading questions</div>
  if (!batch) return <div>Loading...</div>

  const entry = batch[index]
  const handleSelect = (i) => {
    setSelected(i)
    if (i === entry.correct_index) {
      setScore((s) => s + 1)
      setFeedback('correct')
    } else {
      setErrors((e) => e + 1)
      setFeedback('wrong')
    }
  }

  return (
    <div className="wordmatch-container">
      <div className="error-counter">Errors: {errors}</div>
      <img
        src={
          feedback === 'correct'
            ? correctIcon
            : feedback === 'wrong'
            ? wrongIcon
            : neutralIcon
        }
        alt={feedback}
        className="feedback-image"
      />
      <img
        src={`${API_BASE}${entry.image_path}`}
        alt=""
        className="wordmatch-image"
      />
      <div className="wordmatch-choices">
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
            >
              {choice}
            </button>
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