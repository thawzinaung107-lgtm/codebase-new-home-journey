import { describe, it, expect } from 'vitest';
import { statusTone, reorderSteps } from './lesson-status';
describe('lesson status chips',()=>{
  it('maps labels',()=>{expect(statusTone('Published')).toBe('published');expect(statusTone('Ready · draft')).toBe('ready');expect(statusTone('Processing · 40%')).toBe('progress');expect(statusTone('Video failed — upload again')).toBe('failed');expect(statusTone('Published details · video unavailable')).toBe('failed');expect(statusTone('Waiting for video')).toBe('none');});
  it('computes drag moves',()=>{expect(reorderSteps(3,0)).toEqual({direction:'up',count:3});expect(reorderSteps(0,2)).toEqual({direction:'down',count:2});expect(reorderSteps(1,1)).toBeNull();});
});
