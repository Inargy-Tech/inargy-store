import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-green mb-4">404</h1>
        <p className="text-lg text-muted mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors"
        >
          Back to Store
        </Link>
      </div>
    </div>
  )
}
