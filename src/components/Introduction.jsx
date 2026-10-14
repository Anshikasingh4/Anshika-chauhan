import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import MaskLines from './MaskLines'

export default function Introduction() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const st = { trigger: ref.current, start: 'top 75%' }
      gsap.from('.mask-line', { yPercent: 110, duration: 1.1, ease: 'power3.out', stagger: 0.12, scrollTrigger: st })
      gsap.from('.intro-p', { y: 24, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.3, scrollTrigger: st })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="intro" ref={ref} className="px-5 pt-16 md:px-8 md:pt-24">
      <MaskLines
        lines={site.intro.heading}
        className="heading-display text-[clamp(2rem,4.2vw,3.6rem)]"
      />
      <p className="intro-p mt-5 max-w-[46ch] text-[clamp(0.95rem,1.15vw,1.1rem)] leading-relaxed text-muted">
        {site.intro.body}
      </p>
    </section>
  )
}
