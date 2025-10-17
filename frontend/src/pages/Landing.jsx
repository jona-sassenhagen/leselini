import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getWordsetsWithStats } from '../utils/gameData'
import AppCard from '../components/AppCard'
import './Landing.css'

export default function Landing() {
  const [sets, setSets] = useState([])
  const [error, setError] = useState(null)
  const { t } = useTranslation()
  useEffect(() => {
    try {
      const data = getWordsetsWithStats()
      setSets(data)
      setError(null)
    } catch (err) {
      console.error('Failed to prepare word sets', err)
      setError(err)
    }
  }, [])

  if (error) return <div>{t('errorLoadingWordSets')}</div>
  if (!sets.length) return <div>{t('noImagesAvailable')}</div>
  return (
    <div className="landing-grid">
      {sets.map((item) => (
        <AppCard key={item.id} wordset={item} />
      ))}
    </div>
  )
}
