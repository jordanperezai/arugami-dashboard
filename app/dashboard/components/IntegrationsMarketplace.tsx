'use client';

import { Store, ExternalLink, Check, Sparkles, Lock } from 'lucide-react';

interface Integration {
  integration_id: string;
  integration_type: string;
  display_name: string;
  status: string;
}

interface IntegrationsMarketplaceProps {
  connectedIntegrations: Integration[];
  logoDevToken?: string;
}

type AvailableIntegration = {
  id: string;
  name: string;
  description: string;
  category: string;
  initials: string;
  accentColor: string;
  domain: string;
  unlocks: string;
  usage?: string;
  status?: 'available' | 'coming_soon';
};

// Available integrations catalog
const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  {
    id: 'toast_pos',
    name: 'Toast POS',
    description: 'Point of Sale system',
    category: 'POS',
    initials: 'T',
    accentColor: '#fb923c',
    domain: 'toasttab.com',
    unlocks: 'Automatic daily sales reports',
    usage: '87% of cafés use this',
    status: 'available',
  },
  {
    id: 'clover_pos',
    name: 'Clover POS',
    description: 'POS and payments',
    category: 'POS',
    initials: 'C',
    accentColor: '#22c55e',
    domain: 'clover.com',
    unlocks: 'Real-time inventory sync',
    status: 'available',
  },
  {
    id: 'square_pos',
    name: 'Square',
    description: 'Payments & business',
    category: 'POS',
    initials: 'S',
    accentColor: '#0ea5e9',
    domain: 'squareup.com',
    unlocks: 'Automated bookkeeping',
    usage: 'Most popular for retail',
    status: 'available',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing',
    category: 'Marketing',
    initials: 'M',
    accentColor: '#facc15',
    domain: 'mailchimp.com',
    unlocks: 'Automatic email campaigns',
    usage: 'Used by 12k+ businesses',
    status: 'available',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Social content',
    category: 'Social',
    initials: 'IG',
    accentColor: '#ec4899',
    domain: 'instagram.com',
    unlocks: 'Automatic social posts',
    status: 'available',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting software',
    category: 'Finance',
    initials: 'QB',
    accentColor: '#22c55e',
    domain: 'quickbooks.intuit.com',
    unlocks: 'Tax-ready financial reports',
    status: 'coming_soon',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform',
    category: 'E-com',
    initials: 'S',
    accentColor: '#96bf48',
    domain: 'shopify.com',
    unlocks: 'Online order fulfillment',
    status: 'coming_soon',
  },
];

export function IntegrationsMarketplace({ connectedIntegrations, logoDevToken }: IntegrationsMarketplaceProps) {
  const connectedIntegrationIds = connectedIntegrations.map((i) =>
    i.integration_type.toLowerCase().replace(/_/g, '')
  );

  const recommendedIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (i) => i.status === 'available' && !connectedIntegrationIds.includes(i.id.replace(/_/g, ''))
  ).slice(0, 2);

  const otherIntegrations = AVAILABLE_INTEGRATIONS.filter(
    (i) => i.status === 'available' && (connectedIntegrationIds.includes(i.id.replace(/_/g, '')) || !recommendedIntegrations.includes(i))
  );

  const comingSoonIntegrations = AVAILABLE_INTEGRATIONS.filter((i) => i.status === 'coming_soon');

  const renderCard = (integration: AvailableIntegration, isRecommended = false) => {
    const isConnected = connectedIntegrationIds.includes(integration.id.replace(/_/g, ''));
    const logoUrl = logoDevToken
      ? `https://img.logo.dev/${integration.domain}?token=${logoDevToken}&size=64&format=webp&background=transparent`
      : null;

    return (
      <div
        key={integration.id}
        style={{
          padding: '16px',
          borderRadius: 16,
          background: isConnected
            ? 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.02) 100%)'
            : isRecommended
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : '#fff',
          border: isConnected
            ? '1px solid rgba(16,185,129,0.2)'
            : isRecommended
            ? '1px solid #cbd5e1'
            : '1px solid #f1f5f9',
          boxShadow: isRecommended ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
          transition: 'all 0.2s ease',
          cursor: isConnected ? 'default' : 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!isConnected) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = '#94a3b8';
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isRecommended ? '0 4px 12px rgba(0,0,0,0.04)' : 'none';
            e.currentTarget.style.borderColor = isRecommended ? '#cbd5e1' : '#f1f5f9';
          }
        }}
      >
        {isRecommended && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#3b82f6',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '0 0 0 8px',
            }}
          >
            RECOMMENDED
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${integration.name} logo`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#ffffff',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${integration.accentColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                {integration.initials}
              </div>
            )}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                {integration.name}
              </h3>
              <span
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {integration.category}
              </span>
            </div>
          </div>
          {isConnected && <Check size={18} style={{ color: '#10b981' }} />}
        </div>

        {/* Value Prop (What it unlocks) */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={12} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5' }}>What you get:</span>
          </div>
          <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
            {integration.unlocks}
          </p>
        </div>

        {/* Usage Stat */}
        {integration.usage && (
          <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12, fontStyle: 'italic' }}>
            {integration.usage}
          </p>
        )}

        {/* CTA Button */}
        {isConnected ? (
          <div
            style={{
              fontSize: 11,
              color: '#10b981',
              fontWeight: 600,
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(16,185,129,0.1)',
              marginTop: 'auto',
            }}
          >
            Connected
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: '#0f172a',
              fontWeight: 600,
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'white',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginTop: 'auto',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Request Setup
            <ExternalLink size={12} />
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Integrations Marketplace
        </h2>
        <Store size={20} style={{ color: '#10b981', opacity: 0.8 }} />
      </div>

      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
        Connect more tools to get more done automatically.
      </p>

      {/* Recommended Section */}
      {recommendedIntegrations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Recommended for you
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {recommendedIntegrations.map((integration) => renderCard(integration, true))}
          </div>
        </div>
      )}

      {/* Explore All */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Explore All
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {otherIntegrations.map((integration) => renderCard(integration))}
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Coming Soon
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {comingSoonIntegrations.map((integration) => (
            <div
              key={integration.id}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px dashed #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: 0.8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Lock size={12} color="#94a3b8" />
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>{integration.name}</h4>
                  <p style={{ fontSize: 10, color: '#94a3b8' }}>{integration.unlocks}</p>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                SOON
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
