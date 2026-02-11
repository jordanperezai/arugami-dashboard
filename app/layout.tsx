import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'arugami Dashboard',
  description: 'Simple client-facing dashboard connected to the arugami grid',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Montserrat:wght@600;700&display=swap" rel="stylesheet" />
        <style>
          {`
            @keyframes float {
              0%, 100% {
                transform: translate(0, 0);
              }
              25% {
                transform: translate(20px, -20px);
              }
              50% {
                transform: translate(-15px, 15px);
              }
              75% {
                transform: translate(15px, 10px);
              }
            }

            @keyframes pulse {
              0%, 100% {
                opacity: 1;
                box-shadow: 0 0 0 3px rgba(47, 183, 164, 0.2);
              }
              50% {
                opacity: 0.8;
                box-shadow: 0 0 0 6px rgba(47, 183, 164, 0.1);
              }
            }

            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes flowRight {
              0% { transform: translateX(0); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateX(52px); opacity: 0; }
            }

            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes dataPacket {
              0% { left: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }

            @keyframes pulseGlow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(47, 183, 164, 0.3), 0 0 40px rgba(47, 183, 164, 0.1);
              }
              50% {
                box-shadow: 0 0 30px rgba(47, 183, 164, 0.5), 0 0 60px rgba(47, 183, 164, 0.2);
              }
            }

            @keyframes orbitSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes breathe {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.02); opacity: 0.95; }
            }

            @keyframes orbitSpinReverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }

            @keyframes heartbeat {
              0% { transform: scale(1); opacity: 0.8; }
              15% { transform: scale(1.15); opacity: 0.4; }
              30% { transform: scale(1.3); opacity: 0; }
              100% { transform: scale(1.3); opacity: 0; }
            }

            @keyframes activityBurst {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); opacity: 0.8; }
            }

            @keyframes rotateText {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            /* Responsive Ecosystem Layout */
            .ecosystem-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0;
              position: relative;
              z-index: 1;
              padding: 16px 0;
            }

            .ecosystem-arrow {
              display: flex;
              align-items: center;
              padding: 0 12px;
              position: relative;
              transform: rotate(0deg);
            }

            @media (max-width: 768px) {
              .ecosystem-container {
                flex-direction: column;
                gap: 24px;
              }
              .ecosystem-arrow {
                transform: rotate(90deg);
                padding: 12px 0;
              }
            }

            /* Responsive Header Layout - Dark Theme */
            .header-container {
              position: relative;
              padding: 2rem 2.5rem;
              border-radius: 16px;
              background: ${BRAND.utilitySlate};
              border: 1px solid ${BRAND.concrete}20;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: space-between;
              overflow: hidden;
            }

            .header-right {
              display: flex;
              align-items: center;
              gap: 1.5rem;
            }

            @media (max-width: 768px) {
              .desktop-only {
                display: none !important;
              }
              .header-container {
                flex-direction: column;
                align-items: flex-start;
                gap: 1.5rem;
                padding: 1.5rem;
              }
              .header-right {
                width: 100%;
                justify-content: space-between;
                border-top: 1px solid ${BRAND.concrete}20;
                padding-top: 1rem;
                margin-top: 0.5rem;
                flex-wrap: wrap;
                gap: 1rem;
              }
            }
          `}
        </style>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          backgroundColor: BRAND.gridCharcoal,
          color: '#ffffff',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  );
}
