import React from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import fetcher from '../utils/fetcher'
import './AppCard.css'

export default function AppCard({ wordset }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: stats } = useSWR(
    `/api/stats/${wordset.id}`,
    fetcher,
    { revalidateOnMount: true }
  )
  const best = stats?.best ?? 0
  return (
    <div
      className="app-card"
      onClick={() =>
        navigate(
          wordset.id === 'dynamic-images'
            ? `/imagematch/${wordset.id}`
            : `/wordmatch/${wordset.id}`
        )
      }
    >
      <div className="app-card-title">
        {wordset.id === 'dynamic'
          ? t('allImages')
          : wordset.id === 'dynamic-images'
          ? t('imageMatch')
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