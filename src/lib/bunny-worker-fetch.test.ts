import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Cloudflare Workers reject fetch({ redirect: 'error' }); every provider call must use 'manual'.
describe('Bunny server fetches are Worker-compatible', () => {
  for (const file of ['src/lib/bunny-video.server.ts', 'src/lib/bunny-health.server.ts']) {
    it(`${file} never uses redirect: 'error'`, () => {
      expect(readFileSync(file, 'utf8')).not.toMatch(/redirect:\s*'error'/);
    });
  }
});
