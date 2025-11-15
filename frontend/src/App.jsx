import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WordMatch from './pages/WordMatch'
import ImageMatch from './pages/ImageMatch'
import FirstLetterMatch from './pages/FirstLetterMatch'
import InverseFirstLetterMatch from './pages/InverseFirstLetterMatch'
import WordMatchHard from './pages/WordMatchHard'
import WritingGame from './pages/WritingGame' 

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wordmatch/:id" element={<WordMatch />} />
        <Route path="/wordmatch-hard/:id" element={<WordMatchHard />} />
        <Route path="/imagematch/:id" element={<ImageMatch />} />
        <Route path="/first-letter-match/:id" element={<FirstLetterMatch />} />
        <Route path="/inverse-first-letter-match/:id" element={<InverseFirstLetterMatch />} />
        <Route path="/writing-game/:id" element={<WritingGame />} />
      </Routes>
    </HashRouter>
  )
}
