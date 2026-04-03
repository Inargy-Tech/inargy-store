import { formatNaira } from '../../config'

export default function NairaPrice({
  kobo,
  className = '',
  size = 'md',
  showInstallment = false,
  months = 12,
}) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  return (
    <div className={className}>
      <span className={`font-bold text-slate-green ${sizes[size]}`}>
        {formatNaira(kobo)}
      </span>
      {showInstallment && (
        <span className="block text-xs text-muted mt-0.5">
          or {formatNaira(Math.ceil(kobo / months))}/mo for {months} months
        </span>
      )}
    </div>
  )
}
