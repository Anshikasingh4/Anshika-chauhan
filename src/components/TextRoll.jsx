export default function TextRoll({ children, className = '' }) {
  return (
    <span className={`text-roll ${className}`}>
      <span className="text-roll-inner">
        <span className="text-roll-item">{children}</span>
        <span className="text-roll-item" aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}
