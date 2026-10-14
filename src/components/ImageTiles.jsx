import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../data/site'
import useReducedMotion from '../hooks/useReducedMotion'
import SafeImage from './SafeImage'

// Silhouettes: Left Pill, Center Circle, Right Pill (matching Image 2 design)
const shapes = [
  'w-[clamp(80px,25vw,190px)] aspect-[1/1.6] md:w-[clamp(130px,14.5vw,210px)]',
  'w-[clamp(90px,29vw,240px)] aspect-square md:w-[clamp(155px,17.5vw,260px)]',
  'w-[clamp(80px,25vw,190px)] aspect-[1/1.6] md:w-[clamp(130px,14.5vw,210px)]',
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
      className="flex w-full max-w-full items-center justify-center gap-3 px-3 py-14 sm:gap-6 sm:px-6 md:gap-10 md:py-24 overflow-hidden"
    >
      {site.tiles.map((t, i) => (
        <div key={t.src} className="tile flex-shrink-0">
          <div className={`tile-wrapper group relative overflow-hidden transition-transform duration-700 ease-out hover:rotate-[1.5deg] ${shapes[i]}`}>
            <div className="tile-img absolute -inset-y-[8%] inset-x-0">
              <SafeImage
                src={t.src}
                alt={t.alt}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
