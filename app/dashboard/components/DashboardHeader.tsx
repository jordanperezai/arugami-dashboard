'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

interface DashboardHeaderProps {
  client: {
    business_name: string;
    slug: string;
    billing_tier: string;
    mrr_cents: number;
    brand_color?: string;
    logo_url?: string;
  };
  summaryLine?: string;
  gridHealthy?: boolean;
  lastUpdated?: string;
  storyBeat?: string;
  storyBeatType?: 'news' | 'milestone';
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHeader({ client, summaryLine, gridHealthy = true, lastUpdated, storyBeat, storyBeatType = 'news' }: DashboardHeaderProps) {
  const router = useRouter();
  const greeting = getGreeting();

  const timestamp = lastUpdated || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signOut();
    router.push('/login');
  };

  const displayStoryBeat = storyBeat
    ? storyBeat.replace(/^\s*Milestone:\s*/i, '').trim()
    : undefined;

  return (
    <section
      className="header-container"
      style={{
        borderTop: `2px solid ${BRAND.teal}`,
      }}
    >
      {/* Left: Client as HERO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Logo with teal ring */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: BRAND.gridCharcoal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${BRAND.teal}30`,
            padding: 8,
            minWidth: 72,
            position: 'relative',
          }}
        >
          {client.logo_url ? (
            <Image
              src={client.logo_url}
              alt={client.business_name}
              width={56}
              height={56}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <span style={{
              fontSize: 22,
              fontWeight: 800,
              color: client.brand_color || BRAND.teal,
              letterSpacing: '-0.02em',
              userSelect: 'none',
            }}>
              {client.business_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          )}
          {/* Active indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: gridHealthy ? BRAND.teal : BRAND.amber,
              border: `2px solid ${BRAND.utilitySlate}`,
              boxShadow: gridHealthy ? `0 0 10px ${BRAND.teal}60` : 'none',
            }}
          />
        </div>
        <div>
          <p
            style={{
              fontSize: 12,
              color: BRAND.concrete,
              margin: 0,
              marginBottom: 2,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {greeting},
          </p>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {client.business_name}
          </h1>
          {/* Tagline: Connected to the Grid */}
          <p
            style={{
              fontSize: 13,
              color: gridHealthy ? BRAND.teal : BRAND.amber,
              margin: 0,
              marginTop: 4,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: gridHealthy ? BRAND.teal : BRAND.amber,
                boxShadow: gridHealthy ? `0 0 10px ${BRAND.teal}60` : 'none',
                animation: gridHealthy ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
            {gridHealthy ? 'Connected to the Grid' : 'Needs attention'}
          </p>

          {displayStoryBeat && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: BRAND.gridCharcoal,
                borderRadius: 8,
                marginTop: 10,
                border: `1px solid ${BRAND.teal}30`,
              }}
            >
              <Sparkles size={14} color={BRAND.amber} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{displayStoryBeat}</span>
            </div>
          )}

          {summaryLine && !displayStoryBeat && (
            <p
              style={{
                fontSize: 13,
                color: BRAND.concrete,
                marginTop: 6,
                fontWeight: 500,
                maxWidth: 640,
                lineHeight: 1.4,
              }}
            >
              {summaryLine}
            </p>
          )}
        </div>
      </div>

      {/* Right: Plan + arugami signature */}
      <div className="header-right">

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.concrete, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Last updated
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>
            {timestamp}
          </span>
        </div>

        <div style={{ width: 1, height: 32, background: `${BRAND.concrete}30` }} className="desktop-only" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: BRAND.concrete, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Your Plan
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', textTransform: 'capitalize' }}>
            {client.billing_tier || 'Starter'}
          </span>
        </div>

        <div style={{ width: 1, height: 32, background: `${BRAND.concrete}30` }} className="desktop-only" />

        {/* arugami Grid signature */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2
          }}
        >
          <p
            style={{
              fontSize: 9,
              color: BRAND.concrete,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Part of the
          </p>
          <p
            style={{
              fontSize: 11,
              color: BRAND.amber,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', system-ui, sans-serif",
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: BRAND.amber,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            arugami grid
          </p>
        </div>

        {/* Settings button */}
        <Link
          href="/dashboard/settings"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.concrete,
            background: 'transparent',
            border: `1px solid ${BRAND.concrete}30`,
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = BRAND.gridCharcoal;
            e.currentTarget.style.borderColor = BRAND.teal;
            e.currentTarget.style.color = BRAND.teal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = `${BRAND.concrete}30`;
            e.currentTarget.style.color = BRAND.concrete;
          }}
        >
          <Settings size={16} />
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            fontSize: 13,
            fontWeight: 600,
            color: BRAND.concrete,
            background: 'transparent',
            border: `1px solid ${BRAND.concrete}30`,
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = BRAND.gridCharcoal;
            e.currentTarget.style.borderColor = BRAND.teal;
            e.currentTarget.style.color = BRAND.teal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = `${BRAND.concrete}30`;
            e.currentTarget.style.color = BRAND.concrete;
          }}
        >
          Sign Out
        </button>
      </div>
    </section>
  );
}
