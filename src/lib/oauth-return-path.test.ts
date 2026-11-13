import { describe, expect, it } from 'vitest';
import { oauthReturnPath } from './oauth-return-path';
describe('OAuth local return destinations', () => {
  it('preserves the authorization query and fragment', () => {
    expect(oauthReturnPath('/.lovable/oauth/consent?authorization_id=abc#decision')).toBe('/.lovable/oauth/consent?authorization_id=abc#decision');
  });
  it.each(['//outside.invalid', '/\\outside.invalid', '/\noutside.invalid', 'https://outside.invalid', null])('rejects unsafe destinations %s', value => {
    expect(oauthReturnPath(value)).toBe('/');
  });
});