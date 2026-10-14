import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from '../lib/gsap'
import { projects } from '../data/projects'
import useReducedMotion from '../hooks/useReducedMotion'
import MaskLines from './MaskLines'
import SafeImage from './SafeImage'
import TextRoll from './TextRoll'

// Desktop: one wide block plus narrow blocks; hovering, focusing or tapping a block widens it.
// Mobile: a simple vertical stack, with details always visible (no hover needed).
export default function Projects() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.mask-line', {
        yPercent: 110, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      })
      gsap.from('.project-item', {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.project-row', start: 'top 85%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="work" ref={ref} className="px-5 pt-8 md:px-8">
      <MaskLines lines={['Made with Intent.']} className="heading-display text-[clamp(2rem,4.2vw,3.6rem)]" />

      <div className="project-row mt-8 flex flex-col gap-3 md:h-[clamp(420px,46vw,660px)] md:flex-row">
        {projects.map((p, i) => {
          const isActive = active === i
          return (
            <article
              key={p.id}
              tabIndex={0}
              aria-label={`${p.title}: ${p.kind}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ flexGrow: isActive ? 5 : 1 }}
              className="project-item group relative h-64 min-w-0 overflow-hidden rounded-[22px] bg-sakura transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.65,0,0.2,1)] md:h-auto md:basis-0"
            >
              <SafeImage
                src={p.image}
                alt={`${p.title} preview`}
                label={p.title.charAt(0)}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3a1f29]/70 via-[#3a1f29]/10 to-transparent" />

              {!isActive && (
                <p className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 rotate-180 font-heading text-lg font-medium text-white [writing-mode:vertical-rl] md:block">
                  {p.title}
                </p>
              )}

              <div
                className={`absolute inset-x-0 bottom-0 p-5 text-white transition-opacity duration-500 md:p-7 ${
                  isActive ? 'md:opacity-100 md:delay-300' : 'md:pointer-events-none md:opacity-0'
                }`}
              >
                <p className="font-subheading text-xs font-medium uppercase tracking-wider opacity-90">{p.kind}</p>
                <h3 className="mt-1 font-heading text-[clamp(1.3rem,2vw,1.9rem)] font-medium leading-tight">{p.title}</h3>
                <p className="mt-2 max-w-[34ch] text-sm leading-snug opacity-90">{p.description}</p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline group font-nav mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium"
                  >
                    <TextRoll>View project</TextRoll> <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
