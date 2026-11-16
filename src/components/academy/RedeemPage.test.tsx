import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks=vi.hoisted(()=>({redeem:vi.fn(),invalidate:vi.fn(),success:vi.fn(),error:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({useServerFn:()=>mocks.redeem,createServerFn:()=>{const b={middleware:()=>b,inputValidator:()=>b,handler:()=>vi.fn()};return b;}}));
vi.mock('@tanstack/react-query',()=>({useQueryClient:()=>({invalidateQueries:mocks.invalidate}),useSuspenseQuery:vi.fn(),queryOptions:(v:unknown)=>v}));
vi.mock('@tanstack/react-router',()=>({Link:({children}:any)=><a href="/my-courses">{children}</a>}));
vi.mock('./Workspace',()=>({Workspace:({children}:any)=><main>{children}</main>,EmptyState:()=>null,Stat:()=>null}));
vi.mock('./SamplePlayback',()=>({SamplePlayback:()=>null}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:{}}));
vi.mock('sonner',()=>({toast:{success:mocks.success,error:mocks.error}}));
import { RedeemPage } from './StudentPages';

beforeEach(()=>{vi.clearAllMocks();mocks.invalidate.mockResolvedValue(undefined);});
it('blocks overlapping form requests before the first redemption resolves',async()=>{
  let finish:((value:unknown)=>void)|undefined;
  mocks.redeem.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  render(<RedeemPage/>);
  const input=screen.getByLabelText('Redeem code');fireEvent.change(input,{target:{value:'AMA-TEST-CODE-123456'}});
  const form=input.closest('form');if(!form)throw new Error('Missing form');
  fireEvent.submit(form);fireEvent.submit(form);
  expect(mocks.redeem).toHaveBeenCalledTimes(1);
  await act(async()=>{finish?.({id:'enrollment',alreadyRedeemed:false});});
  await waitFor(()=>expect(mocks.invalidate).toHaveBeenCalledWith({queryKey:['student']}));
});
it('keeps committed success when the subsequent course list refresh fails',async()=>{
  mocks.redeem.mockResolvedValue({id:'enrollment',alreadyRedeemed:true});mocks.invalidate.mockRejectedValue(new Error('refresh failed'));
  render(<RedeemPage/>);
  const input=screen.getByLabelText('Redeem code');fireEvent.change(input,{target:{value:'AMA-TEST-CODE-123456'}});
  const form=input.closest('form');if(!form)throw new Error('Missing form');fireEvent.submit(form);
  await waitFor(()=>expect(mocks.success).toHaveBeenCalledTimes(1));
  expect(input).toHaveValue('');expect(mocks.redeem).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('link')).toHaveAttribute('href','/my-courses');
});