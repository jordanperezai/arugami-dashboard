'use client';

import { BarChart3, ChevronRight } from 'lucide-react';

interface Report {
  report_id: string;
  report_type: string;
  title: string;
  content: any;
  created_at: string;
}

interface ReportsFeedProps {
  reports: Report[];
}

export function ReportsFeed({ reports }: ReportsFeedProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUnread = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000; // < 24h is "new"
  };

  const getSummary = (content: any) => {
    if (typeof content === 'string') return content.substring(0, 60) + '...';
    if (content?.summary) return content.summary;
    if (content?.highlights && Array.isArray(content.highlights)) return content.highlights[0];
    return 'Click to view details';
  };

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(95,227,133,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)';
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 20,
        }}
      >
        Recent Reports
      </h2>

      {reports.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 140,
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          <BarChart3 size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>No reports yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Your weekly summaries will show up here soon.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 500,
            overflowY: 'auto',
          }}
        >
          {reports.map((report) => (
            <div
              key={report.report_id}
              style={{
                padding: '16px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)';
                e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                e.currentTarget.style.border = '1px solid rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <BarChart3 size={18} style={{ color: '#10b981', opacity: 0.8 }} />
                    {isUnread(report.created_at) && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#3b82f6',
                          border: '1px solid #fff',
                        }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{report.title}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                    {formatDate(report.created_at)}
                  </p>
                  <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
                </div>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: '#475569',
                  lineHeight: 1.4,
                  marginBottom: 8,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {getSummary(report.content)}
              </p>

              <p
                style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontWeight: 600,
                }}
              >
                {report.report_type.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
