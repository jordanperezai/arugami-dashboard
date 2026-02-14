'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface OnboardingChecklist {
  ghl_setup?: boolean;
  website_live?: boolean;
  first_automation?: boolean;
  payment_collected?: boolean;
}

interface ClientActivationPanelProps {
  businessName: string;
  onboardingChecklist?: OnboardingChecklist | null;
  launchConcierge?: boolean;
}

const ARUGAMI_OPERATOR_PHONE = '+15513103050';
const ARUGAMI_OPERATOR_EMAIL = 'hello@arugami.com';

const CHECKLIST_ITEMS: Array<{ key: keyof OnboardingChecklist; label: string }> = [
  { key: 'payment_collected', label: 'Payment activated' },
  { key: 'ghl_setup', label: 'GHL connected' },
  { key: 'website_live', label: 'Website live' },
  { key: 'first_automation', label: 'First automation live' },
];

const QUICK_PROMPTS = [
  'Run a 7-day lead follow-up plan for my business.',
  'What should we fix first this week to increase booked jobs?',
  'Draft a missed-call text-back flow we can launch today.',
];

export function ClientActivationPanel({ businessName, onboardingChecklist, launchConcierge = false }: ClientActivationPanelProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string>(QUICK_PROMPTS[0]);

  const completedSteps = useMemo(() => {
    return CHECKLIST_ITEMS.filter((item) => Boolean(onboardingChecklist?.[item.key])).length;
  }, [onboardingChecklist]);

  const progressText = `${completedSteps}/${CHECKLIST_ITEMS.length} activation milestones complete`;

  const messageBody = `Hi arugami team - this is ${businessName}. ${selectedPrompt}`;
  const whatsappUrl = `https://wa.me/${ARUGAMI_OPERATOR_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(messageBody)}`;
  const smsUrl = `sms:${ARUGAMI_OPERATOR_PHONE}?body=${encodeURIComponent(messageBody)}`;
  const emailUrl = `mailto:${ARUGAMI_OPERATOR_EMAIL}?subject=${encodeURIComponent(`${businessName} - Activation Request`)}&body=${encodeURIComponent(messageBody)}`;

  return (
    <section
      style={{
        background: BRAND.utilitySlate,
        border: `1px solid ${BRAND.teal}40`,
        borderRadius: 14,
        padding: '20px 22px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: BRAND.teal,
              boxShadow: `0 0 10px ${BRAND.teal}70`,
            }}
          />
          <span style={{ color: BRAND.teal, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Client Activation
          </span>
        </div>

        <h2 style={{ margin: 0, color: '#fff', fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          Your dashboard is live. We can keep building while A2P and EIN are in progress.
        </h2>

        <p style={{ marginTop: 10, marginBottom: 14, color: BRAND.concreteLite, fontSize: 14, lineHeight: 1.5 }}>
          Simple version: your system is already turned on, we are now finishing the paperwork layer. You do not need to wait to start getting value.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: BRAND.gridCharcoal,
            border: `1px solid ${BRAND.concrete}40`,
            borderRadius: 999,
            padding: '6px 12px',
            marginBottom: 14,
          }}
        >
          <Clock3 size={13} color={BRAND.amber} />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{progressText}</span>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {CHECKLIST_ITEMS.map((item) => {
            const done = Boolean(onboardingChecklist?.[item.key]);
            return (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: done ? BRAND.teal : BRAND.concrete,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {done ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: BRAND.gridCharcoal,
          border: `1px solid ${BRAND.concrete}30`,
          borderRadius: 12,
          padding: 14,
          boxShadow: launchConcierge ? `0 0 0 2px ${BRAND.amber}40` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <MessageSquare size={14} color={BRAND.amber} />
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
            Talk To Your AI Operator Now
          </span>
        </div>

        <p style={{ margin: '0 0 10px', color: BRAND.concrete, fontSize: 12, lineHeight: 1.45 }}>
          Like you are texting a teammate. Pick a prompt and send.
        </p>

        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          {QUICK_PROMPTS.map((prompt) => {
            const selected = prompt === selectedPrompt;
            return (
              <button
                key={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                style={{
                  textAlign: 'left',
                  fontSize: 12,
                  lineHeight: 1.35,
                  color: selected ? '#fff' : BRAND.concreteLite,
                  background: selected ? `${BRAND.teal}20` : 'transparent',
                  border: `1px solid ${selected ? `${BRAND.teal}60` : `${BRAND.concrete}25`}`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              background: BRAND.teal,
              color: BRAND.gridCharcoal,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <MessageSquare size={14} />
            Start On WhatsApp
          </a>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <a
              href={smsUrl}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 10px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${BRAND.concrete}40`,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Smartphone size={13} />
              SMS
            </a>
            <a
              href={emailUrl}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 10px',
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${BRAND.concrete}40`,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Mail size={13} />
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
