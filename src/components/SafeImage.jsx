import { useState } from 'react'

// Renders an image, or a soft pink fallback if the file is missing or fails to load.
export default function SafeImage({ src, alt, className = '', label = '' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex items-center justify-center bg-gradient-to-br from-sakura to-blush font-display text-3xl text-muted/70`}
      >
        {label}
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />
}
