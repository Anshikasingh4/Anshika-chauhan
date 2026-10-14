import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import SafeImage from './SafeImage'

// Responsive silhouettes and aspect ratios tailored for both mobile and desktop screens
const shapes = [
  'w-[clamp(76px,25vw,170px)] h-[clamp(125px,38vw,270px)] rounded-[999px_999px_35px_35px/50px_50px_35px_35px] sm:rounded-[999px_999px_70px_70px/80px_80px_70px_70px] md:w-[clamp(140px,15vw,215px)] md:h-[clamp(220px,24vw,350px)] md:rounded-[60px]',
  'w-[clamp(88px,30vw,220px)] h-[clamp(88px,30vw,220px)] rounded-[48%_52%_50%_50%/55%_48%_52%_45%] md:w-[clamp(170px,19vw,270px)] md:h-[clamp(170px,19vw,270px)]',
  'w-[clamp(76px,25vw,170px)] h-[clamp(125px,38vw,270px)] rounded-[26px] sm:rounded-[45px] md:w-[clamp(140px,15vw,215px)] md:h-[clamp(220px,24vw,350px)] md:rounded-[60px]',
]

export default function ImageTiles() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.tile', {
        y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      })
      gsap.utils.toArray('.tile-img').forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={ref}
      aria-label="Moodboard"
      className="flex w-full max-w-full items-center justify-center gap-2 px-2.5 py-12 sm:gap-4 sm:px-6 md:gap-10 md:py-28 overflow-hidden"
    >
      {site.tiles.map((t, i) => (
        <div key={t.src} className="tile flex-shrink-0">
          <div className={`group relative overflow-hidden transition-transform duration-700 ease-out hover:rotate-[1.5deg] ${shapes[i]}`}>
            <div className="tile-img absolute -inset-y-[8%] inset-x-0">
              <SafeImage
                src={t.src}
                alt={t.alt}
                className="h-full w-full object-cover "
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
