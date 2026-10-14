// Each line sits in an overflow-hidden mask; animate `.mask-line` with yPercent to reveal.
export default function MaskLines({ lines, as: Tag = 'h2', className = '' }) {
  return (
    <Tag className={className}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <span className="mask-line block">{line}</span>
        </span>
      ))}
    </Tag>
  )
}
