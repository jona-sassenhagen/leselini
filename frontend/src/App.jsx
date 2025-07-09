import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WordMatch from './pages/WordMatch'
import ImageMatch from './pages/ImageMatch'
import FirstLetterMatch from './pages/FirstLetterMatch'
import InverseFirstLetterMatch from './pages/InverseFirstLetterMatch'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wordmatch/:id" element={<WordMatch />} />
        <Route path="/imagematch/:id" element={<ImageMatch />} />
        <Route path="/first-letter-match/:id" element={<FirstLetterMatch />} />
        <Route path="/inverse-first-letter-match/:id" element={<InverseFirstLetterMatch />} />
      </Routes>
    </BrowserRouter>
  )
}