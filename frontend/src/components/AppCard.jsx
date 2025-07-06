import React from 'react'
import useSWR from 'swr'
import { useNavigate } from 'react-router-dom'
import fetcher from '../utils/fetcher'
import './AppCard.css'

export default function AppCard({ wordset }) {
  const navigate = useNavigate()
  const { data: stats } = useSWR(`/api/stats/${wordset.id}`, fetcher)
  const best = stats?.best ?? 0
  const total = stats?.total ?? 0

  const size = 50
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (best / 5) * circumference
  return (
    <div className="app-card" onClick={() => navigate(`/wordmatch/${wordset.id}`)}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4caf50"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="app-card-title">{wordset.title}</div>
      <div className="app-card-stats">{best}/5</div>
    </div>
  )
}