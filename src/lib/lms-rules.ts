import { z } from 'zod';

export const MAX_DEVICES = 2;
export const SLIDE_INTERVAL_MS = 6000;
export const SLIDE_COUNT = 3;
export const courseSchema = z.object({
  id: z.string().uuid().optional(), slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(120),
  title: z.string().trim().min(1).max(160), description: z.string().max(5000),
  category: z.string().min(1).max(100), thumbnail: z.string().max(2000),
  price_mmk: z.number().int().min(0).nullable(), access_days: z.number().int().positive().nullable(),
  status: z.enum(['draft', 'published']),
});
export const codeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{16,80}$/, 'Enter a valid redeem code.');
export function hasActiveAccess(access: { expires_at: string; revoked_at: string | null }, now = Date.now()) {
  return access.revoked_at === null && Date.parse(access.expires_at) > now;
}
export function canRegisterDevice(activeCount: number) { return activeCount < MAX_DEVICES; }
export function validateReceipt(file: { size: number; type: string }) {
  return file.size > 0 && file.size <= 10 * 1024 * 1024 && ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
}
export async function hashValue(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return 'AMA-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}