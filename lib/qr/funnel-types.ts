/**
 * QR Code Funnel Types
 *
 * Pre-defined funnel types that determine behavior when QR code is scanned.
 * Some funnel types trigger GHL pipelines, others are tracking-only.
 *
 * Decision: Pre-defined types instead of client-selectable pipelines
 * (Rabois + Cagan approved - simpler to ship, lower usability risk)
 */

export type FunnelType =
  | 'catering'    // Catering inquiry → triggers GHL pipeline
  | 'inquiry'     // General inquiry/contact → triggers GHL pipeline
  | 'download'    // App/menu download → tracking only
  | 'menu'        // Menu view → tracking only
  | 'review';     // Review request → triggers GHL pipeline

export interface FunnelTypeConfig {
  id: FunnelType;
  label: string;
  description: string;
  triggersGHL: boolean;
  defaultOpportunityName: string;
  icon: string; // Emoji for UI
}

export const FUNNEL_TYPES: Record<FunnelType, FunnelTypeConfig> = {
  catering: {
    id: 'catering',
    label: 'Catering Inquiry',
    description: 'Triggers catering pipeline when scanned',
    triggersGHL: true,
    defaultOpportunityName: 'QR Scan - Catering Inquiry',
    icon: '🍽️',
  },
  inquiry: {
    id: 'inquiry',
    label: 'General Inquiry',
    description: 'Triggers contact pipeline when scanned',
    triggersGHL: true,
    defaultOpportunityName: 'QR Scan - General Inquiry',
    icon: '💬',
  },
  download: {
    id: 'download',
    label: 'App/Menu Download',
    description: 'Tracks downloads, no pipeline trigger',
    triggersGHL: false,
    defaultOpportunityName: '',
    icon: '📥',
  },
  menu: {
    id: 'menu',
    label: 'Menu View',
    description: 'Tracks menu views, no pipeline trigger',
    triggersGHL: false,
    defaultOpportunityName: '',
    icon: '📋',
  },
  review: {
    id: 'review',
    label: 'Review Request',
    description: 'Triggers review follow-up pipeline',
    triggersGHL: true,
    defaultOpportunityName: 'QR Scan - Review Request',
    icon: '⭐',
  },
};

/**
 * Get all funnel types as an array (for dropdowns)
 */
export function getFunnelTypeOptions(): FunnelTypeConfig[] {
  return Object.values(FUNNEL_TYPES);
}

/**
 * Check if a funnel type triggers GHL
 */
export function shouldTriggerGHL(funnelType: FunnelType): boolean {
  return FUNNEL_TYPES[funnelType]?.triggersGHL ?? false;
}

/**
 * Get the default opportunity name for a funnel type
 */
export function getDefaultOpportunityName(funnelType: FunnelType, qrLabel?: string): string {
  const config = FUNNEL_TYPES[funnelType];
  if (!config?.triggersGHL) return '';
  return qrLabel ? `${config.defaultOpportunityName} - ${qrLabel}` : config.defaultOpportunityName;
}
