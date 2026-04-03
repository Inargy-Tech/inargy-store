import { BrandMark } from '../../assets/logo'

const SIZES = { sm: 24, md: 36, lg: 48 }

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const px = SIZES[size] || SIZES.md
  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Loading">
      <BrandMark size={px} className="text-slate-green animate-breathe" />
    </div>
  )
}
