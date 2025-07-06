import React from 'react'
import useSWR from 'swr'
import fetcher from '../utils/fetcher'
import AppCard from '../components/AppCard'
import './Landing.css'

export default function Landing() {
  const { data: sets, error } = useSWR('/api/wordsets', fetcher)
  if (error) return <div>Error loading word sets</div>
  if (!sets) return <div>Loading...</div>
  return (
    <div className="landing-grid">
      {sets.map((item) => (
        <AppCard key={item.id} wordset={item} />
      ))}
    </div>
  )
}