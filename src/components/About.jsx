import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import MaskLines from './MaskLines'
import SafeImage from './SafeImage'
import SkillPills from './SkillPills'

export default function About() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.about-head .mask-line', {
        yPercent: 110, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })
      gsap.from('.about-panel', {
        y: 50, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 80%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="about" ref={ref} className="px-5 pb-24 pt-24 md:px-8 md:pt-36">
      <div className="about-head">
        <MaskLines lines={[site.about.heading]} className="heading-display text-[clamp(2rem,4.2vw,3.6rem)]" />
      </div>

      <div className="about-grid mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
        <div className="about-panel rounded-[22px] bg-sakura p-6 md:p-8">
          <SafeImage
            src={site.about.portrait}
            alt={`Portrait of ${site.name}`}
            label={site.monogram}
            className="mx-auto aspect-square w-[min(260px,70%)] rounded-[34px] object-cover"
          />
          <p className="mt-8 text-[clamp(0.9rem,1vw,1rem)] leading-relaxed">{site.about.text}</p>
        </div>
        <SkillPills />
      </div>
    </section>
  )
}
