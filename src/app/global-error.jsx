'use client'

export default function RootError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', background: '#F8FAF8', color: '#0A2E25', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#FED7D7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, fontSize: 28 }}>
            !
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#627062', marginBottom: 24, maxWidth: 400 }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '10px 24px', background: '#0A2E25', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 14 }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
