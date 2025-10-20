import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import correctIcon from '../assets/feedback/correct.png'
import wrongIcon from '../assets/feedback/wrong.png'
import './VictoryScreen.css'

const ICONS = {
  correct: correctIcon,
  wrong: wrongIcon,
}

export default function VictoryScreen({ results, onContinue }) {
  const { t } = useTranslation()
  const { correctCount, total } = useMemo(() => {
    const totalCount = results?.length ?? 0
    const correctAnswers = results?.filter?.((entry) => entry === 'correct')?.length ?? 0
    return { correctCount: correctAnswers, total: totalCount }
  }, [results])

  return (
    <div className="victory-screen">
      <h2 className="victory-title">{t('victoryTitle')}</h2>
      <div className="victory-icons">
        {(results ?? []).map((result, index) => {
          const icon = ICONS[result] ?? wrongIcon
          const altLabel = result === 'correct' ? t('correct') : t('wrong')
          return (
            <img
              key={`${result}-${index}`}
              src={icon}
              alt={altLabel}
              className={`victory-icon ${result}`}
            />
          )
        })}
      </div>
      <p className="victory-summary">
        {t('victorySummary', { correct: correctCount, total })}
      </p>
      <button type="button" className="continue-button" onClick={onContinue}>
        {t('continue')}
      </button>
    </div>
  )
}
