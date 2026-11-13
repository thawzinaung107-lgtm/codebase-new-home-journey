import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sha256, signedEmbed, encryptGuid, decryptGuid, safeVideo } from './bunny-video.server';
const sql = readFileSync('drizzle/migrations/0008_private_bunny_mapping_and_playback_gate.sql', 'utf8');
describe('Bunny playback boundaries', () => {
  it('matches the official concatenation example digest', async () => {
    expect(await sha256('4742a81b-bf15-42fe-8b1c-8fcb9024c550' + '32d140e2-e4f4-4eec-9d53-20371e9be607' + '1623440202')).toBe('a8617f6df2e9b55b65ac7112138c70417766d80614bfe146d0d9bb2bd21fef87');
  });
  it('expires exactly 300 seconds later using the required iframe host', async () => {
    const result = await signedEmbed('fixture-key', '759', '32d140e2-e4f4-4eec-9d53-20371e9be607', 1623439902000);
    expect(result.expires).toBe(1623440202); expect(result.url).toContain('https://player.mediadelivery.net/embed/759/');
  });
  it('rejects absent signing secret', async () => { await expect(signedEmbed('', '759', '32d140e2-e4f4-4eec-9d53-20371e9be607')).rejects.toThrow(); });
  it('encrypts mappings and fails on the wrong secret', async () => {
    const id = '32d140e2-e4f4-4eec-9d53-20371e9be607'; const encoded = await encryptGuid(id, 'fixture');
    expect(encoded).not.toContain(id); expect(await decryptGuid(encoded, 'fixture')).toBe(id);
    await expect(decryptGuid(encoded, 'wrong')).rejects.toThrow();
  });
  it('rejects provider cross-library video', () => { expect(() => safeVideo({ guid: '32d140e2-e4f4-4eec-9d53-20371e9be607', videoLibraryId: 2, status: 4 }, '1')).toThrow(); });
  it('accepts only ready status 4', () => { expect(safeVideo({ guid: '32d140e2-e4f4-4eec-9d53-20371e9be607', videoLibraryId: 1, status: 3 }, '1').ready).toBe(false); });
  it('does not grant anonymous mapping access and keeps RLS enabled', () => {
    expect(sql).toContain('ALTER TABLE public.lesson_bunny_videos ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('GRANT SELECT,INSERT,UPDATE,DELETE ON public.lesson_bunny_videos TO authenticated');
    expect(sql).not.toMatch(/GRANT[^;]+lesson_bunny_videos TO anon/);
  });
  it('requires server-admin mapping and draft lesson in the database', () => { expect(sql).toContain("public.has_role(auth.uid(),'admin')"); expect(sql).toContain("l.status='draft'"); });
  it('rejects absent or revoked session and unregistered browser', () => { expect(sql).toContain('FROM auth.sessions'); expect(sql).toContain('session_id=sid AND revoked_at IS NOT NULL'); expect(sql).toContain('token_hash=p_hash AND revoked_at IS NULL'); });
  it('requires lesson/course/enrollment ownership and unexpired access', () => { expect(sql).toContain("l.status='published'"); expect(sql).toContain('e.user_id=auth.uid()'); expect(sql).toContain('e.course_id=c.id'); expect(sql).toContain('e.expires_at>now()'); expect(sql).toContain('e.revoked_at IS NULL'); });
  it('missing security verification or mapping cannot yield playback', () => { expect(sql).toContain("interval '24 hours'"); expect(sql).toContain('AND direct_media_denied'); expect(sql).toContain('JOIN public.lessons l ON l.id=v.lesson_id'); });
  it('binds verification to the mapped library', () => { expect(readFileSync('drizzle/migrations/0009_bind_bunny_security_to_library.sql', 'utf8')).toContain('s.library_id=v.library_id'); });
});