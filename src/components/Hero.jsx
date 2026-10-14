import { useEffect, useLayoutEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import CherryBlossomScene from './CherryBlossomScene'
import PetalField from './PetalField'
import TextRoll from './TextRoll'

export default function Hero({ ready = true }) {
  const ref = useRef(null)
  const tlRef = useRef(null)
  const reduced = useReducedMotion()

  // Build the entrance timeline paused; it plays when the preloader starts opening.
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.from('.hero-tree', { opacity: 0, scale: 1.04, duration: 2, transformOrigin: '10% 50%' }, 0)
        .from('.hero-title-line', { yPercent: 110, duration: 1.2 }, 0.9)
        .from('.hero-rule', { scaleX: 0, transformOrigin: 'left center', duration: 1 }, 1.4)
        .from('.hero-cta', { opacity: 0, scale: 0.94, duration: 0.6, ease: 'power2.out' }, 1.7)
        .from('.hero-cta-reveal', { yPercent: 120, duration: 0.9, ease: 'power3.out' }, 1.75)
        .from('.hero-jp span', { y: -24, opacity: 0, stagger: 0.2, duration: 1 }, 2)
        .from('.hero-scroll', { opacity: 0, duration: 1 }, 2.3)
      tlRef.current = tl

      gsap.to('.hero-tree-parallax', {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  useEffect(() => {
    if (ready) tlRef.current?.play()
  }, [ready])

  return (
    <section id="home" ref={ref} className="hero-bg relative h-[100svh] min-h-[620px] overflow-hidden">
      {/* hero artwork, animated by the wind shader */}
      <div className="hero-tree-parallax absolute inset-x-0 -top-[6%] h-[112%]">
        <div className="hero-tree absolute inset-0">
          <CherryBlossomScene />
        </div>
      </div>

      {/* petals behind the text */}
      <PetalField layer="back" count={40} className="z-[1]" />

      {/* text */}
      <div className="relative z-[2] flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-[clamp(2.35rem,5.5vw,5rem)] font-medium leading-[1.05] tracking-tight">
          <span className="block overflow-hidden pb-[0.12em]">
            <span className="hero-title-line block">{site.hero.title}</span>
          </span>
        </h1>
        <div className="hero-rule mt-1 h-px w-[min(42vw,400px)] bg-ink" />
        <p className="hero-sub font-subheading mt-5 max-w-[36ch] text-[clamp(1.1rem,1.65vw,1.35rem)] leading-snug text-muted md:max-w-[44ch]">
          {site.hero.subtitle}
        </p>
        <a
          href="#work"
          className="hero-cta group font-nav mt-6 inline-flex min-h-[44px] items-center rounded-[4px] bg-ink px-6 text-[13px] font-medium text-white"
        >
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span className="hero-cta-reveal block">
              <TextRoll>{site.hero.cta}</TextRoll>
            </span>
          </span>
        </a>
      </div>

      {/* vertical Japanese text */}
      <p
        aria-hidden="true"
        className="hero-jp absolute right-5 top-1/2 z-[2] flex -translate-y-1/2 flex-col text-[clamp(1.2rem,1.8vw,1.6rem)] leading-tight md:right-10"
      >
        {site.hero.jp.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </p>

      {/* scroll hint */}
      <a
        href="#intro"
        className="hero-scroll group font-nav absolute bottom-5 right-5 z-[2] flex min-h-[44px] items-center gap-1 text-[12px] font-medium md:right-8"
      >
        <TextRoll>Scroll</TextRoll> <ChevronDown size={14} aria-hidden="true" />
      </a>

      {/* petals in front of the text */}
      <PetalField layer="front" count={8} className="z-[3]" />

      {/* soft hand-off into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-b from-transparent to-page" />
    </section>
  )
}