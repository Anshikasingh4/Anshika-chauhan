import { useEffect } from 'react'
import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'

// "Bloom": a single sakura flower opens petal by petal as the counter climbs, a thin ring
// draws around it, and the words change as the site comes together. At 100 the petals are
// blown away to the right (the same wind direction as the hero) while six pink slats lift
// away to reveal the page.
//
// Progress climbs to 90 over MIN_SECONDS, then waits for real readiness (fonts + hero image).
const HERO_SRC = '/images/hero.jpg'
const MIN_SECONDS = 3
const MAX_WAIT_MS = 6000 // never get stuck on a slow or failed asset

const WORDS = ['Sketching', 'Composing', 'Coding', 'Polishing', 'Ready']
const PETAL = 'M0 0 C -26 -14 -30 -52 -9 -74 L 0 -66 L 9 -74 C 30 -52 26 -14 0 0 Z'
const RING_R = 88
const RING_LEN = 2 * Math.PI * RING_R
const SLATS = 6
const SLAT_FROM = [249, 230, 234]
const SLAT_TO = [243, 207, 219]

const STAMENS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 2 ? 0.12 : -0.08)
  const r = 13 + ((i * 7) % 5) * 2.6
  return { x: Math.cos(a) * r, y: Math.sin(a) * r }
})

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = resolve
    img.src = src
  })

// onReveal: the slats start lifting (start the hero entrance now)
// onComplete: the loader is fully gone (unmount it)
export default function Preloader({ onReveal, onComplete }) {
  const rootRef = useRef(null)
  const numRef = useRef(null)
  const wordRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const petals = Array.from(root.querySelectorAll('.pl-petal'))
    const ring = root.querySelector('.pl-ring-fill')
    const stamens = root.querySelector('.pl-stamens')

    let cancelled = false
    let exit = null
    let climb = null
    let wordIdx = -1
    let exiting = false
    const counter = { value: 0 }

    const setWord = (idx) => {
      if (idx === wordIdx || !wordRef.current) return
      wordIdx = idx
      wordRef.current.textContent = WORDS[idx]
      if (!reduced) {
        gsap.fromTo(wordRef.current, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', overwrite: true })
      }
    }

    const draw = (time = 0) => {
      const v = counter.value
      const p = reduced ? 1 : v / 100
      const spin = reduced ? 0 : time * 5 + p * 30
      for (let i = 0; i < petals.length; i++) {
        const open = reduced ? 1 : easeOutCubic(clamp((p - i * 0.11) / 0.4))
        petals[i].setAttribute('transform', `rotate(${i * 72 + spin - (1 - open) * 60}) scale(${0.12 + 0.88 * open})`)
      }
      ring.style.strokeDashoffset = RING_LEN * (1 - p)
      const s = clamp((p - 0.5) / 0.3)
      if (!exiting) stamens.style.opacity = s
      stamens.setAttribute('transform', `scale(${0.6 + 0.4 * s})`)
      if (numRef.current) numRef.current.textContent = String(Math.round(v)).padStart(3, '0')
      setWord(v >= 100 ? 4 : Math.min(Math.floor(v / 25), 3))
    }

    gsap.ticker.add(draw)
    draw()

    const ready = Promise.race([
      Promise.all([document.fonts ? document.fonts.ready : null, loadImage(HERO_SRC)]),
      new Promise((r) => setTimeout(r, MAX_WAIT_MS)),
    ])

    const unlock = () => {
      html.style.overflow = prevOverflow
      ScrollTrigger.refresh()
      onComplete?.()
    }

    const finish = () => {
      if (cancelled) return
      if (reduced) {
        counter.value = 100
        draw()
        onReveal?.()
        exit = gsap.to(root, { opacity: 0, duration: 0.4, onComplete: unlock })
        return
      }

      exiting = true
      // petal flight paths, in the flower's own SVG units
      const flies = Array.from(root.querySelectorAll('.pl-fly'))
      const upp = 200 / root.querySelector('svg').getBoundingClientRect().width
      const vw = window.innerWidth
      const vh = window.innerHeight
      const dx = flies.map(() => gsap.utils.random(0.55, 1.1) * vw * upp)
      const dy = flies.map(() => gsap.utils.random(-0.25, 0.3) * vh * upp)
      const rot = flies.map(() => gsap.utils.random(120, 320))

      exit = gsap.timeline({ onComplete: unlock })
      exit
        .to(counter, { value: 100, duration: 0.5, ease: 'power1.out' })
        .to('.pl-line', { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.05 }, '+=0.45')
        .to('.pl-ring, .pl-stamens, .pl-stamens-base', { opacity: 0, duration: 0.4 }, '<')
        .to(
          flies,
          {
            x: (i) => dx[i], y: (i) => dy[i], rotation: (i) => rot[i],
            scale: 1.15, opacity: 0, duration: 1.4, ease: 'power2.in', stagger: 0.06,
          },
          '<0.1'
        )
        .add(() => onReveal?.(), '-=0.9')
        .to('.pl-slat', { yPercent: -100, duration: 1, ease: 'power4.inOut', stagger: 0.07 }, '<')
    }

    if (reduced) {
      ready.then(finish)
    } else {
      climb = gsap.to(counter, { value: 90, duration: MIN_SECONDS, ease: 'power2.out' })
      Promise.all([ready, climb.then()]).then(finish)
    }

    return () => {
      cancelled = true
      gsap.ticker.remove(draw)
      if (climb) climb.kill()
      if (exit) exit.kill()
      html.style.overflow = prevOverflow
    }
  }, [reduced, onReveal, onComplete])

  return (
    <div ref={rootRef} role="status" aria-live="polite" className="fixed inset-0 z-[100] overflow-hidden">
      <span className="sr-only">Loading {site.name}</span>

      {/* pink slats: they lift away at the end to reveal the page */}
      <div aria-hidden="true" className="absolute inset-0 flex">
        {Array.from({ length: SLATS }, (_, i) => (
          <div
            key={i}
            className="pl-slat h-full flex-1 will-change-transform"
            style={{
              background: `rgb(${mix(SLAT_FROM, SLAT_TO, i / (SLATS - 1))})`,
              marginRight: i < SLATS - 1 ? -1 : 0,
            }}
          />
        ))}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-ink">
        {/* the flower */}
        <svg
          viewBox="-100 -100 200 200"
          className="absolute left-1/2 top-[46%] w-[min(62vw,46vh,440px)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        >
          <defs>
            <linearGradient id="pl-petal-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-74">
              <stop offset="0" stopColor="#D9577F" />
              <stop offset="0.55" stopColor="#F2A9BF" />
              <stop offset="1" stopColor="#FBD9E2" />
            </linearGradient>
          </defs>

          <circle className="pl-ring" r={RING_R} fill="none" stroke="#111" strokeOpacity="0.12" strokeWidth="0.7" />
          <circle
            className="pl-ring pl-ring-fill"
            r={RING_R}
            fill="none"
            stroke="#111"
            strokeWidth="0.7"
            strokeDasharray={RING_LEN}
            strokeDashoffset={RING_LEN}
            transform="rotate(-90)"
          />

          <g className="pl-flower">
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} className="pl-fly">
                <g className="pl-petal">
                  <path d={PETAL} fill="url(#pl-petal-fill)" />
                  <path d="M0 -8 L0 -54" stroke="#B8436B" strokeOpacity="0.35" strokeWidth="0.6" fill="none" />
                </g>
              </g>
            ))}
            <circle r="6" fill="#C9507A" className="pl-stamens-base" />
            <g className="pl-stamens">
              {STAMENS.map((s, i) => (
                <g key={i}>
                  <line x1="0" y1="0" x2={s.x} y2={s.y} stroke="#8A2F52" strokeWidth="0.7" />
                  <circle cx={s.x} cy={s.y} r="1.6" fill="#3A1F29" />
                </g>
              ))}
            </g>
          </g>
        </svg>

        {/* right side text */}
        <p className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col text-[clamp(1.1rem,1.6vw,1.5rem)] leading-tight md:right-10">
          {site.hero.jp.map((c) => (
            <span key={c} className="overflow-hidden"><span className="pl-line block">{c}</span></span>
          ))}
        </p>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 md:px-8 md:pb-7">
          <span className="overflow-hidden pb-[0.05em]">
            <span className="pl-line flex items-baseline">
              <span ref={numRef} className="heading-display text-[clamp(5rem,17vw,14rem)] leading-[0.8] tabular-nums">000</span>
              <span className="heading-display ml-1 text-[clamp(1.4rem,3.4vw,3rem)] text-muted">%</span>
            </span>
          </span>
          <span className="overflow-hidden pb-2 text-[clamp(0.9rem,1.3vw,1.15rem)] text-muted">
            <span className="pl-line block"><span ref={wordRef} className="block">Sketching</span></span>
          </span>
        </div>
      </div>
    </div>
  )
}
