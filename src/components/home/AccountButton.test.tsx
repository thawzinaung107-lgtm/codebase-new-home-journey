import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ oauth: vi.fn(), toast: vi.fn(), loaded: vi.fn() }));
vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock('sonner', () => ({ toast: mocks.toast }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { signOut: vi.fn() } } }));
vi.mock('@/integrations/lovable/index', () => {
  mocks.loaded();
  return { lovable: { auth: { signInWithOAuth: mocks.oauth } } };
});
import { AccountButton } from './AccountButton';
beforeEach(() => { vi.clearAllMocks(); });
it('defers the optional Google SDK until sign-in and retains the same-origin redirect', async () => {
  mocks.oauth.mockResolvedValue({ error: null });
  render(<AccountButton />);
  expect(mocks.loaded).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Google sign in' }));
  await waitFor(() => expect(mocks.oauth).toHaveBeenCalledWith('google', { redirect_uri: window.location.origin }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Google sign in' })).not.toBeDisabled());
});