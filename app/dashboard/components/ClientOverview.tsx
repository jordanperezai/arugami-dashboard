'use client';

interface ClientOverviewProps {
  client: {
    business_name: string;
    ghl_location_id: string;
    status: string;
    created_at: string;
    brand_color?: string;
  };
  gridSetup: {
    id: string;
    label: string;
    done: boolean;
  }[];
}

// Helper
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ClientOverview({ client, gridSetup }: ClientOverviewProps) {
  const joinedDate = new Date(client.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const brandColor = client.brand_color || '#E63946';
  const totalSteps = gridSetup.length;
  const completedSteps = gridSetup.filter((step) => step.done).length;
  const percent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  const nextStep = gridSetup.find((step) => !step.done);

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(95,227,133,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)';
      }}
    >
      <style>{`
        @keyframes status-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.3), 0 0 12px rgba(34,197,94,0.4); }
        }
      `}</style>

      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 20,
        }}
      >
        Business Overview
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
            STATUS
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: client.status === 'active' ? '#22c55e' : '#ef4444',
                boxShadow: client.status === 'active'
                  ? '0 0 0 3px rgba(34,197,94,0.2)'
                  : '0 0 0 3px rgba(239,68,68,0.2)',
                animation: client.status === 'active' ? 'status-pulse 3s ease-in-out infinite' : 'none',
              }}
            />
            <p
              style={{
                fontSize: 15,
                color: '#0f172a',
                textTransform: 'capitalize',
                fontWeight: 600,
              }}
            >
              {client.status}
            </p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
            JOINED ARUGAMI
          </p>
          <p style={{ fontSize: 15, color: '#0f172a', fontWeight: 500 }}>{joinedDate}</p>
        </div>

        <div>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
            SETUP PROGRESS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: hexToRgba('#e5e7eb', 1),
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: hexToRgba(brandColor, 0.9),
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: '#0f172a',
                  fontWeight: 600,
                  minWidth: 72,
                  textAlign: 'right',
                }}
              >
                {completedSteps}/{totalSteps} · {percent}%
              </p>
            </div>
            <p
              style={{
                fontSize: 12,
                color: '#64748b',
              }}
            >
              {nextStep
                ? `Next: ${nextStep.label}`
                : 'All set! More features coming soon.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
