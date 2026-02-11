'use client';

import { BRAND } from '@/lib/brand';
import { GridBackground } from '../dashboard/components/GridBackground';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: BRAND.gridCharcoal,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <GridBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
