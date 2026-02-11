'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND, SPACING, RADIUS, BUTTON, INPUT, ANIMATION, OPACITY } from '@/lib/brand';
import { STATUS_COLORS, ClientStatus } from '@/lib/admin';

// Animation variants
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: ANIMATION.stagger },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIMATION.normal } },
};

interface OnboardingChecklist {
  ghl_setup: boolean;
  website_live: boolean;
  first_automation: boolean;
  payment_collected: boolean;
}

interface Client {
  client_id: string;
  business_name: string;
  slug: string;
  status: ClientStatus;
  mrr_cents: number;
  created_at: string;
  onboarding_checklist: OnboardingChecklist;
}

interface User {
  email: string;
  full_name: string | null;
  role: string;
  status: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface ClientDetail {
  client: Client;
  users: User[];
  notes: Note[];
  welcomeUrl: string | null;
}

const CHECKLIST_LABELS: Record<keyof OnboardingChecklist, string> = {
  ghl_setup: 'GHL Setup',
  website_live: 'Website Live',
  first_automation: 'First Automation',
  payment_collected: 'Payment Collected',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [data, setData] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [welcomeUrl, setWelcomeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch client');
      const result = await res.json();
      setData(result);
      setWelcomeUrl(result.welcomeUrl);
    } catch {
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleChecklistToggle = async (key: keyof OnboardingChecklist) => {
    if (!data) return;

    const newValue = !data.client.onboarding_checklist[key];

    // Optimistic update
    setData({
      ...data,
      client: {
        ...data.client,
        onboarding_checklist: {
          ...data.client.onboarding_checklist,
          [key]: newValue,
        },
      },
    });

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_checklist: { [key]: newValue },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update checklist');
      }
    } catch {
      // Revert on error
      setData({
        ...data,
        client: {
          ...data.client,
          onboarding_checklist: {
            ...data.client.onboarding_checklist,
            [key]: !newValue,
          },
        },
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !data) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (!res.ok) throw new Error('Failed to add note');

      const result = await res.json();

      // Add note to list
      setData({
        ...data,
        notes: [result.note, ...data.notes],
      });
      setNewNote('');
    } catch {
      // Silent fail - user can retry
    } finally {
      setSavingNote(false);
    }
  };

  const handleResendWelcome = async () => {
    setResending(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/resend-welcome`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to generate welcome link');

      const result = await res.json();
      setWelcomeUrl(result.welcomeUrl);
    } catch {
      // Silent fail
    } finally {
      setResending(false);
    }
  };

  const handleCopy = async () => {
    if (!welcomeUrl) return;

    try {
      await navigator.clipboard.writeText(welcomeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = welcomeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTextToClient = () => {
    if (!welcomeUrl) return;
    const message = `Welcome to arugami! Here's your link to get started: ${welcomeUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div style={{ padding: SPACING.lg, textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 24,
            height: 24,
            border: `2px solid ${BRAND.concrete}30`,
            borderTopColor: BRAND.teal,
            borderRadius: '50%',
            margin: '40px auto',
          }}
        />
        <p style={{ color: BRAND.concrete }}>Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: SPACING.lg, textAlign: 'center' }}
      >
        <p style={{ color: BRAND.red, marginBottom: SPACING.md }}>{error || 'Client not found'}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/admin/clients')}
          style={{
            padding: `${SPACING.sm}px ${SPACING.lg}px`,
            backgroundColor: BRAND.utilitySlate,
            color: 'white',
            border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
            borderRadius: RADIUS.md,
            cursor: 'pointer',
          }}
        >
          Back to Clients
        </motion.button>
      </motion.div>
    );
  }

  const { client, users, notes } = data;
  const statusColor = STATUS_COLORS[client.status] || BRAND.concrete;
  const mrrDisplay = client.mrr_cents > 0 ? `$${client.mrr_cents / 100}` : '$0';
  const createdDate = new Date(client.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isActive = client.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION.normal }}
      style={{ padding: SPACING.lg, maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          marginBottom: SPACING.xl,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/admin/clients')}
          style={{
            background: 'none',
            border: 'none',
            color: BRAND.concrete,
            fontSize: 20,
            cursor: 'pointer',
            padding: SPACING.xs,
          }}
        >
          ←
        </motion.button>
        <h1 style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'white',
          margin: 0,
        }}>
          {client.business_name}
        </h1>
      </motion.header>

      {/* Status Card */}
      <Section title="Status" delay={0.15}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: ANIMATION.fast }}
          style={{
            backgroundColor: BRAND.utilitySlate,
            borderRadius: RADIUS.lg,
            padding: SPACING.lg,
            border: `1px solid ${statusColor}${OPACITY.medium}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.25)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Status glow */}
          {isActive && (
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 60,
                height: 60,
                background: `radial-gradient(circle, ${BRAND.teal}15 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm,
            marginBottom: SPACING.xs,
            position: 'relative',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              color: statusColor,
              fontWeight: 600,
            }}>
              <motion.span
                animate={isActive ? { opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  boxShadow: isActive ? `0 0 6px ${statusColor}` : 'none',
                }}
              />
              {client.status.toUpperCase()}
            </span>
            <span style={{ color: BRAND.concrete, fontSize: 12 }}>•</span>
            <span style={{ fontSize: 14, color: 'white', fontWeight: 700 }}>
              {mrrDisplay}
            </span>
          </div>
          <p style={{ fontSize: 12, color: BRAND.concrete, position: 'relative' }}>
            Since {createdDate}
          </p>
        </motion.div>
      </Section>

      {/* Onboarding Checklist */}
      <Section title="Onboarding" delay={0.2}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: ANIMATION.fast }}
          style={{
            backgroundColor: BRAND.utilitySlate,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          {(Object.keys(CHECKLIST_LABELS) as Array<keyof OnboardingChecklist>).map((key) => (
            <ChecklistItem
              key={key}
              label={CHECKLIST_LABELS[key]}
              checked={client.onboarding_checklist[key]}
              onToggle={() => handleChecklistToggle(key)}
            />
          ))}
        </motion.div>
      </Section>

      {/* Users */}
      {users.length > 0 && (
        <Section title="Users" delay={0.25}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: ANIMATION.fast }}
            style={{
              backgroundColor: BRAND.utilitySlate,
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
          >
            {users.map((user, i) => (
              <div
                key={user.email}
                style={{
                  padding: `${SPACING.sm}px 0`,
                  borderTop: i > 0 ? `1px solid ${BRAND.gridCharcoal}` : 'none',
                }}
              >
                <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{user.email}</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: BRAND.concrete }}>
                  {user.role.toUpperCase()} • {user.status}
                </p>
              </div>
            ))}
          </motion.div>
        </Section>
      )}

      {/* Notes */}
      <Section title="Notes" delay={0.3}>
        <div style={{ marginBottom: SPACING.md }}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: INPUT.padding,
              backgroundColor: BRAND.gridCharcoal,
              border: `1.5px solid ${newNote ? `${BRAND.teal}${OPACITY.heavy}` : `${BRAND.concrete}${OPACITY.medium}`}`,
              borderRadius: INPUT.radius,
              fontSize: INPUT.fontSize,
              color: 'white',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              transition: `border-color ${ANIMATION.fast}s`,
            }}
          />
          <motion.button
            whileHover={!savingNote && newNote.trim() ? { scale: 1.02 } : {}}
            whileTap={!savingNote && newNote.trim() ? { scale: 0.98 } : {}}
            onClick={handleAddNote}
            disabled={savingNote || !newNote.trim()}
            style={{
              marginTop: SPACING.sm,
              padding: `${SPACING.sm}px ${SPACING.lg}px`,
              backgroundColor: savingNote || !newNote.trim() ? BRAND.utilitySlate : BRAND.teal,
              color: savingNote || !newNote.trim() ? BRAND.concrete : 'white',
              border: 'none',
              borderRadius: RADIUS.md,
              fontSize: 14,
              fontWeight: 500,
              cursor: savingNote || !newNote.trim() ? 'not-allowed' : 'pointer',
              boxShadow: savingNote || !newNote.trim() ? 'none' : `0 4px 15px ${BRAND.teal}25`,
            }}
          >
            {savingNote ? 'Saving...' : '+ Add Note'}
          </motion.button>
        </div>

        {notes.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: ANIMATION.fast }}
            style={{
              backgroundColor: BRAND.utilitySlate,
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
          >
            {notes.map((note, i) => {
              const noteDate = new Date(note.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={note.id}
                  style={{
                    padding: `${SPACING.sm}px 0`,
                    borderTop: i > 0 ? `1px solid ${BRAND.gridCharcoal}` : 'none',
                  }}
                >
                  <p style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: BRAND.concrete,
                    marginBottom: SPACING.xs,
                    letterSpacing: '0.02em',
                  }}>
                    {noteDate}
                  </p>
                  <p style={{
                    fontSize: 14,
                    color: 'white',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {note.content}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}
      </Section>

      {/* Actions */}
      <Section title="Actions" delay={0.35}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}
        >
          {welcomeUrl && (
            <>
              <motion.div
                variants={staggerItem}
                style={{
                  backgroundColor: BRAND.gridCharcoal,
                  border: `1px solid ${BRAND.utilitySlate}`,
                  borderRadius: RADIUS.md,
                  padding: SPACING.md,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: BRAND.concrete,
                  wordBreak: 'break-all',
                  userSelect: 'all',
                }}
              >
                {welcomeUrl}
              </motion.div>
              <motion.button
                variants={staggerItem}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCopy}
                style={{
                  width: '100%',
                  padding: BUTTON.subtle.padding,
                  backgroundColor: BRAND.teal,
                  color: 'white',
                  border: 'none',
                  borderRadius: RADIUS.md,
                  fontSize: BUTTON.subtle.fontSize,
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${BRAND.teal}25`,
                }}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </motion.button>
            </>
          )}

          <motion.button
            variants={staggerItem}
            whileHover={!resending ? { scale: 1.01 } : {}}
            whileTap={!resending ? { scale: 0.99 } : {}}
            onClick={handleResendWelcome}
            disabled={resending}
            style={{
              width: '100%',
              padding: BUTTON.subtle.padding,
              backgroundColor: BRAND.utilitySlate,
              color: 'white',
              border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
              borderRadius: RADIUS.md,
              fontSize: BUTTON.subtle.fontSize,
              fontWeight: 500,
              cursor: resending ? 'not-allowed' : 'pointer',
            }}
          >
            {resending ? 'Generating...' : 'Resend Welcome'}
          </motion.button>

          {welcomeUrl && (
            <motion.button
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleTextToClient}
              style={{
                width: '100%',
                padding: BUTTON.subtle.padding,
                backgroundColor: BRAND.utilitySlate,
                color: 'white',
                border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
                borderRadius: RADIUS.md,
                fontSize: BUTTON.subtle.fontSize,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Text to Client
            </motion.button>
          )}
        </motion.div>
      </Section>
    </motion.div>
  );
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: ANIMATION.normal }}
      style={{ marginBottom: SPACING.xl }}
    >
      <h2 style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.15em',
        color: BRAND.concrete,
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
      }}>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function ChecklistItem({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.md,
        width: '100%',
        padding: `${SPACING.md}px ${SPACING.sm}px`,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <motion.span
        animate={{
          backgroundColor: checked ? BRAND.teal : 'transparent',
          borderColor: checked ? BRAND.teal : BRAND.concrete,
        }}
        transition={{ duration: ANIMATION.fast }}
        style={{
          width: 24,
          height: 24,
          borderRadius: RADIUS.sm,
          backgroundColor: checked ? BRAND.teal : 'transparent',
          border: `2px solid ${checked ? BRAND.teal : BRAND.concrete}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: 'white',
          flexShrink: 0,
          boxShadow: checked ? `0 0 10px ${BRAND.teal}30` : 'none',
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      <span style={{
        fontSize: 14,
        color: checked ? BRAND.concrete : 'white',
        textDecoration: checked ? 'line-through' : 'none',
        transition: `color ${ANIMATION.fast}s, text-decoration ${ANIMATION.fast}s`,
      }}>
        {label}
      </span>
    </motion.button>
  );
}
