import crypto from 'crypto';

/**
 * Generates a cryptographically random, unguessable public reference string for appointment requests.
 * Format: REQ-YYYY-XXXX-XXXX
 */
export function generatePublicReference(): string {
  const year = new Date().getFullYear();
  const randomPart1 = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  const randomPart2 = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `REQ-${year}-${randomPart1}-${randomPart2}`;
}
