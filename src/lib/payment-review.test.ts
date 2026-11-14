import { describe, it, expect } from 'vitest';
import { expiryFromDays, codeMessage, pendingCount } from './payment-review';
describe('payment review helpers',()=>{
  it('adds whole days to the expiry',()=>{expect(expiryFromDays(30,new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-31T00:00:00.000Z');});
  it('message contains code, course and expiry date',()=>{const m=codeMessage({name:'Aye',course:'AI Strategy',code:'ABCD-1234',expires:'2026-01-31T00:00:00Z'});expect(m).toContain('ABCD-1234');expect(m).toContain('"AI Strategy"');expect(m).toContain('31 Jan 2026');expect(m).toContain('Hello Aye');});
  it('counts only pending orders',()=>{expect(pendingCount([{status:'pending'},{status:'approved'},{status:'pending'}])).toBe(2);});
});
