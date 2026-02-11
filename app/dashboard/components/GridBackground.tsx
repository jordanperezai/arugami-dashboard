'use client';

import { motion } from 'framer-motion';
import { BRAND } from '@/lib/brand';

export function GridBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      {/* Horizontal grid lines */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`h-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i + 1) * 10}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
          }}
        />
      ))}

      {/* Vertical grid lines */}
      {[...Array(14)].map((_, i) => (
        <div
          key={`v-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(i + 1) * 7}%`,
            width: 1,
            background: `linear-gradient(180deg, transparent 0%, ${BRAND.utilitySlate}30 20%, ${BRAND.utilitySlate}30 80%, transparent 100%)`
          }}
        />
      ))}

      {/* Energy pulse lines - horizontal */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: '30%',
          left: 0,
          width: '30%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND.amber}60, ${BRAND.amber}, ${BRAND.amber}60, transparent)`,
          filter: 'blur(1px)'
        }}
      />
      <motion.div
        animate={{ x: ['200%', '-100%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 2 }}
        style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          width: '25%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${BRAND.teal}60, ${BRAND.teal}, ${BRAND.teal}60, transparent)`,
          filter: 'blur(1px)'
        }}
      />

      {/* Energy pulse lines - vertical */}
      <motion.div
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 1 }}
        style={{
          position: 'absolute',
          left: '21%',
          top: 0,
          height: '30%',
          width: 1,
          background: `linear-gradient(180deg, transparent, ${BRAND.teal}60, ${BRAND.teal}, ${BRAND.teal}60, transparent)`,
          filter: 'blur(1px)'
        }}
      />
      <motion.div
        animate={{ y: ['200%', '-100%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: 4 }}
        style={{
          position: 'absolute',
          left: '77%',
          top: 0,
          height: '25%',
          width: 1,
          background: `linear-gradient(180deg, transparent, ${BRAND.amber}60, ${BRAND.amber}, ${BRAND.amber}60, transparent)`,
          filter: 'blur(1px)'
        }}
      />

      {/* Grid intersection nodes */}
      {[
        { x: 21, y: 30, color: BRAND.teal, delay: 0 },
        { x: 49, y: 50, color: BRAND.amber, delay: 1 },
        { x: 70, y: 20, color: BRAND.teal, delay: 2 },
        { x: 35, y: 70, color: BRAND.amber, delay: 0.5 },
        { x: 84, y: 60, color: BRAND.teal, delay: 1.5 },
        { x: 14, y: 60, color: BRAND.amber, delay: 2.5 },
        { x: 63, y: 80, color: BRAND.teal, delay: 3 },
      ].map((node, i) => (
        <motion.div
          key={`node-${i}`}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: node.delay }}
          style={{
            position: 'absolute',
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: node.color,
            boxShadow: `0 0 10px ${node.color}50`
          }}
        />
      ))}
    </div>
  );
}
