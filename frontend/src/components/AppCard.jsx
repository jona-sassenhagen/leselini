import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import './AppCard.css'

export default function AppCard({ wordset }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const best = wordset.best ?? 0

  return (
    <div
      className="app-card"
      onClick={() =>
        navigate(
          wordset.id.startsWith('dynamic-images')
            ? `/imagematch/${wordset.id}`
            : `/wordmatch/${wordset.id}`
        )
      }
    >
      <div className="app-card-title">
        {wordset.id === 'dynamic'
          ? t('allImages')
          : wordset.id === 'dynamic-easy'
          ? t('allImagesEasy')
          : wordset.id === 'dynamic-images'
          ? t('imageMatch')
          : wordset.id === 'dynamic-images-easy'
          ? t('imageMatchEasy')
          : wordset.title}
      </div>
      <div className="app-card-stats">{best}/5</div>
      <div className="streak-dots">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`streak-dot${i < best ? ' filled' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
