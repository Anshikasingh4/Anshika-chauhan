import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import TextRoll from './TextRoll'

const links = [
  { label: 'Home', id: 'home' },
  { label: 'Work', id: 'work' },
  { label: 'About', id: 'about' },
  { label: 'Connect', id: 'connect' },
  
]

export default function Navbar({ ready = true }) {
  const headerRef = useRef(null)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Text reveal animation for navbar items when the site opens
  useEffect(() => {
    if (!ready || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.nav-reveal',
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.15,
        }
      )
    }, headerRef)
    return () => ctx.revert()
  }, [ready, reduced])

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-700 ease-out md:px-8 md:py-4 ${
        ready ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
      }`}
    >
      <a href="#home" aria-label={`${site.name} - home`} className="font-nav group text-lg font-bold leading-none">
        <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <span className="nav-reveal block">
            <TextRoll>{site.monogram}</TextRoll>
          </span>
        </span>
      </a>

      <p className="font-subheading group absolute left-1/2 hidden -translate-x-1/2 rounded-[50%] border border-ink px-6 py-1.5 text-[13px] sm:block">
        <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <span className="nav-reveal block">
            <TextRoll>{site.edition}</TextRoll>
          </span>
        </span>
      </p>

      <nav aria-label="Primary" className="font-nav hidden items-center gap-5 text-[13px] font-medium tracking-wide md:flex">
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            aria-current={active === l.id ? 'true' : undefined}
            className="link-underline group py-2"
          >
            <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <span className="nav-reveal block">
                <TextRoll>{l.label}</TextRoll>
              </span>
            </span>
          </a>
        ))}
        <a
          href={site.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-nav group rounded-[4px] bg-ink px-3.5 py-1.5 text-white "
        >
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span className="nav-reveal block">
              <TextRoll>Resume</TextRoll>
            </span>
          </span>
        </a>
      </nav>

      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="font-nav absolute inset-x-3 top-16 flex flex-col rounded-[22px] bg-bloom/95 p-4 shadow-[0_12px_40px_rgba(239,194,208,0.45)] md:hidden"
        >
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setOpen(false)}
              aria-current={active === l.id ? 'true' : undefined}
              className="group flex min-h-[48px] items-center text-xl font-medium"
            >
              <TextRoll>{l.label}</TextRoll>
            </a>
          ))}
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-2 flex min-h-[48px] items-center justify-center rounded-[10px] bg-ink font-medium text-white"
          >
            <TextRoll>Resume</TextRoll>
          </a>
        </nav>
      )}
    </header>
  )
}
