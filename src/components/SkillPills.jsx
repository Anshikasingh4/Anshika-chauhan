import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { skills } from '../data/skills'
import useReducedMotion from '../hooks/useReducedMotion'

const pill = 'skill-pill rounded-full bg-sakura px-5 py-2 text-[13px] text-ink whitespace-nowrap'

export default function SkillPills() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.skill-pill', {
        opacity: 0, scale: 0.85, duration: 0.7, ease: 'power2.out', stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={ref} className="relative">
      <h3 className="heading-display text-center text-[clamp(2rem,3.2vw,3rem)] lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
        Skills
      </h3>

      {/* tablet and mobile: simple wrapping flow */}
      <ul className="mt-6 flex flex-wrap justify-center gap-2.5 lg:hidden">
        {skills.map((s) => <li key={s.name} className={pill}>{s.name}</li>)}
      </ul>

      {/* desktop: asymmetric composition. The outer li positions, the inner span is animated. */}
      <ul className="relative hidden h-[clamp(420px,36vw,560px)] lg:block">
        {skills.map((s) => (
          <li
            key={s.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span className={`${pill} block`}>{s.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
