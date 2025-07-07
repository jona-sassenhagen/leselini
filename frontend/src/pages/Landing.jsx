import React from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import fetcher from '../utils/fetcher'
import AppCard from '../components/AppCard'
import './Landing.css'

export default function Landing() {
  const { data: sets, error } = useSWR('/api/wordsets', fetcher)
  const { t } = useTranslation()
  if (error) return <div>{t('errorLoadingWordSets')}</div>
  if (!sets) return <div>{t('loading')}</div>
  console.log(sets)
  return (
    <div className="landing-grid">
      {sets.map((item) => (
        <AppCard key={item.id} wordset={item} />
      ))}
    </div>
  )
}