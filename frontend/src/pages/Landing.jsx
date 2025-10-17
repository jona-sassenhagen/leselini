import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getWordsetsWithStats } from '../utils/gameData'
import AppCard from '../components/AppCard'
import './Landing.css'

export default function Landing() {
  const [sets, setSets] = useState([])
  const [error, setError] = useState(null)
  const { t, i18n } = useTranslation()
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

  const currentLanguage = useMemo(() => i18n.language?.split?.('-')?.[0] ?? 'en', [i18n.language])

  const languages = useMemo(
    () => [
      { code: 'en', label: t('languageEnglish'), flag: '🇬🇧' },
      { code: 'de', label: t('languageGerman'), flag: '🇩🇪' },
    ],
    [t]
  )

  const content = useMemo(() => {
    if (error) return <div className="landing-empty">{t('errorLoadingWordSets')}</div>
    if (!sets.length) return <div className="landing-empty">{t('noImagesAvailable')}</div>
    return (
      <div className="landing-grid">
        {sets.map((item) => (
          <AppCard key={item.id} wordset={item} />
        ))}
      </div>
    )
  }, [error, sets, t])

  return (
    <div className="landing-page">
      <div className="landing-header">
        <span className="landing-language-label">{t('language')}:</span>
        <div className="landing-language-buttons">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`landing-language-button${currentLanguage === lang.code ? ' active' : ''}`}
              onClick={() => i18n.changeLanguage(lang.code)}
              title={lang.label}
              aria-label={lang.label}
            >
              <span className="landing-language-flag" aria-hidden="true">{lang.flag}</span>
              <span className="landing-language-text">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
      {content}
      <div className="landing-footer">
        <a
          className="landing-fork-link"
          href="https://github.com/jona-sassenhagen/leselini"
          target="_blank"
          rel="noreferrer"
        >
          {t('forkMessage')}
        </a>
      </div>
    </div>
  )
}
