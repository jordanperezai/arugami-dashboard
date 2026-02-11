'use client';

import { Bot, Sparkles, Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface ComingSoonAutomationsProps {
  brandColor?: string;
}

// Agent capabilities - Lead with what they DO, character name is secondary flavor
const GRID_AGENTS = [
  {
    id: 'browser-monitor',
    capability: 'Browser Monitor',
    codename: 'The Lookout',
    icon: Bot,
    outcome: 'Watches your platforms and handles routine tasks automatically.',
    unlocked: false,
  },
  {
    id: 'content-creator',
    capability: 'Content Creator',
    codename: 'The Director',
    icon: Sparkles,
    outcome: 'Drafts on-brand content ready for your review.',
    unlocked: false,
  },
  {
    id: 'follow-up-agent',
    capability: 'Follow-Up Agent',
    codename: 'The Closer',
    icon: Mail,
    outcome: 'Catches every lead that doesn\'t reply the first time.',
    unlocked: false,
  },
  {
    id: 'review-monitor',
    capability: 'Review Monitor',
    codename: 'The Guardian',
    icon: MessageSquare,
    outcome: 'Spots issues before they become public problems.',
    unlocked: false,
  },
];

// Hero moments - Jobs-style: outcome, not mechanism (reduced to 2)
const WHATS_NEXT = [
  'Content drafts ready when you wake up',
  'Every lead followed up automatically',
];

export function ComingSoonAutomations({ brandColor }: ComingSoonAutomationsProps) {
  const accentColor = BRAND.teal;

  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${BRAND.gridCharcoal} 0%, ${BRAND.utilitySlate} 100%)`,
        borderRadius: 16,
        padding: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${BRAND.concrete}20`,
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${BRAND.teal}08 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: `${BRAND.teal}15`,
              borderRadius: 8,
              border: `1px solid ${BRAND.teal}30`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: accentColor,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color: accentColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Coming Soon
            </span>
          </div>

          {/* Progress indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              background: BRAND.gridCharcoal,
              borderRadius: 8,
              border: `1px solid ${BRAND.concrete}20`,
            }}
          >
            <span style={{ fontSize: 10, color: BRAND.concrete, fontWeight: 500 }}>
              AVAILABLE
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>
              0 of {GRID_AGENTS.length}
            </span>
          </div>
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}
        >
          Coming to Your Grid
        </h3>
        <p
          style={{
            margin: '0.35rem 0 0',
            fontSize: '0.8rem',
            color: BRAND.concrete,
            maxWidth: 360,
          }}
        >
          Upcoming automations we're building. They'll switch on here when ready.
        </p>
      </div>

      {/* Agent Cards - Capability first, codename as flavor */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.625rem',
          marginBottom: '1.25rem',
        }}
      >
        {GRID_AGENTS.map((agent) => {
          const IconComponent = agent.icon;
          const isLocked = !agent.unlocked;
          return (
            <div
              key={agent.id}
              style={{
                background: isLocked
                  ? BRAND.gridCharcoal
                  : `linear-gradient(135deg, ${BRAND.teal}15 0%, ${BRAND.teal}08 100%)`,
                borderRadius: 12,
                padding: '1rem',
                border: isLocked
                  ? `1px solid ${BRAND.concrete}15`
                  : `1px solid ${BRAND.teal}30`,
                transition: 'all 0.3s ease',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${BRAND.teal}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isLocked
                  ? `${BRAND.concrete}15`
                  : `${BRAND.teal}30`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 9,
                    fontWeight: 600,
                    color: BRAND.concrete,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  SOON
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: isLocked
                      ? BRAND.utilitySlate
                      : `${BRAND.teal}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: isLocked
                      ? `1px solid ${BRAND.concrete}20`
                      : `1px solid ${BRAND.teal}30`,
                  }}
                >
                  <IconComponent
                    size={18}
                    style={{
                      color: isLocked ? BRAND.concrete : accentColor,
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Capability headline (primary) */}
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isLocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.95)',
                      display: 'block',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {agent.capability}
                  </span>
                  {/* Codename (secondary flavor) */}
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: isLocked ? `${BRAND.concrete}80` : BRAND.concrete,
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      display: 'block',
                      marginTop: '0.1rem',
                    }}
                  >
                    Codename: {agent.codename}
                  </span>
                  {/* Outcome description */}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: isLocked ? `${BRAND.concrete}60` : BRAND.concrete,
                      display: 'block',
                      marginTop: '0.35rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {agent.outcome}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* What's Next - Simplified, outcome-focused */}
      <div
        style={{
          background: BRAND.gridCharcoal,
          borderRadius: 10,
          padding: '1rem',
          border: `1px solid ${BRAND.concrete}15`,
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: BRAND.concrete,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.625rem',
          }}
        >
          What's Next
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {WHATS_NEXT.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <ChevronRight
                size={10}
                style={{
                  color: BRAND.amber,
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.775rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.4,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle footer */}
      <p
        style={{
          margin: '1rem 0 0',
          fontSize: '0.7rem',
          color: `${BRAND.concrete}80`,
          textAlign: 'center',
        }}
      >
        More capabilities unlock as your grid grows.
      </p>
    </section>
  );
}
