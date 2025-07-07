import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WordMatch from './pages/WordMatch'
import ImageMatch from './pages/ImageMatch'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wordmatch/:id" element={<WordMatch />} />
        <Route path="/imagematch/:id" element={<ImageMatch />} />
      </Routes>
    </BrowserRouter>
  )
}