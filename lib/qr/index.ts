/**
 * QR Code Module
 *
 * Exports QR code generation utilities and funnel type definitions.
 */

export {
  generateQRDataUrl,
  generateQRBuffer,
  generateShortCode,
  getQRTrackingUrl,
  isValidShortCode,
} from './generate';

export {
  FUNNEL_TYPES,
  getFunnelTypeOptions,
  shouldTriggerGHL,
  getDefaultOpportunityName,
  type FunnelType,
  type FunnelTypeConfig,
} from './funnel-types';
