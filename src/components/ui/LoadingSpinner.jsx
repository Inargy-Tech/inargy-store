export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm'
    ? 'w-4 h-4 border-2'
    : size === 'lg'
    ? 'w-10 h-10 border-[3px]'
    : 'w-6 h-6 border-2'

  return (
    <div
      className={`${sizeClass} border-volt border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
