import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import MaskLines from './MaskLines'

export default function Footer() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const st = { trigger: ref.current, start: 'top 80%' }
      gsap.from('.mask-line', { yPercent: 110, duration: 1.1, ease: 'power3.out', stagger: 0.12, scrollTrigger: st })
      gsap.from('.footer-fade', { y: 20, opacity: 0, duration: 0.9, ease: 'power2.out', stagger: 0.1, delay: 0.3, scrollTrigger: st })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <footer id="connect" ref={ref} className="mt-8 rounded-t-[36px] bg-sakura px-5 pb-8 pt-20 md:px-8 md:pt-28">
      <MaskLines
        lines={['Let’s make something', 'worth remembering.']}
        className="heading-display text-[clamp(2rem,4.8vw,4.4rem)]"
      />

      <a
        href={`mailto:${site.email}`}
        className="footer-fade link-underline font-nav mt-8 inline-flex min-h-[44px] items-center text-[clamp(1.1rem,2vw,1.6rem)] font-medium"
      >
        {site.email}
      </a>

      <div className="footer-fade mt-20 flex flex-col gap-4 border-t border-ink/15 pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <ul className="font-nav flex flex-wrap gap-x-6 font-medium">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline flex min-h-[44px] items-center">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p>© 2026 {site.name}</p>
      </div>
    </footer>
  )
}
