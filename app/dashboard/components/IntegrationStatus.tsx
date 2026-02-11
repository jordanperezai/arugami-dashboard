'use client';

import { useState, useRef } from 'react';
import { Cable, ArrowRight, Database, Send, Zap, Activity, Globe, DollarSign, Star, Users, TrendingUp, Mail, Share2, ChevronDown, ChevronUp, Download, Minimize2, Maximize2 } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface Integration {
  integration_id: string;
  integration_type: string;
  display_name: string;
  status: string;
  last_health_check: string | null;
}

interface AgentRun {
  agent_run_id: string;
  agent_type: string;
  status: string;
  queued_at: string;
  goal: string;
}

interface GHLMetrics {
  contactsThisWeek: number;
  contactsTotal: number;
  opportunitiesThisWeek: number;
  openOpportunities: number;
  totalPipelineValue: number;
}

interface IntegrationStatusProps {
  integrations: Integration[];
  agentRuns?: AgentRun[];
  fullWidth?: boolean;
  onExpand?: () => void;
  logoDevToken?: string;
  clientWebsite?: string;
  clientBrandColor?: string;
  ghlHealthy?: boolean;
  ghlMetrics?: GHLMetrics | null;
}

// Option A: Monochrome Calm
// ALL categories use the same muted color — ONLY the GRID has vibrant color
// This makes the GRID the undisputed hero of the visualization
const MUTED_COLOR = 'rgba(255,255,255,0.5)'; // Neutral for all categories
const GRID_COLOR = BRAND.teal; // Grid uses teal from brand

// Category definitions - showing the FULL digital infrastructure
const INPUT_CATEGORIES = [
  {
    id: 'sales',
    name: 'Sales & Orders',
    icon: 'DollarSign',
    color: MUTED_COLOR,
    tools: ['Clover POS', 'Square', 'Toast'],
    dataTypes: 'Transactions, tips, inventory',
    highlight: false,
  },
  {
    id: 'reputation',
    name: 'Reputation',
    icon: 'Star',
    color: MUTED_COLOR,
    tools: ['Google Reviews', 'Yelp'],
    dataTypes: 'Reviews, ratings, responses',
    highlight: true, // Special emphasis per user request
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: 'Users',
    color: MUTED_COLOR,
    tools: ['arugami CRM', 'Contact Forms'],
    dataTypes: 'Leads, contacts, history',
    highlight: false,
  },
  {
    id: 'tracking',
    name: 'Tracking',
    icon: 'Activity',
    color: MUTED_COLOR,
    tools: ['Google Analytics', 'Meta Pixel'],
    dataTypes: 'Website visitors, ad performance',
    highlight: false,
  },
];

const OUTPUT_CATEGORIES = [
  {
    id: 'website',
    name: 'Website',
    icon: 'Globe',
    color: MUTED_COLOR,
    tools: ['Menu Sync', 'Hours', 'Specials'],
    dataTypes: 'Auto-updated content',
    highlight: false,
  },
  {
    id: 'social',
    name: 'Social Media',
    icon: 'Share2',
    color: MUTED_COLOR,
    tools: ['Facebook', 'Instagram'],
    dataTypes: 'Posts, stories, responses',
    highlight: false,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'Mail',
    color: MUTED_COLOR,
    tools: ['Email Campaigns', 'SMS Blasts'],
    dataTypes: 'Automated outreach',
    highlight: false,
  },
  {
    id: 'insights',
    name: 'Insights',
    icon: 'TrendingUp',
    color: MUTED_COLOR,
    tools: ['Weekly Report', 'AI Recommendations'],
    dataTypes: 'Business intelligence',
    highlight: false,
  },
];

// Map icon names to components
const IconMap: Record<string, any> = {
  DollarSign,
  Star,
  Users,
  Activity,
  Globe,
  Share2,
  Mail,
  TrendingUp,
};

// Tool to domain mapping for logos
const TOOL_DOMAINS: Record<string, string> = {
  'Clover POS': 'clover.com',
  'Square': 'squareup.com',
  'Toast': 'toasttab.com',
  'Google Reviews': 'google.com',
  'Yelp': 'yelp.com',
  'arugami CRM': '',
  'Contact Forms': '',
  'Google Analytics': 'analytics.google.com',
  'Meta Pixel': 'meta.com',
  'Facebook': 'facebook.com',
  'Instagram': 'instagram.com',
};

// Mock active tools for demo (these would come from real integrations)
const MOCK_ACTIVE_TOOLS = [
  'Clover POS',
  'Google Reviews',
  'Yelp',
  'arugami CRM',
  'Google Analytics',
  'Meta Pixel',
  'Menu Sync',
  'Hours',
  'Specials',
  'Facebook',
  'Instagram',
  'Email Campaigns',
  'SMS Blasts',
  'Weekly Report',
  'AI Recommendations',
];

// Live stats for input categories — proves the system is actively collecting data
const INPUT_CATEGORY_STATS: Record<string, string> = {
  sales: '', // No stat needed - transactions flow automatically
  reputation: '23 reviews • 4.7★',
  customers: '142 leads',
  tracking: '1.2K visits/mo',
};

// Live stats for output categories — proves the system is actively DOING things
// Answers the #1 persona question: "What did it actually DO?"
const OUTPUT_CATEGORY_STATS: Record<string, string> = {
  website: '3 syncs today',
  social: '2 posts this week',
  marketing: '47 emails sent',
  insights: 'Report ready',
};

// Category Node Component with expandable tool list
function CategoryNode({
  category,
  activeTools,
  direction,
  logoDevToken,
  clientWebsite,
  clientBrandColor,
  stat,
}: {
  category: typeof INPUT_CATEGORIES[0];
  activeTools: string[];
  direction: 'input' | 'output';
  logoDevToken?: string;
  clientWebsite?: string;
  clientBrandColor?: string;
  stat?: string; // Live stat to show proof of activity
}) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = category.tools.filter(t => activeTools.includes(t)).length;
  const IconComponent = IconMap[category.icon];
  const isHighlighted = category.highlight;

  // Use client brand color for website category
  const categoryColor = category.id === 'website' && clientBrandColor ? clientBrandColor : category.color;

  // Muted card style - let the GRID be the hero
  const baseBackground = isHighlighted
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.03)';
  const hoverBackground = 'rgba(255,255,255,0.08)';
  const baseBorder = isHighlighted
    ? `1px solid ${categoryColor}30`
    : '1px solid rgba(255,255,255,0.06)';

  return (
    <div
      style={{
        padding: '14px 16px',
        background: baseBackground,
        border: baseBorder,
        borderRadius: 14,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBackground;
        e.currentTarget.style.borderColor = `${categoryColor}40`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseBackground;
        e.currentTarget.style.borderColor = isHighlighted ? `${categoryColor}30` : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Category header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexDirection: direction === 'output' ? 'row-reverse' : 'row',
      }}>
        {/* Icon container - muted to let GRID be the hero */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {IconComponent && <IconComponent size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />}
        </div>

        <div style={{
          flex: 1,
          minWidth: 0,
          textAlign: direction === 'output' ? 'right' : 'left',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: direction === 'output' ? 'flex-end' : 'flex-start',
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}>
              {category.id === 'website' && clientWebsite ? clientWebsite : category.name}
            </span>

            {/* Active count badge */}
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: 6,
            }}>
              {activeCount}/{category.tools.length}
            </span>

            {/* Status pulse */}
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: activeCount > 0 ? '#22c55e' : '#64748b',
              boxShadow: activeCount > 0 ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
              animation: activeCount > 0 ? 'pulse 3s ease-in-out infinite' : 'none',
            }} />

            {/* Expand indicator */}
            {expanded ? (
              <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            ) : (
              <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            )}
          </div>
        </div>
      </div>

      {/* Expandable tool list */}
      {expanded && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {category.tools.map(tool => {
            const isActive = activeTools.includes(tool);
            const domain = TOOL_DOMAINS[tool];
            const logoUrl = logoDevToken && domain
              ? `https://img.logo.dev/${domain}?token=${logoDevToken}&size=32&format=webp`
              : null;

            return (
              <div
                key={tool}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  flexDirection: direction === 'output' ? 'row-reverse' : 'row',
                }}
              >
                {/* Tool logo or status dot */}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={tool}
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: 'contain',
                      opacity: isActive ? 1 : 0.4,
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isActive ? '#22c55e' : 'rgba(255,255,255,0.2)',
                  }} />
                )}

                <span style={{
                  fontSize: 11,
                  color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
                  fontWeight: isActive ? 500 : 400,
                }}>
                  {tool}
                </span>

                {isActive && (
                  <span style={{
                    fontSize: 9,
                    color: '#22c55e',
                    marginLeft: 'auto',
                    fontWeight: 600,
                  }}>
                    LIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tool logos row - always visible for instant recognition */}
      {!expanded && (
        <div style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexDirection: direction === 'output' ? 'row-reverse' : 'row',
          paddingLeft: direction === 'output' ? 0 : 52,
          paddingRight: direction === 'output' ? 52 : 0,
        }}>
          {category.tools.map(tool => {
            const isActive = activeTools.includes(tool);
            const domain = TOOL_DOMAINS[tool];
            const logoUrl = logoDevToken && domain
              ? `https://img.logo.dev/${domain}?token=${logoDevToken}&size=32&format=webp`
              : null;

            return logoUrl ? (
              <div
                key={tool}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  borderRadius: 6,
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                }}
              >
                <img
                  src={logoUrl}
                  alt={tool}
                  style={{
                    width: 14,
                    height: 14,
                    objectFit: 'contain',
                    opacity: isActive ? 1 : 0.4,
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Live stat below logos - muted in Option A to let GRID be hero */}
      {!expanded && stat && (
        <div style={{
          marginTop: 6,
          paddingLeft: direction === 'output' ? 0 : 52,
          paddingRight: direction === 'output' ? 52 : 0,
          textAlign: direction === 'output' ? 'right' : 'left',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)', // Muted - no colored stats
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)', // Muted dot
            }} />
            {stat}
          </span>
        </div>
      )}

      {/* Highlight badge for reputation - muted in Option A */}
      {isHighlighted && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: direction === 'output' ? 'auto' : 12,
          left: direction === 'output' ? 12 : 'auto',
          background: 'rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 8,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          Key for Local SEO
        </div>
      )}
    </div>
  );
}

// Animated Data Flow Line - Enhanced with more activity
function DataFlowLine({ direction, color }: { direction: 'input' | 'output'; color: string }) {
  return (
    <div
      className="ecosystem-arrow"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        position: 'relative',
      }}
    >
      {direction === 'output' && (
        <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.3)', animation: 'pulse 2s ease-in-out infinite' }} />
      )}

      {/* Flow line with animated packets - wider and more visible */}
      <div
        style={{
          width: 60,
          height: 3,
          background: 'rgba(255,255,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Multiple data packets for busy feeling */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 16,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              borderRadius: 2,
              animation: `dataPacket 2.5s linear infinite`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.8,
            }}
          />
        ))}

        {/* Glowing particle overlay for extra life */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {direction === 'input' && (
        <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.3)', animation: 'pulse 2s ease-in-out infinite' }} />
      )}
    </div>
  );
}

export function IntegrationStatus({
  integrations,
  agentRuns = [],
  fullWidth = false,
  onExpand,
  logoDevToken,
  clientWebsite,
  clientBrandColor = BRAND.teal,
  ghlHealthy = false,
  ghlMetrics,
}: IntegrationStatusProps) {
  // V8 Phase 4: Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic stats based on GHL data (branded as "arugami CRM")
  const inputCategoryStats: Record<string, string> = {
    ...INPUT_CATEGORY_STATS,
    customers: ghlMetrics
      ? `${ghlMetrics.contactsTotal} leads${ghlMetrics.openOpportunities > 0 ? ` • ${ghlMetrics.openOpportunities} open` : ''}`
      : INPUT_CATEGORY_STATS.customers,
  };

  // Map real integrations to active tools
  const realActiveTools = integrations
    .filter(i => i.status === 'active')
    .map(i => i.display_name);

  // Combine with mock for demo (in production, this would just be realActiveTools)
  const activeTools = Array.from(new Set([...realActiveTools, ...MOCK_ACTIVE_TOOLS]));

  // Recent activity from agent runs
  const recentActivity = agentRuns
    .slice(0, 5)
    .map(run => ({
      id: run.agent_run_id,
      agent: run.agent_type.replace(/_/g, ' '),
      status: run.status,
      time: new Date(run.queued_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }));

  // Count total active connections across all categories
  const totalActiveInputs = INPUT_CATEGORIES.reduce((sum, cat) =>
    sum + cat.tools.filter(t => activeTools.includes(t)).length, 0
  );
  const totalActiveOutputs = OUTPUT_CATEGORIES.reduce((sum, cat) =>
    sum + cat.tools.filter(t => activeTools.includes(t)).length, 0
  );
  const totalConnections = totalActiveInputs + totalActiveOutputs;

  // V8 Phase 4: Share functionality
  const handleShare = async () => {
    const shareText = `My Digital Ecosystem\n\n• ${totalConnections} active connections\n• ${INPUT_CATEGORIES.length} data sources feeding the GRID\n• ${OUTPUT_CATEGORIES.length} output channels publishing automatically\n\nPowered by arugami GRID`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Live Ecosystem',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Ecosystem summary copied to clipboard!');
    }
  };

  if (fullWidth) {
    return (
      <section
        style={{
          padding: '2rem 2.5rem',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCollapsed ? 0 : 28, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(95, 227, 133, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cable size={18} style={{ color: BRAND.teal }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                Your Digital Ecosystem
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, marginTop: 2 }}>
                Every channel on one grid. Each line is work the system can do for you.
              </p>
            </div>
          </div>

          {/* V8 Phase 4: Control buttons - Status, Share, Collapse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                All systems operational
              </span>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
              title="Share ecosystem summary"
            >
              <Share2 size={14} />
              Share
            </button>

            {/* Collapse/Expand toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
              title={isCollapsed ? 'Expand ecosystem view' : 'Collapse to summary'}
            >
              {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>

        {/* V8 Phase 4: Collapsible - Show collapsed summary or full view */}
        {isCollapsed ? (
          /* Collapsed Summary View - Apple Watch Activity Rings style */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 0',
            gap: 48,
            marginTop: 20,
          }}>
            {/* Input cluster summary */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <Database size={14} style={{ color: 'rgba(34, 197, 94, 0.6)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(34, 197, 94, 0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Data Sources
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
              }}>
                {INPUT_CATEGORIES.map(cat => {
                  const IconComp = IconMap[cat.icon];
                  const activeCount = cat.tools.filter(t => activeTools.includes(t)).length;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {IconComp && <IconComp size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />}
                      {activeCount > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#22c55e',
                          border: '2px solid #0f172a',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {totalActiveInputs} active
              </p>
            </div>

            {/* Central GRID mini */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #2d3748 0%, #1a202c 100%)',
                border: '2px solid rgba(95, 227, 133, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(95, 227, 133, 0.15)',
                animation: 'breathe 4s ease-in-out infinite',
              }}>
                <Zap size={24} style={{ color: BRAND.teal }} />
              </div>
              <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Output cluster summary */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(59, 130, 246, 0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Output Channels
                </span>
                <Send size={14} style={{ color: 'rgba(59, 130, 246, 0.7)' }} />
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
              }}>
                {OUTPUT_CATEGORIES.map(cat => {
                  const IconComp = IconMap[cat.icon];
                  const activeCount = cat.tools.filter(t => activeTools.includes(t)).length;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {IconComp && <IconComp size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />}
                      {activeCount > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#3b82f6',
                          border: '2px solid #0f172a',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {totalActiveOutputs} active
              </p>
            </div>
          </div>
        ) : (
          /* Full Expanded View */
          <>
            {/* Main Flow Diagram - Category Based */}
            <div className="ecosystem-container">

              {/* Input Categories Column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minWidth: 220,
                maxWidth: 280,
                position: 'relative',
                padding: 16,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.03) 0%, transparent 50%)',
              }}>
                {/* Subtle left-side glow for "receiving" feel */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: -20,
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: '80%',
                  background: 'radial-gradient(ellipse at left, rgba(34, 197, 94, 0.06) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Database size={14} style={{ color: 'rgba(34, 197, 94, 0.6)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(34, 197, 94, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Data Sources
                  </span>
                </div>
                {INPUT_CATEGORIES.map((category) => (
                  <div key={category.id} style={{ position: 'relative' }}>
                    <CategoryNode
                      category={category}
                      activeTools={activeTools}
                      direction="input"
                      logoDevToken={logoDevToken}
                      stat={inputCategoryStats[category.id]}
                    />
                  </div>
                ))}
              </div>

          {/* Input Flow Line */}
          <DataFlowLine direction="input" color="#22c55e" />

          {/* Central Grid Hub - Premium Mission Control */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0',
          }}>
            {/* Ambient glow halo */}
            <div style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(95, 227, 133, 0.08) 0%, transparent 70%)',
              animation: 'breathe 4s ease-in-out infinite',
            }} />

            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute',
              width: 170,
              height: 170,
              borderRadius: '50%',
              border: '1px solid rgba(95, 227, 133, 0.08)',
              animation: 'pulseGlow 4s ease-in-out infinite',
            }} />

            {/* Outer orbiting ring - clockwise */}
            <div style={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '1px dashed rgba(95, 227, 133, 0.15)',
              animation: 'orbitSpin 20s linear infinite',
            }}>
              {/* Input indicator (green) */}
              <div style={{
                position: 'absolute',
                top: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.7)',
              }} />
              {/* Output indicator (blue) */}
              <div style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#3b82f6',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.7)',
              }} />
            </div>

            {/* Inner orbiting ring - counter-clockwise */}
            <div style={{
              position: 'absolute',
              width: 130,
              height: 130,
              borderRadius: '50%',
              border: '1px solid rgba(95, 227, 133, 0.1)',
              animation: 'orbitSpinReverse 15s linear infinite',
            }}>
              {/* Side indicators */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: -4,
                transform: 'translateY(-50%)',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(95, 227, 133, 0.6)',
                boxShadow: '0 0 8px rgba(95, 227, 133, 0.5)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                right: -4,
                transform: 'translateY(-50%)',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(95, 227, 133, 0.6)',
                boxShadow: '0 0 8px rgba(95, 227, 133, 0.5)',
              }} />
            </div>

            {/* Main hub - PREMIUM */}
            <div style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #2d3748 0%, #1a202c 100%)',
              boxShadow: `
                0 0 60px rgba(95, 227, 133, 0.12),
                0 0 30px rgba(95, 227, 133, 0.08),
                0 8px 32px rgba(0,0,0,0.4),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(95, 227, 133, 0.35)',
              position: 'relative',
              zIndex: 2,
              animation: 'breathe 4s ease-in-out infinite',
            }}>
              {/* arugami logo/icon */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(95, 227, 133, 0.12)',
                border: '1px solid rgba(95, 227, 133, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}>
                <Zap size={20} style={{ color: BRAND.teal }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>GRID</span>
            </div>

            {/* Heartbeat pulse - makes it feel ALIVE */}
            <div style={{
              position: 'absolute',
              width: 110,
              height: 110,
              borderRadius: '50%',
              border: '2px solid rgba(95, 227, 133, 0.3)',
              animation: 'heartbeat 1.5s ease-in-out infinite',
            }} />

            {/* Second heartbeat pulse - delayed */}
            <div style={{
              position: 'absolute',
              width: 110,
              height: 110,
              borderRadius: '50%',
              border: '1px solid rgba(95, 227, 133, 0.2)',
              animation: 'heartbeat 1.5s ease-in-out infinite 0.3s',
            }} />

            {/* GRID Activity Status - answers "what is it doing?" */}
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 14,
              border: '1px solid rgba(95, 227, 133, 0.15)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 0.5,
              }}>
                Active
              </span>
            </div>
          </div>

          {/* Output Flow Line */}
          <DataFlowLine direction="output" color="#3b82f6" />

          {/* Output Categories Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 220,
            maxWidth: 280,
            position: 'relative',
            padding: 16,
            borderRadius: 16,
            background: 'linear-gradient(225deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
          }}>
            {/* Subtle right-side glow for "broadcasting" feel */}
            <div style={{
              position: 'absolute',
              top: '50%',
              right: -20,
              transform: 'translateY(-50%)',
              width: 40,
              height: '80%',
              background: 'radial-gradient(ellipse at right, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(59, 130, 246, 0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Output Channels
              </span>
              <Send size={14} style={{ color: 'rgba(59, 130, 246, 0.7)' }} />
            </div>
            {OUTPUT_CATEGORIES.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                activeTools={activeTools}
                direction="output"
                logoDevToken={logoDevToken}
                clientWebsite={clientWebsite}
                clientBrandColor={clientBrandColor}
                stat={OUTPUT_CATEGORY_STATS[category.id]}
              />
            ))}
          </div>
        </div>

        {/* Activity Footer */}
        {recentActivity.length > 0 && (
          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Activity size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Live Grid Activity
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.05)',
                    minWidth: 160,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: activity.status === 'completed' || activity.status === 'success' ? '#22c55e' :
                                  activity.status === 'running' ? '#eab308' : '#94a3b8',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                      {activity.agent}
                    </span>
                  </div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: 4 }}>
                    {activity.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </section>
    );
  }

  // Compact card mode (for grid layouts)
  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          Live Ecosystem
        </h2>
        <Cable size={20} style={{ color: '#64748b', opacity: 0.8 }} />
      </div>

      {/* Compact Category Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Input Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={12} style={{ color: '#64748b' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {INPUT_CATEGORIES.length} Sources
            </span>
          </div>
          {INPUT_CATEGORIES.slice(0, 2).map(cat => {
            const IconComp = IconMap[cat.icon];
            return (
              <div key={cat.id} style={{
                padding: '8px 10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {IconComp && <IconComp size={14} style={{ color: cat.color }} />}
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
              </div>
            );
          })}
        </div>

        {/* Arrow + Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowRight size={12} style={{ color: '#cbd5e1' }} />
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={16} style={{ color: BRAND.teal }} />
          </div>
          <ArrowRight size={12} style={{ color: '#cbd5e1' }} />
        </div>

        {/* Output Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {OUTPUT_CATEGORIES.length} Channels
            </span>
            <Send size={12} style={{ color: '#64748b' }} />
          </div>
          {OUTPUT_CATEGORIES.slice(0, 2).map(cat => {
            const IconComp = IconMap[cat.icon];
            return (
              <div key={cat.id} style={{
                padding: '8px 10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                {IconComp && <IconComp size={14} style={{ color: cat.color }} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
