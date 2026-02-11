'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import { GridBackground } from '../dashboard/components/GridBackground';
import { BRAND, BUTTON, INPUT, OPACITY, RADIUS, ANIMATION } from '@/lib/brand';

// ============================================
// SHARED STYLES (using design tokens)
// ============================================
const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: INPUT.padding,
  fontSize: INPUT.fontSize,
  color: 'white',
  background: BRAND.gridCharcoal,
  borderRadius: INPUT.radius,
  outline: 'none',
  transition: `border-color ${ANIMATION.fast}s, box-shadow ${ANIMATION.fast}s`,
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };


  const getInputBorder = (field: 'email' | 'password', value: string) => {
    if (focused === field) return `1.5px solid ${BRAND.teal}`;
    if (value) return `1.5px solid ${BRAND.teal}${OPACITY.heavy}`;
    return `1.5px solid ${BRAND.concrete}${OPACITY.medium}`;
  };

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px ${BRAND.gridCharcoal} inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input::placeholder {
          color: ${BRAND.concrete};
          opacity: 0.5;
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
          padding: 20,
        }}
      >
        {/* Animated Grid Background (shared component) */}
        <GridBackground />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION.normal }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 360,
            padding: 28,
            borderRadius: RADIUS.lg,
            background: BRAND.utilitySlate,
            border: `1px solid ${BRAND.concrete}${OPACITY.light}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Status Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: BRAND.gridCharcoal,
                border: `1px solid ${BRAND.teal}${OPACITY.heavy}`,
                borderRadius: RADIUS.sm,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: BRAND.teal,
                }}
              />
              <span
                style={{
                  color: BRAND.teal,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: 'monospace',
                }}
              >
                Secure Login
              </span>
            </div>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                margin: 0,
                marginBottom: 4,
                letterSpacing: '-0.5px',
              }}
            >
              arugami
            </h1>
            <p style={{ fontSize: 13, color: BRAND.concrete, margin: 0 }}>
              Sign in to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: BRAND.concrete,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                <Mail size={10} />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                placeholder="you@company.com"
                style={{
                  ...inputBase,
                  border: getInputBorder('email', email),
                  boxShadow: focused === 'email' ? `0 0 0 3px ${BRAND.teal}15` : 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: BRAND.concrete,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                <Lock size={10} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
                placeholder="••••••••"
                style={{
                  ...inputBase,
                  border: getInputBorder('password', password),
                  boxShadow: focused === 'password' ? `0 0 0 3px ${BRAND.teal}15` : 'none',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  marginBottom: 14,
                  fontSize: 12,
                  color: BRAND.red,
                  background: `${BRAND.red}${OPACITY.subtle}`,
                  border: `1px solid ${BRAND.red}${OPACITY.light}`,
                  borderRadius: RADIUS.sm,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: BUTTON.subtle.padding,
                fontSize: BUTTON.subtle.fontSize,
                fontWeight: 600,
                color: BRAND.gridCharcoal,
                background: loading ? BRAND.concrete : BRAND.amber,
                border: 'none',
                borderRadius: BUTTON.subtle.radius,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: `background ${ANIMATION.fast}s`,
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid transparent',
                      borderTopColor: BRAND.gridCharcoal,
                      borderRadius: '50%',
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Sign In
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${BRAND.concrete}${OPACITY.subtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <Shield size={11} style={{ color: BRAND.concrete, opacity: 0.5 }} />
            <span style={{ fontSize: 10, color: BRAND.concrete, opacity: 0.5 }}>
              Protected by arugami infrastructure
            </span>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 12px',
            background: `${BRAND.utilitySlate}${OPACITY.solid}`,
            borderRadius: RADIUS.sm,
            border: `1px solid ${BRAND.concrete}${OPACITY.subtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: BRAND.teal,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: BRAND.concrete,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontFamily: 'monospace',
              }}
            >
              Online
            </span>
          </div>
          <div style={{ width: 1, height: 8, background: `${BRAND.concrete}${OPACITY.medium}` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: BRAND.amber,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: BRAND.concrete,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontFamily: 'monospace',
              }}
            >
              Encrypted
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
