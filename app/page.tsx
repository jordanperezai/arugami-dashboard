import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function fetchHealth() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await fetchHealth();

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header>
        <p style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#9ca3af' }}>
          arugami grid · client dashboard
        </p>
        <h1 style={{ fontSize: 28, margin: '0.25rem 0 0.5rem' }}>arugami Dashboard (MVP shell)</h1>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>
          This is a minimal shell wired to the same Supabase grid as ZORDON OS. We&apos;ll grow this into the
          client-facing experience.
        </p>
      </header>

      <section
        style={{
          borderRadius: 12,
          border: '1px solid rgba(148, 163, 184, 0.35)',
          padding: '1.25rem 1.5rem',
          background: 'radial-gradient(circle at top, rgba(56,189,248,0.08), transparent)',
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: '0.75rem' }}>Grid health</h2>
        {health ? (
          <>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>
              Status: <span style={{ color: '#22c55e' }}>{health.ok ? 'connected' : 'error'}</span>
            </p>
            {health.sampleClient && (
              <p style={{ fontSize: 13 }}>
                Sample client in grid: <strong>{health.sampleClient.business_name}</strong> (
                <code>{health.sampleClient.slug}</code>)
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading health from Supabase…</p>
        )}
      </section>

      <section style={{ fontSize: 13, color: '#9ca3af' }}>
        <p style={{ marginBottom: 12 }}>Quick links:</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, listStyle: 'disc' }}>
          <li style={{ marginBottom: 8 }}>
            <Link
              href="/dashboard"
              style={{
                color: '#38bdf8',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Open Client Dashboard →
            </Link>
          </li>
          <li>
            <code style={{ fontSize: 12 }}>apps/zordon-os</code> — internal ops (ZORDON)
          </li>
          <li>
            <code style={{ fontSize: 12 }}>apps/arugami-dashboard</code> — client-facing (this app)
          </li>
        </ul>
      </section>
    </main>
  );
}
