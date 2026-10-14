import { useEffect, useState, useCallback } from 'react'
import { ScrollTrigger } from './lib/gsap'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Introduction from './components/Introduction'
import ImageTiles from './components/ImageTiles'
import Projects from './components/Projects'
import About from './components/About'
import Footer from './components/Footer'

export default function App() {
  const [revealed, setRevealed] = useState(false) // loader starts opening
  const [done, setDone] = useState(false)         // loader is gone

  const onReveal = useCallback(() => setRevealed(true), [])
  const onComplete = useCallback(() => setDone(true), [])

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      {!done && <Preloader onReveal={onReveal} onComplete={onComplete} />}

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar ready={revealed} />
      <main id="main">
        <Hero ready={revealed} />
        <Introduction />
        <ImageTiles />
        <Projects />
        <About />
      </main>
      <Footer />
    </>
  )
}