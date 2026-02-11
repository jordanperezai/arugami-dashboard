'use client';

import { useState, useEffect } from 'react';
import {
  QrCode,
  Plus,
  Download,
  ToggleLeft,
  ToggleRight,
  Eye,
  ChevronRight,
  Loader2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { BRAND } from '@/lib/brand';

// Funnel type config (matching lib/qr/funnel-types.ts)
const FUNNEL_TYPES = {
  catering: { label: 'Catering Inquiry', icon: '🍽️', triggersGHL: true },
  inquiry: { label: 'General Inquiry', icon: '💬', triggersGHL: true },
  download: { label: 'App/Menu Download', icon: '📥', triggersGHL: false },
  menu: { label: 'Menu View', icon: '📋', triggersGHL: false },
  review: { label: 'Review Request', icon: '⭐', triggersGHL: true },
} as const;

type FunnelType = keyof typeof FUNNEL_TYPES;

interface QRCode {
  id: string;
  shortCode: string;
  label: string;
  destinationUrl: string;
  funnelType: FunnelType;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  dataUrl: string;
}

interface QRStats {
  totalScans: number;
  scansLast7Days: number;
  scansLast30Days: number;
  totalQRCodes: number;
  activeQRCodes: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

interface QRCodeManagerProps {
  initialQRCodes?: QRCode[];
}

// Helper: Format relative time
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeDestinationUrlInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

export function QRCodeManager({ initialQRCodes = [] }: QRCodeManagerProps) {
  const [qrCodes, setQRCodes] = useState<QRCode[]>(initialQRCodes);
  const [stats, setStats] = useState<QRStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFunnelType, setNewFunnelType] = useState<FunnelType>('menu');

  // Fetch QR codes on mount
  useEffect(() => {
    fetchQRCodes();
    fetchStats();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/qr/list');
      const data = await response.json();

      if (data.success) {
        setQRCodes(data.qrCodes);
      }
    } catch (err) {
      console.error('Failed to fetch QR codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/qr/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch QR stats:', err);
    }
  };

  const createQRCode = async () => {
    if (!newLabel.trim() || !newUrl.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const normalizedDestinationUrl = normalizeDestinationUrlInput(newUrl);

    try {
      new URL(normalizedDestinationUrl);
    } catch {
      setError('Please enter a valid URL (include https://)');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel.trim(),
          destinationUrl: normalizedDestinationUrl,
          funnelType: newFunnelType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQRCodes([data.qrCode, ...qrCodes]);
        setShowCreateForm(false);
        setNewLabel('');
        setNewUrl('');
        setNewFunnelType('menu');
        fetchStats();
      } else {
        setError(data.error || 'Failed to create QR code');
      }
    } catch (err) {
      setError('Failed to create QR code');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleActive = async (qrCode: QRCode) => {
    try {
      const response = await fetch('/api/qr/list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: qrCode.id,
          isActive: !qrCode.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQRCodes(
          qrCodes.map((qr) =>
            qr.id === qrCode.id ? { ...qr, isActive: !qr.isActive } : qr
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle QR code:', err);
    }
  };

  const downloadQRCode = (qrCode: QRCode) => {
    const link = document.createElement('a');
    link.href = qrCode.dataUrl;
    link.download = `qr-${qrCode.label.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      style={{
        padding: '1.5rem',
        borderRadius: 16,
        background: `linear-gradient(180deg, ${BRAND.utilitySlate} 0%, ${BRAND.gridCharcoal} 100%)`,
        border: `1px solid ${BRAND.concrete}20`,
        position: 'relative',
        overflow: 'hidden',
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
          background: `radial-gradient(ellipse at 100% 0%, ${BRAND.teal}05 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={18} style={{ color: BRAND.teal }} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white', margin: 0 }}>
              QR Code Tracking
            </h2>
            <p style={{ fontSize: 12, color: BRAND.concrete, marginTop: 2, margin: 0 }}>
              Track scans and trigger pipelines automatically
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: BRAND.teal,
            border: 'none',
            fontSize: 11,
            fontWeight: 600,
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 12px',
            borderRadius: 6,
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${BRAND.teal}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus size={14} />
          New QR
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}15`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>
              {stats.totalScans}
            </p>
            <p style={{ fontSize: 10, color: BRAND.concrete, margin: '4px 0 0', textTransform: 'uppercase' }}>
              Total Scans
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}15`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 700, color: BRAND.teal, margin: 0 }}>
              {stats.scansLast7Days}
            </p>
            <p style={{ fontSize: 10, color: BRAND.concrete, margin: '4px 0 0', textTransform: 'uppercase' }}>
              Last 7 Days
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}15`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>
              {stats.activeQRCodes}
            </p>
            <p style={{ fontSize: 10, color: BRAND.concrete, margin: '4px 0 0', textTransform: 'uppercase' }}>
              Active Codes
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Smartphone size={12} style={{ color: BRAND.amber }} />
              <span style={{ fontSize: 11, color: 'white' }}>{stats.deviceBreakdown.mobile}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tablet size={12} style={{ color: BRAND.teal }} />
              <span style={{ fontSize: 11, color: 'white' }}>{stats.deviceBreakdown.tablet}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Monitor size={12} style={{ color: BRAND.concrete }} />
              <span style={{ fontSize: 11, color: 'white' }}>{stats.deviceBreakdown.desktop}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            background: BRAND.gridCharcoal,
            border: `1px solid ${BRAND.teal}30`,
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 12px' }}>
            Create New QR Code
          </h3>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                background: `${BRAND.red}15`,
                border: `1px solid ${BRAND.red}30`,
                color: BRAND.red,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: BRAND.concrete, display: 'block', marginBottom: 4 }}>
                Label (e.g., "Menu Table Tent", "Catering Flyer")
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Menu Table Tent"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${BRAND.concrete}30`,
                  background: BRAND.utilitySlate,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: BRAND.concrete, display: 'block', marginBottom: 4 }}>
                Destination URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yourbusiness.com/menu"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${BRAND.concrete}30`,
                  background: BRAND.utilitySlate,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: BRAND.concrete, display: 'block', marginBottom: 4 }}>
                Funnel Type
              </label>
              <select
                value={newFunnelType}
                onChange={(e) => setNewFunnelType(e.target.value as FunnelType)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: `1px solid ${BRAND.concrete}30`,
                  background: BRAND.utilitySlate,
                  color: 'white',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(FUNNEL_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label} {config.triggersGHL ? '(triggers pipeline)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={createQRCode}
                disabled={isCreating}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: BRAND.teal,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  opacity: isCreating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Create QR Code
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: `1px solid ${BRAND.concrete}30`,
                  background: 'transparent',
                  color: BRAND.concrete,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes List */}
      {isLoading ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            color: BRAND.concrete,
          }}
        >
          <Loader2
            size={24}
            style={{ color: BRAND.teal, animation: 'spin 1s linear infinite', marginBottom: 8 }}
          />
          <p style={{ margin: 0, fontSize: 13 }}>Loading QR codes...</p>
        </div>
      ) : qrCodes.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            color: BRAND.concrete,
            fontSize: 13,
            background: BRAND.gridCharcoal,
            borderRadius: 10,
            border: `1px dashed ${BRAND.concrete}30`,
          }}
        >
          <QrCode size={24} style={{ color: `${BRAND.concrete}60`, marginBottom: 8 }} />
          <p style={{ margin: 0 }}>No QR codes yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7 }}>
            Create your first QR code to start tracking scans
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {qrCodes.map((qr) => {
            const funnelConfig = FUNNEL_TYPES[qr.funnelType] || FUNNEL_TYPES.menu;

            return (
              <div
                key={qr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: 10,
                  background: BRAND.gridCharcoal,
                  border: `1px solid ${qr.isActive ? `${BRAND.teal}30` : `${BRAND.concrete}15`}`,
                  opacity: qr.isActive ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              >
                {/* QR Preview */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    background: 'white',
                    padding: 4,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={qr.dataUrl}
                    alt={qr.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'white',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {qr.label}
                    </p>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: funnelConfig.triggersGHL
                          ? `${BRAND.amber}20`
                          : `${BRAND.concrete}20`,
                        color: funnelConfig.triggersGHL ? BRAND.amber : BRAND.concrete,
                      }}
                    >
                      {funnelConfig.icon} {funnelConfig.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: BRAND.concrete,
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {qr.destinationUrl}
                  </p>
                </div>

                {/* Scan Count */}
                <div style={{ textAlign: 'center', minWidth: 60 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: BRAND.teal, margin: 0 }}>
                    {qr.scanCount}
                  </p>
                  <p style={{ fontSize: 9, color: BRAND.concrete, margin: 0, textTransform: 'uppercase' }}>
                    scans
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => downloadQRCode(qr)}
                    title="Download QR"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: `1px solid ${BRAND.concrete}30`,
                      background: 'transparent',
                      color: BRAND.concrete,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = BRAND.teal;
                      e.currentTarget.style.color = BRAND.teal;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${BRAND.concrete}30`;
                      e.currentTarget.style.color = BRAND.concrete;
                    }}
                  >
                    <Download size={14} />
                  </button>
                  <a
                    href={qr.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open destination"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: `1px solid ${BRAND.concrete}30`,
                      background: 'transparent',
                      color: BRAND.concrete,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = BRAND.teal;
                      e.currentTarget.style.color = BRAND.teal;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${BRAND.concrete}30`;
                      e.currentTarget.style.color = BRAND.concrete;
                    }}
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => toggleActive(qr)}
                    title={qr.isActive ? 'Deactivate' : 'Activate'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: `1px solid ${qr.isActive ? BRAND.teal : BRAND.concrete}30`,
                      background: qr.isActive ? `${BRAND.teal}15` : 'transparent',
                      color: qr.isActive ? BRAND.teal : BRAND.concrete,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {qr.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {qrCodes.length > 0 && (
        <p
          style={{
            margin: '1rem 0 0',
            fontSize: '0.65rem',
            color: `${BRAND.concrete}60`,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {qrCodes.length} QR code{qrCodes.length !== 1 ? 's' : ''} configured
        </p>
      )}

      {/* CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
