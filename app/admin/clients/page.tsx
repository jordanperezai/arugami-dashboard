'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BRAND, SPACING, RADIUS, ANIMATION, OPACITY } from '@/lib/brand';
import { STATUS_COLORS, ClientStatus } from '@/lib/admin';

interface Client {
  client_id: string;
  business_name: string;
  slug: string;
  status: ClientStatus;
  mrr_cents: number;
  created_at: string;
  has_owner: boolean;
}

// Stagger animations
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: ANIMATION.stagger,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIMATION.normal } },
};

export default function ClientsListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/admin/clients');
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        setClients(data.clients || []);
      } catch {
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

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

  if (error) {
    return (
      <div style={{ padding: SPACING.lg, textAlign: 'center' }}>
        <p style={{ color: BRAND.red }}>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION.normal }}
      style={{ padding: SPACING.lg, maxWidth: 480, margin: '0 auto' }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.xl,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin')}
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
            Clients
          </h1>
          <span style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: BRAND.concrete,
            backgroundColor: BRAND.gridCharcoal,
            padding: '2px 8px',
            borderRadius: RADIUS.sm,
            border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
          }}>
            {clients.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/admin/clients/new')}
          style={{
            width: 44,
            height: 44,
            backgroundColor: BRAND.teal,
            color: 'white',
            border: 'none',
            borderRadius: RADIUS.md,
            fontSize: 24,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 20px ${BRAND.teal}30`,
          }}
        >
          +
        </motion.button>
      </motion.header>

      {/* Client List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}
      >
        {clients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: BRAND.utilitySlate,
              borderRadius: RADIUS.lg,
              padding: SPACING.xl,
              textAlign: 'center',
              border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
          >
            <p style={{ color: BRAND.concrete, marginBottom: SPACING.md }}>No clients yet</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/clients/new')}
              style={{
                padding: `${SPACING.sm}px ${SPACING.lg}px`,
                backgroundColor: BRAND.teal,
                color: 'white',
                border: 'none',
                borderRadius: RADIUS.md,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${BRAND.teal}30`,
              }}
            >
              Create First Client
            </motion.button>
          </motion.div>
        ) : (
          clients.map((client, index) => (
            <ClientCard
              key={client.client_id}
              client={client}
              index={index}
              onClick={() => router.push(`/admin/clients/${client.client_id}`)}
            />
          ))
        )}
      </motion.div>
    </motion.div>
  );
}

function ClientCard({
  client,
  index,
  onClick,
}: {
  client: Client;
  index: number;
  onClick: () => void;
}) {
  const statusColor = STATUS_COLORS[client.status] || BRAND.concrete;
  const mrrDisplay = client.mrr_cents > 0 ? `$${client.mrr_cents / 100}` : '$0';
  const isActive = client.status === 'active';

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: ANIMATION.fast }}
      onClick={onClick}
      style={{
        backgroundColor: BRAND.utilitySlate,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        cursor: 'pointer',
        border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle status glow */}
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

      <p style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'white',
        marginBottom: SPACING.xs,
        position: 'relative',
      }}>
        {client.business_name}
      </p>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.xs,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          color: statusColor,
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
        <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
          {mrrDisplay}
        </span>
      </div>
      <p style={{
        fontSize: 12,
        fontFamily: 'monospace',
        color: BRAND.concrete,
        letterSpacing: '0.02em',
      }}>
        {client.slug}
      </p>
    </motion.div>
  );
}
