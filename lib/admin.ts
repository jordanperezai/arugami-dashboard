// ============================================
// ADMIN HELPERS
// ============================================
// Utilities for admin access control.
// ADMIN_EMAILS env var contains comma-separated admin emails.

/**
 * Get the list of admin emails from environment variable
 */
export function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

/**
 * Check if an email has admin access
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Generate a URL-friendly slug from a business name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '')          // Trim leading/trailing hyphens
    .slice(0, 50);                   // Limit length
}

/**
 * Status color mapping for UI
 */
export const STATUS_COLORS = {
  active: '#2FB7A4',    // teal
  pending: '#F2A900',   // amber
  churned: '#C64545',   // red
  suspended: '#8E949C', // concrete
} as const;

export type ClientStatus = keyof typeof STATUS_COLORS;
