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
            : wordset.id === 'first-letter-match'
            ? `/first-letter-match/${wordset.id}`
            : wordset.id === 'inverse-first-letter-match'
            ? `/inverse-first-letter-match/${wordset.id}`
            : wordset.id === 'dynamic-hard'
            ? `/wordmatch-hard/${wordset.id}`
            : wordset.id.startsWith('writing-game-partial')
            ? `/partial-writing-game/${wordset.id}`
            : wordset.id.startsWith('writing-game-mostly')
            ? `/mostly-scrambled-writing-game/${wordset.id}`
            : wordset.id.startsWith('writing-game')
            ? `/writing-game/${wordset.id}`
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
          : wordset.id === 'first-letter-match'
          ? t('firstLetterMatch')
          : wordset.id === 'inverse-first-letter-match'
          ? t('inverseFirstLetterMatch')
          : wordset.id === 'dynamic-hard'
          ? t('allImagesHard')
          : wordset.id === 'writing-game-easy'
          ? t('writingGameEasy')
          : wordset.id === 'writing-game-hard'
          ? t('writingGameHard')
          : wordset.id === 'writing-game-partial-easy'
          ? t('writingGamePartialEasy')
          : wordset.id === 'writing-game-partial-hard'
          ? t('writingGamePartialHard')
          : wordset.id === 'writing-game-mostly-easy'
          ? t('writingGameMostlyEasy')
          : wordset.id === 'writing-game-mostly-hard'
          ? t('writingGameMostlyHard')
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
