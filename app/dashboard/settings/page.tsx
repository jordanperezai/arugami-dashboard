import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowLeft, User, Bell, Plug, FileText, CreditCard } from 'lucide-react';

async function getClientData() {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: clientUsers } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .limit(1);

    if (!clientUsers?.[0]) return null;

    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientUsers[0].client_id)
      .limit(1);

    return clients?.[0] || null;
  } catch {
    return null;
  }
}

const SETTINGS_SECTIONS = [
  {
    id: 'profile',
    name: 'Profile',
    description: 'Your business information and brand settings',
    icon: User,
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Email and alert preferences',
    icon: Bell,
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect and manage your tools',
    icon: Plug,
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Weekly report settings and history',
    icon: FileText,
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Plan, invoices, and payment methods',
    icon: CreditCard,
  },
];

export default async function SettingsPage() {
  const client = await getClientData();

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fafafa',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#64748b',
              textDecoration: 'none',
              marginBottom: '1rem',
              padding: '6px 10px',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#64748b',
              margin: '0.5rem 0 0',
            }}
          >
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {SETTINGS_SECTIONS.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={20} style={{ color: '#64748b' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#0f172a',
                      display: 'block',
                    }}
                  >
                    {section.name}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: '#94a3b8',
                      display: 'block',
                      marginTop: 2,
                    }}
                  >
                    {section.description}
                  </span>
                </div>
                <ArrowLeft
                  size={16}
                  style={{
                    color: '#cbd5e1',
                    transform: 'rotate(180deg)',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: '#94a3b8',
              margin: 0,
            }}
          >
            {client?.business_name || 'Your Business'} • Part of the arugami grid
          </p>
        </div>
      </div>
    </main>
  );
}
