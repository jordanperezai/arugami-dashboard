'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND, SPACING, RADIUS, BUTTON, INPUT, ANIMATION, OPACITY } from '@/lib/brand';
import { generateSlug } from '@/lib/admin';

type PageState = 'form' | 'success';

interface CreatedClient {
  client_id: string;
  business_name: string;
  slug: string;
  welcomeUrl: string;
}

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: ANIMATION.stagger },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: ANIMATION.normal } },
};

export default function NewClientPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('form');
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(null);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState<'name' | 'slug' | null>(null);

  const handleNameChange = useCallback((value: string) => {
    setBusinessName(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  }, [slugEdited]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugEdited(true);
    setSlug(generateSlug(value));
  }, []);

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setError('Business name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          slug: slug || generateSlug(businessName),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      setCreatedClient({
        client_id: data.client.client_id,
        business_name: data.client.business_name,
        slug: data.client.slug,
        welcomeUrl: data.welcomeUrl,
      });
      setPageState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdClient?.welcomeUrl) return;

    try {
      await navigator.clipboard.writeText(createdClient.welcomeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = createdClient.welcomeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTextToClient = () => {
    if (!createdClient?.welcomeUrl) return;
    const message = `Welcome to arugami! Here's your link to get started: ${createdClient.welcomeUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleReset = () => {
    setPageState('form');
    setBusinessName('');
    setSlug('');
    setSlugEdited(false);
    setCreatedClient(null);
    setError(null);
  };

  const getInputBorder = (field: 'name' | 'slug', value: string) => {
    if (focused === field) return `1.5px solid ${BRAND.teal}`;
    if (value) return `1.5px solid ${BRAND.teal}${OPACITY.heavy}`;
    return `1.5px solid ${BRAND.concrete}${OPACITY.medium}`;
  };

  // Success state
  if (pageState === 'success' && createdClient) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        style={{ padding: SPACING.lg, maxWidth: 480, margin: '0 auto' }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.md,
            marginBottom: SPACING.xl,
          }}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ fontSize: 24, color: BRAND.teal }}
          >
            ✓
          </motion.span>
          <h1 style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: BRAND.teal,
            margin: 0,
          }}>
            Client Created
          </h1>
        </motion.header>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: BRAND.utilitySlate,
            borderRadius: RADIUS.lg,
            padding: SPACING.xl,
            marginBottom: SPACING.xl,
            textAlign: 'center',
            border: `1px solid ${BRAND.teal}${OPACITY.medium}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 40px ${BRAND.teal}10`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              background: `radial-gradient(circle, ${BRAND.teal}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <p style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'white',
            marginBottom: SPACING.sm,
            position: 'relative',
          }}>
            {createdClient.business_name}
          </p>
          <p style={{
            fontSize: 14,
            color: BRAND.concrete,
            position: 'relative',
          }}>
            is ready for onboarding
          </p>
        </motion.div>

        {/* Welcome Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: SPACING.xl }}
        >
          <p style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: BRAND.concrete,
            textTransform: 'uppercase',
            marginBottom: SPACING.sm,
          }}>
            Welcome Link
          </p>
          <div style={{
            backgroundColor: BRAND.gridCharcoal,
            border: `1px solid ${BRAND.utilitySlate}`,
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            fontSize: 12,
            fontFamily: 'monospace',
            color: BRAND.concrete,
            wordBreak: 'break-all',
            userSelect: 'all',
          }}>
            {createdClient.welcomeUrl}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}
        >
          <motion.button
            variants={staggerItem}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCopy}
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
              boxShadow: `0 4px 20px ${BRAND.teal}30`,
            }}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </motion.button>

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

          <motion.button
            variants={staggerItem}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleReset}
            style={{
              width: '100%',
              padding: BUTTON.subtle.padding,
              backgroundColor: 'transparent',
              color: BRAND.concrete,
              border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
              borderRadius: RADIUS.md,
              fontSize: BUTTON.subtle.fontSize,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + Create Another
          </motion.button>

          <motion.button
            variants={staggerItem}
            whileHover={{ x: 4 }}
            onClick={() => router.push(`/admin/clients/${createdClient.client_id}`)}
            style={{
              width: '100%',
              padding: BUTTON.subtle.padding,
              backgroundColor: 'transparent',
              color: BRAND.concrete,
              border: 'none',
              fontSize: BUTTON.subtle.fontSize,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            View Client Details →
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Form state
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
          New Client
        </h1>
      </motion.header>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          backgroundColor: BRAND.utilitySlate,
          borderRadius: RADIUS.lg,
          padding: SPACING.xl,
          border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xl }}>
          {/* Business Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: BRAND.concrete,
              textTransform: 'uppercase',
              marginBottom: SPACING.sm,
            }}>
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="Joey's Auto Repair"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: INPUT.padding,
                backgroundColor: BRAND.gridCharcoal,
                border: getInputBorder('name', businessName),
                borderRadius: INPUT.radius,
                fontSize: INPUT.fontSize,
                color: 'white',
                outline: 'none',
                transition: `border-color ${ANIMATION.fast}s, box-shadow ${ANIMATION.fast}s`,
                boxShadow: focused === 'name' ? `0 0 0 3px ${BRAND.teal}15` : 'none',
              }}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: BRAND.concrete,
              textTransform: 'uppercase',
              marginBottom: SPACING.sm,
            }}>
              Slug (URL-friendly)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onFocus={() => setFocused('slug')}
              onBlur={() => setFocused(null)}
              placeholder="joeys-auto-repair"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: INPUT.padding,
                backgroundColor: BRAND.gridCharcoal,
                border: getInputBorder('slug', slug),
                borderRadius: INPUT.radius,
                fontSize: INPUT.fontSize,
                fontFamily: 'monospace',
                color: 'white',
                outline: 'none',
                transition: `border-color ${ANIMATION.fast}s, box-shadow ${ANIMATION.fast}s`,
                boxShadow: focused === 'slug' ? `0 0 0 3px ${BRAND.teal}15` : 'none',
              }}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  fontSize: 14,
                  color: BRAND.red,
                  textAlign: 'center',
                  padding: `${SPACING.sm}px`,
                  backgroundColor: `${BRAND.red}15`,
                  borderRadius: RADIUS.sm,
                  border: `1px solid ${BRAND.red}${OPACITY.medium}`,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            whileHover={!loading && businessName.trim() ? { scale: 1.01 } : {}}
            whileTap={!loading && businessName.trim() ? { scale: 0.99 } : {}}
            onClick={handleSubmit}
            disabled={loading || !businessName.trim()}
            style={{
              width: '100%',
              padding: BUTTON.prominent.padding,
              backgroundColor: loading || !businessName.trim() ? BRAND.gridCharcoal : BRAND.teal,
              color: loading || !businessName.trim() ? BRAND.concrete : 'white',
              border: 'none',
              borderRadius: RADIUS.lg,
              fontSize: BUTTON.prominent.fontSize,
              fontWeight: 600,
              cursor: loading || !businessName.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !businessName.trim() ? 'none' : `0 4px 20px ${BRAND.teal}30`,
              transition: `all ${ANIMATION.normal}s`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 16,
                    height: 16,
                    border: `2px solid ${BRAND.concrete}30`,
                    borderTopColor: 'white',
                    borderRadius: '50%',
                  }}
                />
                Creating...
              </>
            ) : (
              'Create Client'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
