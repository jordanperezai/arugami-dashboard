'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BRAND, SPACING, RADIUS, BUTTON, ANIMATION, OPACITY } from '@/lib/brand';

interface Stats {
  mrr: number;
  activeClients: number;
  pendingClients: number;
  foundingSpotsLeft: number;
  alerts: Array<{
    clientId: string;
    businessName: string;
    type: string;
    message: string;
    daysAgo: number;
  }>;
}

// Stagger container for card animations
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

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
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
      {/* Header with Logo */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: SPACING['2xl'] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: BRAND.amber,
              boxShadow: `0 0 8px ${BRAND.amber}60`,
            }}
          />
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: 'white',
            margin: 0,
          }}>
            arugami
          </h1>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: BRAND.concrete,
            textTransform: 'lowercase',
            letterSpacing: '0.05em',
          }}>
            ops
          </span>
        </div>
      </motion.header>

      {/* Stats Grid with Stagger Animation */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: SPACING.md,
          marginBottom: SPACING['2xl'],
        }}
      >
        <StatCard
          value={`$${stats?.mrr || 0}`}
          label="MRR"
          color={BRAND.teal}
          glowColor={BRAND.teal}
        />
        <StatCard
          value={stats?.activeClients || 0}
          label="Active"
          color={BRAND.teal}
          glowColor={BRAND.teal}
        />
        <StatCard
          value={stats?.pendingClients || 0}
          label="Pending"
          color={BRAND.amber}
          glowColor={BRAND.amber}
        />
        <StatCard
          value={stats?.foundingSpotsLeft || 0}
          label="Spots Left"
          color={BRAND.concrete}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: SPACING['2xl'] }}
      >
        <h2 style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: BRAND.concrete,
          textTransform: 'uppercase',
          marginBottom: SPACING.md,
        }}>
          Quick Actions
        </h2>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: ANIMATION.fast }}
          onClick={() => router.push('/admin/clients/new')}
          style={{
            width: '100%',
            padding: BUTTON.prominent.padding,
            backgroundColor: BRAND.teal,
            color: 'white',
            border: 'none',
            borderRadius: RADIUS.lg,
            fontSize: BUTTON.prominent.fontSize,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: SPACING.md,
            boxShadow: `0 4px 20px ${BRAND.teal}30`,
          }}
        >
          + New Client
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: ANIMATION.fast }}
          onClick={() => router.push('/admin/clients')}
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
          View Clients
        </motion.button>
      </motion.section>

      {/* Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: BRAND.concrete,
            textTransform: 'uppercase',
            marginBottom: SPACING.md,
          }}>
            Needs Attention
          </h2>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: ANIMATION.fast }}
            style={{
              backgroundColor: BRAND.utilitySlate,
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              border: `1px solid ${BRAND.amber}${OPACITY.medium}`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.25)`,
            }}
          >
            {stats.alerts.map((alert, i) => (
              <motion.div
                key={alert.clientId}
                whileHover={{ x: 4 }}
                transition={{ duration: ANIMATION.fast }}
                onClick={() => router.push(`/admin/clients/${alert.clientId}`)}
                style={{
                  padding: `${SPACING.sm}px 0`,
                  borderTop: i > 0 ? `1px solid ${BRAND.gridCharcoal}` : 'none',
                  cursor: 'pointer',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                  {alert.businessName}
                </p>
                <p style={{ fontSize: 13, color: BRAND.amber }}>
                  {alert.message}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
}

function StatCard({
  value,
  label,
  color,
  glowColor,
}: {
  value: string | number;
  label: string;
  color: string;
  glowColor?: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: ANIMATION.fast }}
      style={{
        backgroundColor: BRAND.utilitySlate,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        textAlign: 'center',
        border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
        boxShadow: glowColor
          ? `0 4px 20px rgba(0,0,0,0.25), 0 0 30px ${glowColor}10`
          : `0 4px 20px rgba(0,0,0,0.25)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow effect */}
      {glowColor && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            background: `radial-gradient(circle, ${glowColor}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <p style={{
        fontSize: 32,
        fontWeight: 800,
        color,
        marginBottom: SPACING.xs,
        letterSpacing: '-0.02em',
        position: 'relative',
      }}>
        {value}
      </p>
      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.15em',
        color: BRAND.concrete,
        textTransform: 'uppercase',
        position: 'relative',
      }}>
        {label}
      </p>
    </motion.div>
  );
}
