'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Check,
  MessageSquare,
  Star,
  Users,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  CreditCard,
  Lock,
  Mail,
  Phone,
  Target,
  Globe,
  MapPin,
  LayoutDashboard,
  FileText,
  Plug,
} from 'lucide-react';
import { GridBackground } from '../dashboard/components/GridBackground';
import { BRAND, BUTTON, INPUT, OPACITY, RADIUS, ANIMATION } from '@/lib/brand';

// ============================================
// TYPES
// ============================================
type Step = 'payment' | 'reveal' | 'priorities' | 'password';

type Priority = 'leads' | 'time' | 'reviews' | 'all';

// ============================================
// ANIMATIONS (using design tokens)
// ============================================
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION.slow, ease: ANIMATION.ease },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: ANIMATION.stagger,
      delayChildren: ANIMATION.fast,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ============================================
// STEP 1: PAYMENT
// ============================================
interface PaymentStepProps {
  clientId: string;
  token: string;
  onComplete: () => void;
}

function PaymentStep({ clientId, token, onComplete }: PaymentStepProps) {
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!agreed) return;
    setProcessing(true);
    setError(null);

    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        padding: '0 20px',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: `${BRAND.amber}15`,
            border: `1px solid ${BRAND.amber}30`,
            borderRadius: 100,
            marginBottom: 24,
          }}
        >
          <Zap size={14} style={{ color: BRAND.amber }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: BRAND.amber,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Final Step
          </span>
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginBottom: 12,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Let's get you plugged
          <br />
          <span style={{ color: BRAND.teal }}>into the Grid.</span>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: BRAND.concrete,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Your AI is ready to start learning your business today.
        </p>
      </motion.div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: ANIMATION.normal }}
        style={{
          background: `linear-gradient(135deg, ${BRAND.utilitySlate} 0%, ${BRAND.gridCharcoal} 100%)`,
          borderRadius: RADIUS.xl,
          padding: 28,
          marginBottom: 24,
          border: `1px solid ${BRAND.teal}${OPACITY.medium}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            background: `radial-gradient(circle, ${BRAND.teal}20 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', margin: 0, marginBottom: 4 }}>
              The Intelligent Grid
            </h3>
            <p style={{ fontSize: 13, color: BRAND.concrete, margin: 0 }}>Everything your business needs</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>$449</div>
            <div style={{ fontSize: 12, color: BRAND.concrete }}>/month</div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { icon: MessageSquare, label: 'Missed Call Text-back' },
            { icon: Star, label: 'Google Review Response' },
            { icon: Users, label: 'Lead Follow-up Automation' },
            { icon: Brain, label: 'Grid Memory AI' },
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: `${BRAND.teal}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <feature.icon size={12} style={{ color: BRAND.teal }} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Ownership Value Prop */}
        <div
          style={{
            borderTop: `1px solid ${BRAND.concrete}20`,
            paddingTop: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: `${BRAND.amber}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <Zap size={12} style={{ color: BRAND.amber }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 4 }}>
              You own everything.
            </div>
            <div style={{ fontSize: 12, color: BRAND.concrete, lineHeight: 1.5 }}>
              No agency markups. No contracts.<br />
              Your data. Your business.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stripe Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          background: BRAND.utilitySlate,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          border: `1px solid ${BRAND.concrete}15`,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <CreditCard size={16} style={{ color: BRAND.teal }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
            Secure Checkout
          </span>
        </div>
        <p style={{ fontSize: 12, color: BRAND.concrete, margin: 0, lineHeight: 1.5 }}>
          You&apos;ll be redirected to Stripe&apos;s secure payment page.<br />
          Apple Pay, Google Pay, and all major cards accepted.
        </p>
        <p style={{ fontSize: 11, color: BRAND.concrete, margin: '10px 0 0', lineHeight: 1.45 }}>
          A2P and EIN setup can continue in parallel after activation.
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: `${BRAND.red}15`,
            border: `1px solid ${BRAND.red}30`,
            borderRadius: 10,
            fontSize: 13,
            color: BRAND.red,
            textAlign: 'center',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Terms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => setAgreed(!agreed)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: agreed ? `2px solid ${BRAND.teal}` : `2px solid ${BRAND.concrete}40`,
            background: agreed ? BRAND.teal : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
            transition: 'all 0.2s',
          }}
        >
          {agreed && <Check size={14} style={{ color: BRAND.gridCharcoal }} />}
        </button>
        <span style={{ fontSize: 13, color: BRAND.concrete, lineHeight: 1.5 }}>
          I agree to the{' '}
          <a href="/terms" style={{ color: BRAND.teal, textDecoration: 'none' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: BRAND.teal, textDecoration: 'none' }}>
            Privacy Policy
          </a>
        </span>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ANIMATION.slow }}
        whileHover={agreed && !processing ? { scale: 1.02 } : {}}
        whileTap={agreed && !processing ? { scale: 0.98 } : {}}
        onClick={handlePayment}
        disabled={!agreed || processing}
        style={{
          width: '100%',
          padding: BUTTON.prominent.padding,
          fontSize: BUTTON.prominent.fontSize,
          fontWeight: 600,
          color: agreed ? BRAND.gridCharcoal : BRAND.concrete,
          background: agreed ? BRAND.amber : BRAND.utilitySlate,
          border: 'none',
          borderRadius: BUTTON.prominent.radius,
          cursor: agreed && !processing ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: `all ${ANIMATION.normal}s`,
          opacity: agreed ? 1 : 0.5,
        }}
      >
        {processing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 18,
                height: 18,
                border: '2px solid transparent',
                borderTopColor: BRAND.gridCharcoal,
                borderRadius: '50%',
              }}
            />
            Redirecting to Stripe...
          </>
        ) : (
          <>
            Continue to Payment
            <ArrowRight size={18} />
          </>
        )}
      </motion.button>

      {/* Security Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16,
        }}
      >
        <Shield size={12} style={{ color: BRAND.concrete, opacity: 0.5 }} />
        <span style={{ fontSize: 11, color: BRAND.concrete, opacity: 0.5 }}>
          Secured by Stripe • Cancel anytime
        </span>
      </div>
    </div>
  );
}

// ============================================
// GOOGLE LOGO COMPONENT
// ============================================
function GoogleLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ============================================
// STEP 2: REVEAL (simplified animation - 3 phases)
// ============================================
function RevealStep({ businessName, onComplete }: { businessName: string; onComplete: () => void }) {
  // Simplified: 3 phases instead of 5
  // Phase 1: Business name (immediate via Framer)
  // Phase 2: Foundation + Automation (staggered together)
  // Phase 3: Intelligence + Quote + Button (final reveal)
  const [showPhase2, setShowPhase2] = useState(false);
  const [showPhase3, setShowPhase3] = useState(false);

  useEffect(() => {
    // Phase 2: Show foundation + automation after business name settles
    const timer1 = setTimeout(() => setShowPhase2(true), 1000);
    // Phase 3: Show intelligence, quote, and button
    const timer2 = setTimeout(() => setShowPhase3(true), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Foundation items (compact row)
  const foundation = [
    { icon: Globe, label: 'Website', description: 'Professional site' },
    { icon: MapPin, label: 'Google Profile', description: 'Optimized listing' },
    { icon: LayoutDashboard, label: 'Dashboard', description: 'Full CRM access' },
  ];

  // Automation items (prominent cards)
  const automation = [
    { icon: Phone, label: 'Missed Call Text-back', status: 'Active', color: BRAND.teal, description: 'Every missed call → instant response' },
    { icon: Star, label: 'Google Reviews', status: 'Active', color: BRAND.teal, description: 'Every review gets a response. On-brand. On-time.', useGoogleLogo: true },
    { icon: Target, label: 'Lead Follow-up', status: 'Active', color: BRAND.teal, description: 'We chase them so you don\'t have to' },
  ];

  // Intelligence items
  const intelligence = [
    { icon: Brain, label: 'Grid Memory', status: 'Learning...', color: BRAND.amber, description: 'Your AI that learns and grows with you' },
    { icon: FileText, label: 'Intelligence Reports', status: 'Monthly', color: BRAND.teal, description: 'See what your AI has learned' },
  ];

  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100%',
        maxWidth: 600,
        padding: '0 20px',
        textAlign: 'center',
      }}
    >
      {/* Welcome Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 14,
            color: BRAND.concrete,
            marginBottom: 16,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Welcome to the Grid
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontSize: 'clamp(36px, 8vw, 56px)',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginBottom: 12,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {businessName}
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            height: 3,
            background: BRAND.amber,
            borderRadius: 2,
            margin: '0 auto',
            marginBottom: 20,
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            fontSize: 17,
            color: BRAND.teal,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Your AI is now learning your business.
        </motion.p>
      </motion.div>

      {/* SECTION 1: YOUR FOUNDATION (Phase 2) */}
      <AnimatePresence>
        {showPhase2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 40 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: BRAND.concrete,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Your Foundation
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {foundation.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    background: BRAND.utilitySlate,
                    borderRadius: 8,
                    border: `1px solid ${BRAND.concrete}20`,
                  }}
                >
                  <item.icon size={14} style={{ color: BRAND.concrete }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <Check size={12} style={{ color: BRAND.teal }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: YOUR AUTOMATION (Phase 2, staggered) */}
      <AnimatePresence>
        {showPhase2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: 28 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: BRAND.teal,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Running 24/7
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}
            >
              {automation.map((service, i) => (
                <motion.div
                  key={service.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  style={{
                    background: BRAND.utilitySlate,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${service.color}30`,
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'left',
                  }}
                >
                  {/* Subtle glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      width: 40,
                      height: 40,
                      background: `radial-gradient(circle, ${service.color}30 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: `${service.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {service.useGoogleLogo ? (
                        <GoogleLogo size={14} />
                      ) : (
                        <service.icon size={14} style={{ color: service.color }} />
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>
                    {service.label}
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.concrete, marginBottom: 8, lineHeight: 1.4 }}>
                    {service.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: service.color,
                        boxShadow: `0 0 6px ${service.color}`,
                      }}
                    />
                    <span style={{ fontSize: 10, color: service.color, fontWeight: 500 }}>{service.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Activation Preview Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 20,
                padding: '14px 16px',
                background: `${BRAND.gridCharcoal}`,
                borderRadius: 8,
                border: `1px dashed ${BRAND.teal}30`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Your first missed call will get an automatic text-back.',
                  'Your first review will get an AI-drafted response.',
                  'Check back in 30 days for your first Intelligence Report.',
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: BRAND.teal,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, color: BRAND.concrete, lineHeight: 1.4 }}>
                      {msg}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 3: YOUR INTELLIGENCE (Phase 3) */}
      <AnimatePresence>
        {showPhase3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: 28 }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: BRAND.amber,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Learning & Growing
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10,
              }}
            >
              {intelligence.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    background: BRAND.utilitySlate,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${item.color}30`,
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'left',
                  }}
                >
                  {/* Animated glow for Grid Memory */}
                  <motion.div
                    animate={{
                      opacity: item.status === 'Learning...' ? [0.2, 0.5, 0.2] : 0.3,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 50,
                      height: 50,
                      background: `radial-gradient(circle, ${item.color}40 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: `${item.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.concrete, marginBottom: 8, lineHeight: 1.4 }}>
                    {item.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <motion.div
                      animate={{
                        opacity: [1, 0.4, 1],
                        scale: item.status === 'Learning...' ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: item.color,
                        boxShadow: `0 0 6px ${item.color}`,
                      }}
                    />
                    <span style={{ fontSize: 10, color: item.color, fontWeight: 500 }}>{item.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote + Grid Grows Teaser (Phase 3, staggered) */}
      <AnimatePresence>
        {showPhase3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              marginTop: 28,
              marginBottom: 28,
            }}
          >
            {/* Main Quote */}
            <div
              style={{
                background: `linear-gradient(135deg, ${BRAND.gridCharcoal} 0%, ${BRAND.utilitySlate}50 100%)`,
                borderRadius: 12,
                padding: '20px 24px',
                border: `1px solid ${BRAND.concrete}15`,
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  color: 'white',
                  margin: 0,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Your business now has its own AI.
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: BRAND.amber,
                  margin: '8px 0 0',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                Running 24/7. Learning everything.
              </p>
            </div>

            {/* Enhanced Magic Moment - Waking Up Copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: BRAND.utilitySlate,
                borderRadius: 10,
                padding: '16px 20px',
                border: `1px solid ${BRAND.amber}20`,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { text: 'Right now, your AI is waking up. Scanning. Learning.', highlight: true },
                  { text: 'By tomorrow, it will know more about your business than it does today.', highlight: false },
                  { text: 'By next month, it will feel like a partner.', highlight: false },
                  { text: "By next year, you'll wonder how you ever ran without it.", highlight: false },
                ].map((item, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    style={{
                      fontSize: 12,
                      color: item.highlight ? BRAND.amber : BRAND.concrete,
                      fontWeight: item.highlight ? 500 : 400,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* Grid Waking Up Visualization */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                background: BRAND.gridCharcoal,
                borderRadius: 12,
                padding: '20px 24px',
                border: `1px solid ${BRAND.teal}30`,
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background grid pattern */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(${BRAND.teal}08 1px, transparent 1px),
                    linear-gradient(90deg, ${BRAND.teal}08 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  opacity: 0.5,
                }}
              />

              {/* Central glow effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 120,
                  height: 120,
                  background: `radial-gradient(circle, ${BRAND.teal}30 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Data source nodes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  {[
                    { label: 'Reviews', delay: 0 },
                    { label: 'Calls', delay: 0.3 },
                    { label: 'Leads', delay: 0.6 },
                  ].map((node, i) => (
                    <motion.div
                      key={node.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + node.delay }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            `0 0 8px ${BRAND.teal}60`,
                            `0 0 16px ${BRAND.teal}80`,
                            `0 0 8px ${BRAND.teal}60`,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: node.delay,
                        }}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: BRAND.teal,
                          border: `2px solid ${BRAND.teal}`,
                        }}
                      />
                      <span style={{ fontSize: 9, color: BRAND.concrete, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                        {node.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Connection flow */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, marginBottom: 12 }}>
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.15, 0.9, 0.15] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: 'easeInOut',
                      }}
                      style={{
                        width: 10,
                        height: 2,
                        background: BRAND.teal,
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>

                {/* Center brain icon representation */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 12px ${BRAND.amber}40`,
                        `0 0 24px ${BRAND.amber}60`,
                        `0 0 12px ${BRAND.amber}40`,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${BRAND.amber}20 0%, ${BRAND.amber}10 100%)`,
                      border: `1px solid ${BRAND.amber}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Brain size={16} style={{ color: BRAND.amber }} />
                  </motion.div>
                </motion.div>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{ fontSize: 12, color: BRAND.teal, textAlign: 'center', margin: 0, fontWeight: 500 }}
                >
                  Everything connects. Everything learns.
                </motion.p>
              </div>
            </motion.div>

            {/* Grid Grows Teaser */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                background: `${BRAND.utilitySlate}80`,
                borderRadius: 8,
                border: `1px dashed ${BRAND.concrete}30`,
              }}
            >
              <Plug size={14} style={{ color: BRAND.concrete }} />
              <span style={{ fontSize: 11, color: BRAND.concrete }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>The Grid grows with you.</span>
                {' '}Connect your tools — every integration makes your AI smarter.
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button (Phase 3, final) */}
      <AnimatePresence>
        {showPhase3 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION.stagger * 2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            style={{
              padding: BUTTON.prominent.padding,
              fontSize: BUTTON.prominent.fontSize,
              fontWeight: 600,
              color: BRAND.gridCharcoal,
              background: BRAND.teal,
              border: 'none',
              borderRadius: BUTTON.prominent.radius,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            Continue
            <ArrowRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// STEP 3: PRIORITIES
// ============================================
function PrioritiesStep({ onComplete }: { onComplete: (priority: Priority) => void }) {
  const [selected, setSelected] = useState<Priority | null>(null);

  const priorities = [
    {
      id: 'leads' as Priority,
      icon: TrendingUp,
      label: 'More leads',
      description: 'Fill my calendar with customers',
    },
    {
      id: 'time' as Priority,
      icon: Clock,
      label: 'More time',
      description: 'Stop doing tasks I hate',
    },
    {
      id: 'reviews' as Priority,
      icon: Star,
      label: 'Better reviews',
      description: 'Dominate Google Reviews',
    },
    {
      id: 'all' as Priority,
      icon: Sparkles,
      label: 'All of the above',
      description: 'I want it all',
    },
  ];

  const handleComplete = () => {
    if (selected) {
      onComplete(selected);
    }
  };

  return (
    <motion.div
      key="priorities"
      {...pageTransition}
      style={{
        width: '100%',
        maxWidth: 480,
        padding: '0 20px',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: `${BRAND.teal}15`,
            border: `1px solid ${BRAND.teal}30`,
            borderRadius: 100,
            marginBottom: 24,
          }}
        >
          <Check size={14} style={{ color: BRAND.teal }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: BRAND.teal,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Almost There
          </span>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          What matters most to you
          <br />
          <span style={{ color: BRAND.amber }}>right now?</span>
        </h1>
      </motion.div>

      {/* Options */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}
      >
        {priorities.map((priority) => {
          const isSelected = selected === priority.id;
          return (
            <motion.button
              key={priority.id}
              variants={staggerItem}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(priority.id)}
              style={{
                width: '100%',
                padding: 18,
                background: isSelected
                  ? `linear-gradient(135deg, ${BRAND.utilitySlate} 0%, ${BRAND.teal}10 100%)`
                  : BRAND.utilitySlate,
                border: isSelected ? `2px solid ${BRAND.teal}` : `2px solid ${BRAND.concrete}20`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: isSelected ? `${BRAND.teal}20` : BRAND.gridCharcoal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${isSelected ? BRAND.teal : BRAND.concrete}30`,
                }}
              >
                <priority.icon size={20} style={{ color: isSelected ? BRAND.teal : BRAND.concrete }} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                    marginBottom: 2,
                  }}
                >
                  {priority.label}
                </div>
                <div style={{ fontSize: 13, color: BRAND.concrete }}>{priority.description}</div>
              </div>

              {/* Radio indicator */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? BRAND.teal : BRAND.concrete}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: BRAND.teal,
                    }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: ANIMATION.slow }}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.98 } : {}}
        onClick={handleComplete}
        disabled={!selected}
        style={{
          width: '100%',
          padding: BUTTON.prominent.padding,
          fontSize: BUTTON.prominent.fontSize,
          fontWeight: 600,
          color: selected ? BRAND.gridCharcoal : BRAND.concrete,
          background: selected ? BRAND.amber : BRAND.utilitySlate,
          border: 'none',
          borderRadius: BUTTON.prominent.radius,
          cursor: selected ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: `all ${ANIMATION.normal}s`,
          opacity: selected ? 1 : 0.5,
        }}
      >
        Continue
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}

// ============================================
// STEP 4: SET PASSWORD
// ============================================
interface SetPasswordStepProps {
  defaultEmail?: string;
  onComplete: (credentials: { email: string; password: string; phone: string }) => Promise<void>;
  externalError?: string | null;
}

function SetPasswordStep({ defaultEmail = '', onComplete, externalError }: SetPasswordStepProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Simple email validation
  const isValidEmail = (emailToValidate: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
  };

  // Basic phone validation (at least 10 digits)
  const isValidPhone = (phoneToValidate: string) => {
    const digits = phoneToValidate.replace(/\D/g, '');
    return digits.length >= 10;
  };

  // Format phone number as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: INPUT.padding,
    fontSize: INPUT.fontSize,
    color: 'white',
    background: BRAND.gridCharcoal,
    border: `1px solid ${BRAND.concrete}${OPACITY.medium}`,
    borderRadius: INPUT.radius,
    outline: 'none',
    transition: `border-color ${ANIMATION.fast}s, box-shadow ${ANIMATION.fast}s`,
  };

  const handleSubmit = async () => {
    setError('');

    if (!email || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phone || !isValidPhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // Extract just the digits for storage
      const phoneDigits = phone.replace(/\D/g, '');
      await onComplete({ email, password, phone: phoneDigits });
      // Parent handles redirect on success
    } catch (err) {
      // Error is handled by parent via externalError prop
      setSaving(false);
    }
  };

  // Show external error from parent (e.g., API errors)
  const displayError = externalError || error;

  return (
    <motion.div
      key="password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        width: '100%',
        maxWidth: 440,
        padding: '0 20px',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: `${BRAND.amber}15`,
            border: `1px solid ${BRAND.amber}30`,
            borderRadius: 100,
            marginBottom: 24,
          }}
        >
          <Lock size={14} style={{ color: BRAND.amber }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: BRAND.amber,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            One Last Thing
          </span>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'white',
            margin: 0,
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          Secure your account.
        </h1>
        <p
          style={{
            fontSize: 15,
            color: BRAND.concrete,
            margin: 0,
          }}
        >
          Create a password to access your dashboard anytime.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: BRAND.utilitySlate,
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          border: `1px solid ${BRAND.concrete}15`,
        }}
      >
        {/* Email input */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: BRAND.concrete,
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: 6,
            }}
          >
            YOUR EMAIL
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: BRAND.teal,
                pointerEvents: 'none',
              }}
            />
            <input
              type="email"
              placeholder="you@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: 44,
              }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
              onBlur={(e) => (e.target.style.borderColor = `${BRAND.concrete}30`)}
            />
          </div>
        </div>

        {/* Phone input */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: BRAND.concrete,
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: 6,
            }}
          >
            YOUR PHONE
          </label>
          <div style={{ position: 'relative' }}>
            <Phone
              size={16}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: BRAND.teal,
                pointerEvents: 'none',
              }}
            />
            <input
              type="tel"
              placeholder="(305) 555-1234"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              style={{
                ...inputStyle,
                paddingLeft: 44,
              }}
              onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
              onBlur={(e) => (e.target.style.borderColor = `${BRAND.concrete}30`)}
            />
          </div>
        </div>

        {/* Password inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: BRAND.concrete,
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: 6,
              }}
            >
              CREATE PASSWORD
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
              onBlur={(e) => (e.target.style.borderColor = `${BRAND.concrete}30`)}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: BRAND.concrete,
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: 6,
              }}
            >
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = BRAND.teal)}
              onBlur={(e) => (e.target.style.borderColor = `${BRAND.concrete}30`)}
            />
          </div>
        </div>

        {/* Error message */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 14,
              padding: '10px 12px',
              background: `${BRAND.red}15`,
              border: `1px solid ${BRAND.red}30`,
              borderRadius: 8,
              fontSize: 13,
              color: BRAND.red,
            }}
          >
            {displayError}
          </motion.div>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ANIMATION.normal }}
        whileHover={!saving ? { scale: 1.02 } : {}}
        whileTap={!saving ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={saving || !email || !phone || !password || !confirmPassword}
        style={{
          width: '100%',
          padding: BUTTON.prominent.padding,
          fontSize: BUTTON.prominent.fontSize,
          fontWeight: 600,
          color: email && phone && password && confirmPassword ? BRAND.gridCharcoal : BRAND.concrete,
          background: email && phone && password && confirmPassword ? BRAND.amber : BRAND.utilitySlate,
          border: 'none',
          borderRadius: BUTTON.prominent.radius,
          cursor: saving || !email || !phone || !password || !confirmPassword ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: `all ${ANIMATION.normal}s`,
          opacity: email && phone && password && confirmPassword ? 1 : 0.5,
        }}
      >
        {saving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 18,
                height: 18,
                border: '2px solid transparent',
                borderTopColor: BRAND.gridCharcoal,
                borderRadius: '50%',
              }}
            />
            Setting up...
          </>
        ) : (
          <>
            Enter Your Dashboard
            <ArrowRight size={18} />
          </>
        )}
      </motion.button>

      {/* Security Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 16,
        }}
      >
        <Shield size={12} style={{ color: BRAND.concrete, opacity: 0.5 }} />
        <span style={{ fontSize: 11, color: BRAND.concrete, opacity: 0.5 }}>
          Your data is encrypted and secure
        </span>
      </div>
    </motion.div>
  );
}

// ============================================
// LOADING STATE
// ============================================
function LoadingState() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND.gridCharcoal,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <GridBackground />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 40,
          height: 40,
          border: `3px solid ${BRAND.concrete}30`,
          borderTopColor: BRAND.teal,
          borderRadius: '50%',
        }}
      />
      <p style={{ marginTop: 20, color: BRAND.concrete, fontSize: 14 }}>Loading...</p>
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================
function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND.gridCharcoal,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 20,
      }}
    >
      <GridBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `${BRAND.red}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Shield size={32} style={{ color: BRAND.red }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: 0, marginBottom: 12 }}>
          Invalid Link
        </h1>
        <p style={{ fontSize: 15, color: BRAND.concrete, margin: 0, lineHeight: 1.6 }}>
          {message}
        </p>
        <p style={{ fontSize: 13, color: BRAND.concrete, margin: '20px 0 0', opacity: 0.7 }}>
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}

// ============================================
// WELCOME FLOW CONTENT (uses searchParams)
// ============================================
function WelcomeFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const sessionId = searchParams.get('session_id'); // Stripe success
  // Note: canceled param could be used to show a "payment canceled" message if needed

  const [step, setStep] = useState<Step>('payment');
  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('Your Business');
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Verify token on mount
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setTokenError('No welcome token provided. Please use the link sent to your phone.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/welcome/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!data.isValid) {
          setTokenError(data.error || 'Invalid or expired link');
          setIsLoading(false);
          return;
        }

        setClientId(data.clientId);
        setBusinessName(data.businessName || 'Your Business');

        // If we have a session_id, payment was successful - skip to reveal
        if (sessionId) {
          // Payment was successful (Stripe redirected back with session_id)
          // The webhook will handle updating the database, but we can proceed
          setStep('reveal');
        }

        setIsLoading(false);
      } catch {
        setTokenError('Failed to verify welcome link. Please try again.');
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token, sessionId]);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state if token is invalid
  if (tokenError || !clientId) {
    return <ErrorState message={tokenError || 'Invalid welcome link'} />;
  }

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        input::placeholder {
          color: ${BRAND.concrete};
          opacity: 0.5;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND.gridCharcoal,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          padding: '40px 0',
        }}
      >
        {/* Grid Background */}
        <GridBackground />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 40,
            }}
          >
            {(['payment', 'reveal', 'priorities', 'password'] as Step[]).map((s, i) => {
              const steps: Step[] = ['payment', 'reveal', 'priorities', 'password'];
              const currentIndex = steps.indexOf(step);
              const thisIndex = steps.indexOf(s);
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        step === s
                          ? BRAND.teal
                          : currentIndex > thisIndex
                            ? BRAND.teal
                            : `${BRAND.concrete}40`,
                      transition: 'all 0.3s',
                      boxShadow: step === s ? `0 0 10px ${BRAND.teal}60` : 'none',
                    }}
                  />
                  {i < 3 && (
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        background: currentIndex > thisIndex ? BRAND.teal : `${BRAND.concrete}30`,
                        marginLeft: 8,
                        transition: 'all 0.3s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 'payment' && (
              <PaymentStep
                clientId={clientId}
                token={token || ''}
                onComplete={() => setStep('reveal')}
              />
            )}
            {step === 'reveal' && (
              <RevealStep businessName={businessName} onComplete={() => setStep('priorities')} />
            )}
            {step === 'priorities' && (
              <PrioritiesStep
                onComplete={(priority) => {
                  console.log('Selected priority:', priority);
                  setSelectedPriority(priority);
                  setStep('password');
                }}
              />
            )}
            {step === 'password' && (
              <SetPasswordStep
                externalError={signupError}
                onComplete={async ({ email, password, phone }) => {
                  setSignupError(null);

                  const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      password,
                      phone,
                      clientId,
                      fullName: '',
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    setSignupError(data.error || 'Failed to create account');
                    throw new Error(data.error);
                  }

                  console.log('Account created:', { ...data, priority: selectedPriority });
                  // Redirect to dashboard on success
                  router.push('/dashboard?launch=concierge');
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: `${BRAND.concrete}60`, letterSpacing: '0.05em' }}>arugami</span>
          <span style={{ fontSize: 11, color: `${BRAND.concrete}30` }}>•</span>
          <span style={{ fontSize: 11, color: `${BRAND.concrete}40` }}>The Intelligent Grid</span>
        </div>

      </div>
    </>
  );
}

// ============================================
// MAIN PAGE (with Suspense for useSearchParams)
// ============================================
export default function WelcomePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <WelcomeFlowContent />
    </Suspense>
  );
}
