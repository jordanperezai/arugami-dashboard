'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface BillingActivationCardProps {
  clientId: string;
  clientStatus: string;
  mrrCents: number;
  billingState?: 'success' | 'canceled' | null;
}

export function BillingActivationCard({ clientId, clientStatus, mrrCents, billingState = null }: BillingActivationCardProps) {
  const [loading, setLoading] = useState(false);
  const isActive = clientStatus === 'active' && mrrCents > 0;

  const startCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-dashboard-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('Could not open checkout. Please try again in a minute.');
    }
  };

  if (isActive) {
    return (
      <section
        style={{
          background: BRAND.utilitySlate,
          border: `1px solid ${BRAND.teal}45`,
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gap: 8, width: '100%' }}>
          {billingState === 'success' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: BRAND.teal,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={14} />
              Payment received. Finalizing your account now.
            </div>
          )}

          {billingState === 'canceled' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: BRAND.amber,
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={14} />
              Checkout was canceled. Your current billing remains active.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} color={BRAND.teal} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Billing Active</p>
                <p style={{ margin: 0, fontSize: 12, color: BRAND.concreteLite }}>
                  Subscription is live at ${(mrrCents / 100).toFixed(0)}/mo.
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: BRAND.teal,
                letterSpacing: 0.6,
              }}
            >
              Paid
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        background: BRAND.utilitySlate,
        border: `1px solid ${BRAND.amber}45`,
        borderRadius: 12,
        padding: '14px 18px',
        display: 'grid',
        gap: 10,
      }}
    >
      {billingState === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: BRAND.teal,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={14} />
          Payment received. Finalizing your account now.
        </div>
      )}

      {billingState === 'canceled' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: BRAND.amber,
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={14} />
          Checkout was canceled. You can resume anytime below.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>Activation Payment Pending</p>
          <p style={{ margin: 0, fontSize: 12, color: BRAND.concreteLite }}>
            Complete payment to unlock live automations and reports.
          </p>
        </div>

        <button
          onClick={startCheckout}
          disabled={loading}
          style={{
            border: 'none',
            borderRadius: 8,
            background: BRAND.amber,
            color: BRAND.gridCharcoal,
            padding: '9px 12px',
            fontSize: 12,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            minWidth: 124,
            justifyContent: 'center',
          }}
        >
          {loading ? <Loader2 size={14} /> : <CreditCard size={14} />}
          {loading ? 'Opening...' : 'Pay Invoice'}
        </button>
      </div>
    </section>
  );
}
